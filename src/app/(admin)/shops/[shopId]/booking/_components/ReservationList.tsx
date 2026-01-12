'use client';

import { useState } from 'react';
import { Plus, UserCheck, X, Phone, Clock, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useReservations } from '@/hooks/useReservations';
import { getErrorMessage } from '@/lib/errors';
import type { Reservation, ReservationStatus, ReservationSource } from '@/types';

interface ReservationListProps {
  shopId: string;
  initialReservations: Reservation[];
  tables: string[];
}

const statusConfig: Record<ReservationStatus, { label: string; color: string }> = {
  '待入座': { label: '待入座', color: 'text-orange-600 bg-orange-50' },
  '已入座': { label: '已入座', color: 'text-green-600 bg-green-50' },
  '已取消': { label: '已取消', color: 'text-slate-400 bg-slate-50' },
};

export function ReservationList({ shopId, initialReservations, tables }: ReservationListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');

  // Use SWR hook with auto-refresh (replaces manual state management)
  const {
    reservations: swrReservations,
    error,
    createReservation,
    updateReservationStatus,
  } = useReservations(shopId);

  // Use SWR data if available, fallback to initial data
  const reservations = swrReservations.length > 0 ? swrReservations : initialReservations;

  // Form state
  const [formData, setFormData] = useState({
    tableNo: '',
    phone: '',
    time: '',
    source: '現場' as ReservationSource,
  });

  const handleAddReservation = async () => {
    if (!formData.tableNo || !formData.time) return;

    try {
      await createReservation({
        shopId,
        ...formData,
        status: '待入座',
      });
      setShowAddForm(false);
      setFormData({ tableNo: '', phone: '', time: '', source: '現場' });
    } catch (err) {
      console.error('新增訂位失敗:', getErrorMessage(err));
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    try {
      await updateReservationStatus(id, status);
    } catch (err) {
      console.error('更新訂位狀態失敗:', getErrorMessage(err));
    }
  };

  // Show error state
  if (error) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <CardContent>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">{getErrorMessage(error)}</p>
          <p className="text-slate-500 text-sm mt-2">系統將自動重試</p>
        </CardContent>
      </Card>
    );
  }

  const filteredReservations = reservations
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => (a.time > b.time ? 1 : -1));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            全部 ({reservations.length})
          </Button>
          <Button
            size="sm"
            variant={filter === '待入座' ? 'primary' : 'outline'}
            onClick={() => setFilter('待入座')}
          >
            待入座 ({reservations.filter((r) => r.status === '待入座').length})
          </Button>
          <Button
            size="sm"
            variant={filter === '已入座' ? 'primary' : 'outline'}
            onClick={() => setFilter('已入座')}
          >
            已入座 ({reservations.filter((r) => r.status === '已入座').length})
          </Button>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          新增訂位
        </Button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-xl">
            <CardContent>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">新增訂位</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">桌號</label>
                  <select
                    value={formData.tableNo}
                    onChange={(e) => setFormData({ ...formData, tableNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選擇桌號</option>
                    {tables.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">預約時間</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">電話</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="選填"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">來源</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.source === '預訂'}
                        onChange={() => setFormData({ ...formData, source: '預訂' })}
                        className="mr-2"
                      />
                      預訂
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.source === '現場'}
                        onChange={() => setFormData({ ...formData, source: '現場' })}
                        className="mr-2"
                      />
                      現場
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleAddReservation}
                  disabled={!formData.tableNo || !formData.time}
                >
                  確認
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <p className="text-slate-500">沒有訂位記錄</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((reservation) => {
            const config = statusConfig[reservation.status];
            return (
              <Card key={reservation.id} variant="outlined">
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{reservation.tableNo}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{reservation.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-400">{reservation.source}</span>
                      </div>
                      {reservation.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {reservation.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {reservation.status === '待入座' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(reservation.id, '已入座')}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          入座
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(reservation.id, '已取消')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {reservation.status === '已入座' && reservation.checkInTime && (
                      <span className="text-sm text-slate-500">
                        入座於 {new Date(reservation.checkInTime).toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
