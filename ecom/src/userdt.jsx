import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedin: false,
  nme: "",
  psswrd: "",
  emil: "",
  dm:false,
  user_name : ""
};

export const counterSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setuser: (state, action) => {
      state.isLoggedin = true;
      state.nme = action.payload.nme;
      state.psswrd = action.payload.psswrd;
      state.emil = action.payload.emil;
      state.dm = action.payload.dm;
      state.user_name = action.payload.user_name;
    },
    logout: (state) => {
      state.isLoggedin = false;
      state.nme = "";
      state.psswrd = "";
      state.emil = "";
      state.user_name = "";
    }
  },
});

export const { setuser, logout } = counterSlice.actions;
export default counterSlice.reducer; // ✅ Correct export
