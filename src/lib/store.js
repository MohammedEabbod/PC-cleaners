import { writable } from 'svelte/store';

// Persist to localStorage helper
const createPersistentStore = (key, startValue) => {
    const storedValue = localStorage.getItem(key);
    const initial = storedValue ? JSON.parse(storedValue) : startValue;
    const store = writable(initial);

    store.subscribe(value => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
};

export const user = createPersistentStore('pc_cleaners_user', null);
export const currentScreen = writable('start'); // start, services, payment
export const selectedService = writable(null);
export const serviceMode = writable('shop'); // shop, home
export const locationData = writable(null);
export const orderDetails = createPersistentStore('pc_cleaners_last_order', null);
