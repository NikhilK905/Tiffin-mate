import { createSlice, nanoid } from '@reduxjs/toolkit';

// items: [{ id, email, name, date: 'YYYY-MM-DD', meal: 'lunch' | 'dinner', rating: 1-5, comment, createdAt }]
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: { items: [] },
  reducers: {
    addFeedback: {
      reducer: (state, { payload }) => {
        // one rating per user per meal per day: replace an earlier one
        state.items = state.items.filter((f) => !(f.email === payload.email && f.date === payload.date && f.meal === payload.meal));
        state.items.push(payload);
      },
      prepare: (f) => ({ payload: { ...f, id: nanoid(), createdAt: new Date().toISOString() } }),
    },
  },
});

export const { addFeedback } = feedbackSlice.actions;
export const selectMyFeedback = (state) => state.feedback.items.filter((f) => f.email === state.auth.currentEmail);
export default feedbackSlice.reducer;
