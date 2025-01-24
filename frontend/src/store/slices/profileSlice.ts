import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Profile {
  _id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null
};

// Fetch Profile
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      'http://localhost:5000/api/users/profile',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'profile/update',
  async (profileData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      'http://localhost:5000/api/users/profile',
      profileData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  }
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer; 