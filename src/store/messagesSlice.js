import { createSlice, nanoid } from '@reduxjs/toolkit';

// Support tickets from the contact form.
// items: [{ id, name, email, subject, message, status: 'open' | 'resolved', reply, createdAt }]
const messagesSlice = createSlice({
  name: 'messages',
  initialState: { items: [] },
  reducers: {
    addMessage: {
      reducer: (state, { payload }) => {
        state.items.unshift(payload);
      },
      prepare: (m) => ({ payload: { subject: 'General', ...m, id: nanoid(), status: 'open', reply: '', createdAt: new Date().toISOString() } }),
    },
    replyMessage: (state, { payload: { id, reply } }) => {
      const m = state.items.find((x) => x.id === id);
      if (m) Object.assign(m, { reply, status: 'resolved' });
    },
    setMessageStatus: (state, { payload: { id, status } }) => {
      const m = state.items.find((x) => x.id === id);
      if (m) m.status = status;
    },
  },
});

export const { addMessage, replyMessage, setMessageStatus } = messagesSlice.actions;
export const selectMyMessages = (state) => state.messages.items.filter((m) => m.email === state.auth.currentEmail);
export default messagesSlice.reducer;
