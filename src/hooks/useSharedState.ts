import { useEffect, useState } from 'react';

class SharedState {
  private static instance: SharedState;

  private state: Record<string, any> = {};

  private listeners: Set<() => void> = new Set();

  public static getInstance(): SharedState {
    if (!SharedState.instance) {
      SharedState.instance = new SharedState();
    }
    return SharedState.instance;
  }

  public getState(key: string): any {
    return this.state[key];
  }

  public setState(key: string, value: any): void {
    this.state[key] = value;
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

const sharedState = SharedState.getInstance();

export function useSharedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(
    () => sharedState.getState(key) ?? initialValue,
  );

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setValue(sharedState.getState(key));
    });
    return unsubscribe;
  }, [key]);

  const updateValue = (newValue: T) => {
    sharedState.setState(key, newValue);
  };

  return [value, updateValue];
}
