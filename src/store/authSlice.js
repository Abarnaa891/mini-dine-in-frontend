import { createSlice } from '@reduxjs/toolkit';

const storedToken = localStorage.getItem('token');
const storedUser  = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken || null,
    user:  storedUser ? JSON.parse(storedUser) : null,
  },
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearAuth(state) {
      state.token = null;
      state.user  = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;