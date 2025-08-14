import { use$ } from '@legendapp/state/react';
import { bibleState$ } from '@/state/bibleState';
import { useMemo } from 'react';

export const useDatabaseLoadingModal = () => {
    const progress = use$(() => bibleState$.databaseProgress.get());
    const isDataLoading = use$(() => bibleState$.isDataLoading.top.get());

    const isVisible = useMemo(() => {
        return isDataLoading && progress.percentage > 0 && progress.percentage < 100;
    }, [isDataLoading, progress.percentage]);

    const resetProgress = () => {
        bibleState$.databaseProgress.set({
            stage: 'preparing',
            message: '',
            percentage: 0,
            databaseName: ''
        });
    };

    return {
        isVisible,
        progress: isVisible ? progress : null,
        resetProgress
    };
};
