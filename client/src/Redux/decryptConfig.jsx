import { createSlice } from '@reduxjs/toolkit';

const decryptConfigSlice = createSlice({
  name: 'decryptConfig',
  initialState: null, // Start with null value
  reducers: {
    setDecryptConfig: (state, action) => {
      return action.payload; 
    },
  },
});

export const { setDecryptConfig } = decryptConfigSlice.actions;
export default decryptConfigSlice.reducer;

