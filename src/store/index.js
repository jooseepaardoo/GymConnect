import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import matchingReducer from './slices/matchingSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matching: matchingReducer,
    chat: chatReducer,
  },
});