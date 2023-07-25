import { createStore } from 'redux';

// Define your initial state
const initialState = {
  isElectron: false,
};

// Define your reducer function to handle state updates
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_IS_ELECTRON':
      return {
        ...state,
        isElectron: action.payload,
      };
    default:
      return state;
  }
};

// Create the Redux store
const store = createStore(reducer);

export default store;
