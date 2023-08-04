// ipcRendererSlice.js
import { createSlice } from '@reduxjs/toolkit';

const ipcRendererSlice = createSlice({
  name: 'ipcRenderer',
  initialState: null, // Start with null value
  reducers: {
    setIpcRenderer: (state, action) => {
      return action.payload; // Set the ipcRenderer value
    },
  },
});

export const { setIpcRenderer } = ipcRendererSlice.actions;
export default ipcRendererSlice.reducer;

