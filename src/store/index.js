import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import subscription from './subscriptionSlice';
import catalog from './catalogSlice';

const KEY = 'tiffin-state';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? undefined;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { auth, subscription, catalog },
  preloadedState: load(),
});

// Catalog is refetched each visit, so only user data is persisted.
store.subscribe(() => {
  const { auth, subscription } = store.getState();
  try {
    localStorage.setItem(KEY, JSON.stringify({ auth, subscription }));
  } catch {
    // storage full or blocked: keep running in memory
  }
});
