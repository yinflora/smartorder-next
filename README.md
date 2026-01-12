# SmartOrder - AI 智慧點餐系統

SmartOrder 是一個基於 Next.js 15 的全棧應用程式，提供餐廳智慧點餐解決方案，整合 AI 菜單解析、QR Code 掃碼點餐、訂位管理與訂單追蹤功能。

## 功能特色

### 🤖 AI 菜單解析
- 上傳菜單照片，由 Google Gemini 2.0 Flash 自動識別
- 自動解析品牌名稱、菜品分類與價格
- 三步驟快速建立電子菜單

### 📱 QR Code 掃碼點餐
- 為每個桌號自動生成專屬 QR Code
- 客戶掃碼即可進入點餐頁面
- 安全雜湊驗證機制，防止未授權訪問

### 📋 訂單管理
- 即時接收客戶訂單（5 秒自動刷新）
- 訂單狀態追蹤：新訂單 → 已上菜 → 已結帳
- 依店舖、桌號篩選訂單

### 📅 訂位管理
- 支援電話預訂與現場候位
- 預約狀態管理：待入座 / 已入座 / 已取消
- 記錄簽到時間

### 📊 報表分析
- 店舖營運數據概覽
- 訂單統計與分析

## 技術棧

| 類別 | 技術 |
|------|------|
| **框架** | Next.js 15 (App Router) |
| **前端** | React 19, TypeScript 5 |
| **樣式** | Tailwind CSS 4 |
| **UI 元件** | Lucide React (圖標) |
| **數據獲取** | SWR 2.3 |
| **QR Code** | qrcode.react |
| **AI 模型** | Google Gemini 2.0 Flash |
| **數據存儲** | JSON 檔案（開發環境） |

## 快速開始

### 環境需求

- Node.js 18+
- npm / yarn / pnpm

### 安裝步驟

1. **Clone 專案**
   ```bash
   git clone <repository-url>
   cd smartorder-next
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **設定環境變數**

   建立 `.env.local` 檔案：
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > 可從 [Google AI Studio](https://aistudio.google.com/apikey) 取得 Gemini API Key

4. **啟動開發伺服器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

5. **開啟瀏覽器**

   訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
src/
├── app/                        # Next.js App Router
│   ├── (admin)/               # 管理後台
│   │   └── shops/[shopId]/    # 店舖管理
│   │       ├── menu/          # 菜單管理
│   │       ├── booking/       # 訂位管理
│   │       ├── orders/        # 訂單管理
│   │       └── reports/       # 報表分析
│   ├── (customer)/            # 客戶前台
│   │   └── order/[shopId]/[tableNo]/[hash]/  # 點餐頁面
│   └── api/                   # RESTful API
│       ├── shops/             # 店舖 API
│       ├── orders/            # 訂單 API
│       ├── reservations/      # 預約 API
│       ├── tables/            # 桌號 API
│       └── ai/parse-menu/     # AI 菜單解析 API
├── components/                # 共用元件
│   ├── ui/                    # UI 基礎元件
│   └── layout/                # 版面元件
├── hooks/                     # 自訂 React Hooks
├── services/                  # 業務邏輯層
├── lib/
│   ├── api/                   # API 客戶端
│   ├── repositories/          # 數據存取層
│   └── utils/                 # 工具函式
├── providers/                 # React Context Providers
└── types/                     # TypeScript 型別定義

data/                          # JSON 數據檔案
├── shops.json
├── menus.json
├── orders.json
├── reservations.json
└── tables.json
```

## API 端點

### 店舖管理
| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/shops` | 取得所有店舖 |
| POST | `/api/shops` | 建立新店舖 |
| GET | `/api/shops/{shopId}` | 取得單個店舖 |
| PUT | `/api/shops/{shopId}` | 更新店舖 |
| DELETE | `/api/shops/{shopId}` | 刪除店舖 |

### 菜單管理
| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/shops/{shopId}/menu` | 取得店舖菜單 |
| PUT | `/api/shops/{shopId}/menu` | 更新菜單 |

### 訂單管理
| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/orders?shopId=xxx` | 取得訂單列表 |
| POST | `/api/orders` | 建立訂單 |
| PATCH | `/api/orders/{orderId}` | 更新訂單狀態 |
| DELETE | `/api/orders/{orderId}` | 刪除訂單 |

### 訂位管理
| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/reservations?shopId=xxx` | 取得預約列表 |
| POST | `/api/reservations` | 建立預約 |
| PATCH | `/api/reservations/{reservationId}` | 更新預約狀態 |
| DELETE | `/api/reservations/{reservationId}` | 刪除預約 |

### AI 功能
| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/api/ai/parse-menu` | AI 解析菜單圖片 |

## 使用流程

### 店主操作流程

1. **建立店舖** - 在首頁點擊「新增店舖」
2. **設定菜單** - 上傳菜單照片，AI 自動解析後進行編輯
3. **設定桌號** - 輸入餐廳桌號（如：A1, A2, B1）
4. **發布菜單** - 系統自動為每個桌號生成 QR Code
5. **管理訂單** - 在訂單頁面查看並處理客戶訂單

### 客戶點餐流程

1. **掃描 QR Code** - 使用手機掃描桌上 QR Code
2. **瀏覽菜單** - 查看菜品分類與價格
3. **加入購物車** - 選擇餐點並設定數量
4. **提交訂單** - 確認後送出訂單

## 數據模型

### 主要實體

- **Shop** - 店舖資訊
- **ShopMenu** - 店舖菜單（一店一菜單）
- **MenuItem** - 菜單項目
- **Order** - 訂單
- **Reservation** - 訂位
- **Table** - 桌號

## 開發指令

```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm run start

# 程式碼檢查
npm run lint
```

## 環境變數

| 變數名稱 | 說明 | 必填 |
|----------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 金鑰 | 是（使用 AI 功能時） |

