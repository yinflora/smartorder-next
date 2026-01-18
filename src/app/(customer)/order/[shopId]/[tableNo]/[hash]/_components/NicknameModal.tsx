'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface NicknameModalProps {
    isOpen: boolean;
    onSave: (nickname: string) => void;
}

export function NicknameModal({ isOpen, onSave }: NicknameModalProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('請輸入暱稱');
            return;
        }
        onSave(name.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-slate-900 mb-2">歡迎光臨！</h2>
                <p className="text-slate-500 mb-6">請輸入您的暱稱以開始點餐</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            placeholder="例如：小明"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                            autoFocus
                        />
                        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                        開始點餐
                    </Button>
                </form>
            </div>
        </div>
    );
}
