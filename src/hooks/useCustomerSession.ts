'use client';

import { useState, useEffect } from 'react';

// Simple hash function for client-side use
function generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

interface UseCustomerSessionReturn {
    nickname: string;
    guestId: string;
    isInitialized: boolean;
    setNickname: (name: string) => void;
}

export function useCustomerSession(tableNo: string, shopId: string): UseCustomerSessionReturn {
    const [nickname, setNicknameState] = useState<string>('');
    const [guestId, setGuestId] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from localStorage
    useEffect(() => {
        const storedName = localStorage.getItem(`smartorder:nickname:${shopId}`);
        if (storedName) {
            setNicknameState(storedName);
            // Generate guestId immediately if name exists
            const userAgent = navigator.userAgent;
            const rawId = `${shopId}-${tableNo}-${userAgent}-${storedName}`;
            setGuestId(generateHash(rawId));
        }
        setIsInitialized(true);
    }, [shopId, tableNo]);

    const setNickname = (name: string) => {
        localStorage.setItem(`smartorder:nickname:${shopId}`, name);
        setNicknameState(name);

        const userAgent = navigator.userAgent;
        const rawId = `${shopId}-${tableNo}-${userAgent}-${name}`;
        setGuestId(generateHash(rawId));
    };

    return {
        nickname,
        guestId,
        isInitialized,
        setNickname,
    };
}
