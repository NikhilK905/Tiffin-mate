import { createSlice, nanoid } from '@reduxjs/toolkit';

// announcements: [{ id, title, body, createdAt }] posted by admin, newest first
// readByEmail: { [email]: [announcementId, ...] }
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    announcements: [
      {
        id: 'welcome',
        title: 'Welcome to DabbaDost!',
        body: 'Skip any day before midnight and it is added to the end of your month.',
        createdAt: '2026-11-01T09:00:00.000Z',
      },
    ],
    readByEmail: {},
  },
  reducers: {
    addAnnouncement: {
      reducer: (state, { payload }) => {
        state.announcements.unshift(payload);
      },
      prepare: ({ title, body }) => ({ payload: { id: nanoid(), title, body, createdAt: new Date().toISOString() } }),
    },
    deleteAnnouncement: (state, { payload: id }) => {
      state.announcements = state.announcements.filter((a) => a.id !== id);
    },
    markAllRead: (state, { payload: email }) => {
      state.readByEmail[email] = state.announcements.map((a) => a.id);
    },
  },
});

export const { addAnnouncement, deleteAnnouncement, markAllRead } = notificationsSlice.actions;
export const selectUnreadCount = (state) => {
  const read = state.notifications.readByEmail[state.auth.currentEmail] ?? [];
  return state.notifications.announcements.filter((a) => !read.includes(a.id)).length;
};
export default notificationsSlice.reducer;
