import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ponytail: client-only auth for a localStorage demo; anyone with devtools can edit it. Move to a real backend before taking payments.
async function hash(email, password) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${email}:${password}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ponytail: demo-only seeded admin (admin@tiffinmate.in / admin123). A real app needs server-side roles and no shared password in the bundle.
export const ADMIN = {
  name: 'Admin',
  email: 'admin@tiffinmate.in',
  college: '',
  role: 'admin',
  passwordHash: 'f6b87d064dee22d4ff570de28413c2e34df6548f5c4647e57d1aaa57ed77268b',
};

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
    role: 'student',
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

export const changePassword = createAsyncThunk('auth/changePassword', async ({ current, next }, { getState, rejectWithValue }) => {
  const { users, currentEmail } = getState().auth;
  if (users[currentEmail]?.passwordHash !== (await hash(currentEmail, current))) return rejectWithValue('Current password is wrong');
  if (next.length < 6) return rejectWithValue('New password must be at least 6 characters');
  return hash(currentEmail, next);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { users: { [ADMIN.email]: ADMIN }, currentEmail: null },
  reducers: {
    logout: (state) => {
      state.currentEmail = null;
    },
    // payload: any of { name, college, phone, diet: 'veg' | 'nonveg' | 'jain' }; email and role never change here
    updateProfile: (state, { payload: { name, college, phone, diet } }) => {
      const user = state.users[state.currentEmail];
      if (user) Object.assign(user, Object.fromEntries(Object.entries({ name, college, phone, diet }).filter(([, v]) => v !== undefined)));
    },
  },
  extraReducers: (builder) => {
    builder
      // register({ ...form, byAdmin: true }) adds the account without switching to it.
      .addCase(register.fulfilled, (state, { payload, meta }) => {
        state.users[payload.email] = payload;
        if (!meta.arg.byAdmin) state.currentEmail = payload.email;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.currentEmail = payload.email;
      })
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        state.users[state.currentEmail].passwordHash = payload;
      });
  },
});

export const { logout, updateProfile } = authSlice.actions;
export const selectUser = (state) => state.auth.users[state.auth.currentEmail] ?? null;
export const selectIsAdmin = (state) => selectUser(state)?.role === 'admin';
export default authSlice.reducer;
