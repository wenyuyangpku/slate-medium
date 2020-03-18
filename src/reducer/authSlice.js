import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "auth",
  initialState: {
    login: false,
    openLoginControl: false
  },
  reducers: {
    toLogin: (state, action) => {
      state.openLoginControl = action.payload;
    }
  }
});

export const { toLogin } = slice.actions;

export const selectAuth = state => state.auth;

export default slice.reducer;
