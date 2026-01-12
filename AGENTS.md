# AGENTS.md

本文件為 AI 程式碼助理（Claude、Copilot、Cursor 等）提供 SmartOrder 專案的開發指南。

## 專案概述

SmartOrder 是一個基於 Next.js 15 (App Router)、React 19 和 TypeScript 的 AI 智慧點餐系統。它讓餐廳能透過 AI 解析建立電子菜單、為每桌生成 QR Code 點餐，並管理訂單與訂位。

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 前端 | React 19, TypeScript 5 |
| 樣式 | Tailwind CSS 4 |
| 資料獲取 | SWR 2.3 |
| AI | Google Gemini 2.0 Flash |
| 儲存 | JSON 檔案（開發環境） |

## 架構

### 目錄結構

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理後台（路由群組）
│   ├── (customer)/        # 客戶前台（路由群組）
│   ├── api/               # RESTful API 路由
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全域樣式
├── types/                 # TypeScript 型別定義
├── lib/
│   ├── repositories/      # 資料存取層（Repository 模式）
│   ├── api/              # API 客戶端
│   ├── errors.ts         # 自訂錯誤類別
│   └── utils/            # 工具函式
├── services/             # 業務邏輯層
├── hooks/                # React 自訂 hooks（客戶端）
├── components/           # React 元件
│   ├── ui/              # 基礎 UI 元件
│   └── layout/          # 版面元件
└── providers/           # React context providers

data/                     # JSON 資料儲存（僅限開發環境）
```

### 設計模式

#### 1. Repository 模式（資料存取層）
位置：`src/lib/repositories/`

所有資料存取都透過 repository 進行。每個 repository 實作共同介面：

```typescript
interface Repository<T, CreateInput, UpdateInput> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}
```

**重要**：新增資料操作時，務必使用 repository。切勿在 `json-storage.ts` 以外直接讀寫 JSON 檔案。

#### 2. Service 層（業務邏輯）
位置：`src/services/`

Service 包含業務邏輯並呼叫 repository。範例：
- 級聯刪除（刪除店舖時一併移除其菜單、訂單、訂位、桌號）
- 訂單狀態流轉
- 菜單發布邏輯

**重要**：API 路由應呼叫 service，而非直接呼叫 repository（針對有業務規則的操作）。

#### 3. 型別定義
位置：`src/types/index.ts`

所有實體型別集中定義。使用 TypeScript 工具型別衍生 CRUD 輸入：

```typescript
// 實體
interface Order { id: string; shopId: string; ... }

// 衍生型別
type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>;
type UpdateOrderInput = Partial<Pick<Order, 'status'>>;
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| Services | `*.service.ts` | `order.service.ts` |
| Repositories | `*.repository.ts` | `menu.repository.ts` |
| Hooks | `use*.ts` | `useOrders.ts` |
| Components | PascalCase `.tsx` | `Button.tsx` |
| API Routes | `route.ts` | `app/api/orders/route.ts` |
| 私有元件 | `_components/` 資料夾 | `app/(admin)/shops/[shopId]/_components/` |

### 匯出風格

Service 和 repository 使用物件匯出：

```typescript
// 正確
export const orderService = {
  async getById(id: string) { ... },
  async create(data: CreateOrderInput) { ... },
};

// 避免使用 class 匯出
```

## API 路由

### 結構
遵循 RESTful 慣例，搭配 Next.js 動態路由：

```
api/
├── shops/
│   ├── route.ts              # GET（列表）、POST（新增）
│   └── [shopId]/
│       ├── route.ts          # GET、PUT、DELETE
│       └── menu/route.ts     # GET、PUT
├── orders/
│   ├── route.ts              # GET（支援 ?shopId=）、POST
│   └── [orderId]/route.ts    # GET、PATCH、DELETE
```

### Route Handler 模式

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;  // Next.js 15+ 非同步 params
    // ... 邏輯
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '錯誤訊息' }, { status: 500 });
  }
}
```

**重要**：在 Next.js 15+ 中，`params` 是 Promise，必須使用 await。

## 客戶端資料獲取

### SWR Hooks
位置：`src/hooks/`

使用 SWR 進行客戶端資料獲取，具備自動快取和重新驗證：

```typescript
export function useOrders(shopId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    shopId ? `/api/orders?shopId=${shopId}` : null,
    fetcher,
    { refreshInterval: 5000 }  // 每 5 秒自動刷新
  );

  // 包含樂觀更新的變更操作
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await mutate(async () => { ... }, {
      optimisticData: ...,
      rollbackOnError: true,
    });
  };

  return { orders: data, error, isLoading, updateOrderStatus };
}
```

### API 客戶端
位置：`src/lib/api/client.ts`

所有 fetch 請求使用 `apiClient`：

```typescript
import { apiClient } from '@/lib/api/client';

