import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ponytail: client-only auth for a localStorage demo; anyone with devtools can edit it. Move to a real backend before taking payments.
async function hash(email, password) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${email}:${password}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const register = createAsyncThunk('auth/register', async (form, { getState, rejectWithValue }) => {
  const email = form.email.trim().toLowerCase();
  if (!form.name.trim()) return rejectWithValue('Please enter your name');
  if (!/^\S+@\S+\.\S+$/.test(email)) return rejectWithValue('Please enter a valid email');
  if (form.password.length < 6) return rejectWithValue('Password must be at least 6 characters');
  if (getState().auth.users[email]) return rejectWithValue('An account with this email already exists');
  return {
    name: form.name.trim(),
    email,
    college: form.college.trim(),
    passwordHash: await hash(email, form.password),
  };
});

export const login = createAsyncThunk('auth/login', async (form, { getState, rejectWithValue }) => {
  const email = form.email.trim().toLowerCase();
  const user = getState().auth.users[email];
  if (!user || user.passwordHash !== (await hash(email, form.password))) {
    return rejectWithValue('Wrong email or password');
  }
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { users: {}, currentEmail: null },
  reducers: {
    logout: (state) => {
      state.currentEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, { payload }) => {
        state.users[payload.email] = payload;
        state.currentEmail = payload.email;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.currentEmail = payload.email;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectUser = (state) => state.auth.users[state.auth.currentEmail] ?? null;
export default authSlice.reducer;
