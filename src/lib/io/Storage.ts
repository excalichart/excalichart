import { browser } from '$app/environment';
import type { Writable } from 'svelte/store';

type Store = Writable<any>;

// Get value from localStorage if in browser and the value is stored, otherwise fallback
export function storeFromLocalStorage(storageKey: string, fallbackValue: any) {
	if (browser) {
		const storedValue = window.localStorage.getItem(storageKey);
		if (storedValue !== 'undefined' && storedValue !== null) {
			return typeof fallbackValue === 'object' ? JSON.parse(storedValue) : storedValue;
		}
	}

	return fallbackValue;
}

export function storeToLocalStorage(store: Store, storageKey: string) {
	if (browser) {
		store.subscribe((value) => {
			var storageValue = typeof value === 'object' ? JSON.stringify(value) : value;
			window.localStorage.setItem(storageKey, storageValue);
		});
	}
}

export function setLocalStorage(key: string, value: any) {
	if (browser) {
		window.localStorage.setItem(key, value);
	}
}

export function storeFromSessionStorage(storageKey: string, fallbackValue: any) {
	if (browser) {
		const storedValue = window.sessionStorage.getItem(storageKey);
		if (storedValue !== 'undefined' && storedValue !== null) {
			return typeof fallbackValue === 'object' ? JSON.parse(storedValue) : storedValue;
		}
	}

	return fallbackValue;
}

export function storeToSessionStorage(store: Store, storageKey: string) {
	if (browser) {
		store.subscribe((value) => {
			var storageValue = typeof value === 'object' ? JSON.stringify(value) : value;
			window.sessionStorage.setItem(storageKey, storageValue);
		});
	}
}

export function setSessionStorage(key: string, value: any) {
	if (browser) {
		window.sessionStorage.setItem(key, value);
	}
}
