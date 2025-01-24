import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import topicReducer from './slices/topicSlice';
import categoryReducer from './slices/categorySlice';
import commentReducer from './slices/commentSlice';
import userReducer from './slices/userSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    topics: topicReducer,
    categories: categoryReducer,
    comments: commentReducer,
    users: userReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 