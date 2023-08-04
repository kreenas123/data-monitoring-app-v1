// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import isElectronReducer from './isElectron';
import ipcRendererReducer from './ipcRenderer'; 
import decryptConfigReducer from './decryptConfig'; 

const rootReducer = combineReducers({
  isElectron: isElectronReducer,
  ipcRenderer: ipcRendererReducer, 
  decryptConfig: decryptConfigReducer, 
  // Add the new slice here
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
