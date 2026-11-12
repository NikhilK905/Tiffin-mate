import { configureStore } from '@reduxjs/toolkit';
import auth, { ADMIN } from './authSlice';
import subscription from './subscriptionSlice';
import catalog, { initialState as catalogInitial } from './catalogSlice';
import feedback from './feedbackSlice';
import notifications from './notificationsSlice';
import messages from './messagesSlice';

const KEY = 'tiffin-state';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return undefined;
    // Saved auth may predate the seeded admin, so always put it back.
    return {
      ...saved,
      auth: { ...saved.auth, users: { ...saved.auth.users, [ADMIN.email]: ADMIN } },
      catalog: { ...catalogInitial, overrides: saved.catalog?.overrides ?? {} },
    };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { auth, subscription, catalog, feedback, notifications, messages },
  preloadedState: load(),
});

// Plans and menu are refetched each visit; only admin overrides are persisted for the catalog.
store.subscribe(() => {
  const { catalog, ...rest } = store.getState();
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...rest, catalog: { overrides: catalog.overrides } }));
  } catch {
    // storage full or blocked: keep running in memory
  }
});