const orders = await apiClient.get<Order[]>('/api/orders', { params: { shopId } });
await apiClient.post('/api/orders', orderData);
await apiClient.patch(`/api/orders/${id}`, { status: 'served' });
```

## 錯誤處理

### 自訂錯誤類別
位置：`src/lib/errors.ts`

- `ApiError` - 一般 API 錯誤
- `NetworkError` - 網路錯誤
- `ValidationError` - 輸入驗證錯誤
- `NotFoundError` - 資源不存在

### 錯誤回應格式

```typescript
// API 路由應回傳一致的錯誤格式
return NextResponse.json(
  { error: '人類可讀的錯誤訊息' },
  { status: 400 }
);
```

## 程式碼風格指南

### TypeScript
- 嚴格模式已啟用（`strict: true`）
- 使用路徑別名 `@/*` 從 `src/` 匯入
- 物件形狀優先使用 `interface` 而非 `type`
- 函式參數和回傳值務必加上型別

### React 元件
- 使用函式元件搭配 hooks
- 私有元件放在 `_components/` 資料夾
- 僅在必要時使用 `'use client'` 指令

### 樣式
- 使用 Tailwind CSS 工具類別
- 避免行內樣式
- 元件特定樣式放在元件檔案中

## 資料模型參考

完整實體定義請見 `doc/data_structure.md`。

### 主要實體
- **Shop** - 餐廳/店舖
- **Table** - 店舖內的桌號
- **ShopMenu** - 店舖菜單（一對一關係）
- **MenuItem** - 個別菜品項目
- **Order** - 客戶訂單
- **OrderItem** - 訂單細項（快照價格/名稱）
- **Reservation** - 訂位

### 狀態列舉

```typescript
// 訂單狀態流程
type OrderStatus = 'new' | 'served' | 'paid';

// 訂位狀態
type ReservationStatus = '待入座' | '已入座' | '已取消';
type ReservationSource = '預訂' | '現場';
```

## 環境變數

| 變數 | 說明 | 必填 |
|------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 金鑰（用於菜單解析） | 是（使用 AI 功能時） |

環境變數僅限伺服器端使用，切勿暴露給客戶端。

## 常見任務

### 新增實體

1. 在 `src/types/index.ts` 定義型別
2. 在 `src/lib/repositories/` 建立 repository
3. 在 `src/services/` 建立 service（如有業務邏輯）
4. 在 `src/app/api/` 新增 API 路由
5. 在 `src/hooks/` 建立 SWR hook（如需客戶端存取）
6. 更新 `doc/data_structure.md`

### 新增 API 端點

1. 在適當的 `src/app/api/` 路徑建立 `route.ts`
2. 匯入 service 或 repository
3. 一致地處理錯誤
4. 回傳 JSON 回應，附上適當的狀態碼

### 新增頁面

1. 在 `src/app/(admin)/` 或 `src/app/(customer)/` 建立頁面
2. 使用 `page.tsx` 作為主元件
3. 私有元件放在 `_components/` 資料夾
4. 使用現有 hooks 或建立新的 hooks 來獲取資料

## 測試

目前尚無測試配置。新增測試時：
- 建議使用 Vitest 或 Jest
- 測試檔案放在原始碼旁（`*.test.ts`）或 `__tests__/` 資料夾
- 單元測試時 mock repository
- 整合測試時使用 MSW 模擬 API

## 重要提醒

1. **切勿直接修改 JSON 檔案** - 務必使用 repository
2. **在 API 路由中 await params** - Next.js 15+ 的要求
3. **使用樂觀更新** - 提升變更操作的使用者體驗
4. **業務邏輯放在 service** - 不要放在 API 路由或元件中
5. **為所有項目加上型別** - 善用 TypeScript 嚴格模式
6. **使用者介面文字使用繁體中文** - UI 文字應使用繁體中文
7. **程式碼使用英文** - 變數名稱、註解、commit 訊息使用英文
