import { useEffect, useState } from 'react';

class SharedState {
  static #instance: SharedState;

  #state: Record<string, any> = {};

  #listeners: Set<() => void> = new Set();

  constructor() {
    if (SharedState.#instance) {
      throw new Error('Use SharedState.getInstance() instead of new.');
    }
    SharedState.#instance = this;
  }

  static getInstance(): SharedState {
    if (!SharedState.#instance) {
      SharedState.#instance = new SharedState();
    }
    return SharedState.#instance;
  }

  getState(key: string): any {
    return this.#state[key];
  }

  setState(key: string, value: any): void {
    this.#state[key] = value;
    this.#notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notifyListeners(): void {
    this.#listeners.forEach((listener) => listener());
  }
}

const sharedState = new SharedState();

/**
 * Custom hook to manage shared state across tree instances.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key to identify the shared state.
 * @param {T} initialValue - The initial value of the state.
 * @returns {[T, (value: T) => void]} - Returns the current state value and a function to update the state.
 *
 * @example
 * const [value, setValue] = useSharedState('myKey', 'initialValue');
 * setValue('newValue');
 */
export default function useSharedState<T>(
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
  }, []);

  const updateValue = (newValue: T) => {
    sharedState.setState(key, newValue);
  };

  return [value, updateValue];
}
