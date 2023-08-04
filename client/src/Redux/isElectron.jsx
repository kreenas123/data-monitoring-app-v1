// isElectronReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = false;

const isElectronSlice = createSlice({
  name: 'isElectron',
  initialState,
  reducers: {
    setIsElectron: (state, action) => {
      return action.payload; // Return the new value
    },
  },
});

export const { setIsElectron } = isElectronSlice.actions;
export default isElectronSlice.reducer;
