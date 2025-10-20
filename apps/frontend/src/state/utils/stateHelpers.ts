import { useQueryClient } from '@tanstack/react-query';
import { stateKeys } from './queryKeys';

export class StateManager {
    constructor(private queryClient: ReturnType<typeof useQueryClient>) { }

    getData<T>(key: readonly string[]): T | undefined {
        return this.queryClient.getQueryData<T>(key);
    }

    setData<T>(key: readonly string[], data: T): void {
        this.queryClient.setQueryData(key, data);
    }

    updateData<T>(key: readonly string[], updater: (prev: T | undefined) => T): void {
        this.queryClient.setQueryData(key, updater);
    }

    removeData(key: readonly string[]): void {
        this.queryClient.removeQueries({ queryKey: key });
    }

    hasData(key: readonly string[]): boolean {
        return this.queryClient.getQueryData(key) !== undefined;
    }

    isLoading(key: readonly string[]): boolean {
        return this.queryClient.isFetching({ queryKey: key }) > 0;
    }

    invalidate(key: readonly string[]): void {
        this.queryClient.invalidateQueries({ queryKey: key });
    }

    clearNamespace(namespace: readonly string[]): void {
        this.queryClient.removeQueries({ queryKey: namespace });
    }
}

export const useStateManager = () => {
    const queryClient = useQueryClient();
    return new StateManager(queryClient);
};

export const createStateHook = <T>(
    key: readonly string[],
    defaultValue: T
) => {
    return () => {
        const stateManager = useStateManager();
        const data = stateManager.getData<T>(key) ?? defaultValue;
        const isLoading = stateManager.isLoading(key);

        const setData = (newData: T | ((prev: T) => T)) => {
            if (typeof newData === 'function') {
                stateManager.updateData(key, newData as (prev: T | undefined) => T);
            } else {
                stateManager.setData(key, newData);
            }
        };

        const clearData = () => {
            stateManager.removeData(key);
        };

        return {
            data,
            setData,
            clearData,
            isLoading,
        };
    };
};


export const createPersistentStateHook = <T>(
    key: readonly string[],
    storageKey: string,
    defaultValue: T
) => {
    return () => {
        const stateManager = useStateManager();

        const cachedData = stateManager.getData<T>(key);
        const storedData = cachedData ?? (() => {
            try {
                const item = localStorage.getItem(storageKey);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        })();

        const setData = (data: T) => {
            stateManager.setData(key, data);
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        };

        const clearData = () => {
            stateManager.removeData(key);
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
            }
        };

        return {
            data: storedData,
            setData,
            clearData,
            isLoading: stateManager.isLoading(key),
        };
    };
};
