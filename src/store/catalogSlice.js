import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.BASE_URL}data` });

export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  const [plans, menu] = await Promise.all([api.get('/plans.json'), api.get('/menu.json')]);
  return { plans: plans.data, menu: menu.data };
});

// overrides holds admin edits ({ plans?, menu? }); they win over the fetched JSON and are persisted by store/index.js.
export const initialState = { plans: [], menu: [], status: 'idle', overrides: {} };

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    savePlans: (state, { payload }) => {
      state.plans = state.overrides.plans = payload;
    },
    saveMenu: (state, { payload }) => {
      state.menu = state.overrides.menu = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCatalog.fulfilled, (state, { payload }) => ({
        ...state,
        plans: state.overrides.plans ?? payload.plans,
        menu: state.overrides.menu ?? payload.menu,
        status: 'ready',
      }))
      .addCase(fetchCatalog.rejected, (state) => {
        state.status = 'error';
      });
  },
});

export const { savePlans, saveMenu } = catalogSlice.actions;
export default catalogSlice.reducer;
