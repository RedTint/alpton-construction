import { useCallback, useEffect, useState } from 'react';
import type { BoardData } from '@/types/board.types';
import { BoardApiError, fetchBoardData } from '@/services/boardApi';

interface UseBoardDataReturn {
    data: BoardData | null;
    loading: boolean;
    error: string | null;
    is503: boolean;
    refetch: () => Promise<void>;
}

export function useBoardData(): UseBoardDataReturn {
    const [data, setData] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [is503, setIs503] = useState(false);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        setIs503(false);
        try {
            const boardData = await fetchBoardData();
            setData(boardData);
        } catch (err) {
            if (err instanceof BoardApiError && err.status === 503) {
                setIs503(true);
                setError('Board data not generated. Run /sync-board first.');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch board data');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    return { data, loading, error, is503, refetch };
}
