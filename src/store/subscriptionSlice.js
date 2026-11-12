import { createSlice } from '@reduxjs/toolkit';

// Rules live in lib/subscription.js; this slice only stores the result, keyed by user email.
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { byEmail: {} },
  reducers: {
    setSubscription: (state, { payload }) => {
      state.byEmail[payload.email] = payload.sub;
    },
  },
});

export const { setSubscription } = subscriptionSlice.actions;
export const selectSubscription = (state) => state.subscription.byEmail[state.auth.currentEmail] ?? null;
export default subscriptionSlice.reducer;
