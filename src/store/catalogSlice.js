import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.BASE_URL}data` });

export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  const [plans, menu] = await Promise.all([api.get('/plans.json'), api.get('/menu.json')]);
  return { plans: plans.data, menu: menu.data };
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: { plans: [], menu: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCatalog.fulfilled, (state, { payload }) => ({ ...payload, status: 'ready' }))
      .addCase(fetchCatalog.rejected, (state) => {
        state.status = 'error';
      });
  },
});

export default catalogSlice.reducer;
