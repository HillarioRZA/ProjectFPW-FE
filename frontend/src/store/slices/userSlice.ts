import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  banStatus: {
    isBanned: boolean;
    banExpires: string | null;
    banReason: string | null;
  };
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

interface BanData {
  id: string;
  duration: number | null; // null for permanent ban
  reason: string;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/auth/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`http://localhost:5000/api/auth/users/${id}/deactivate`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`http://localhost:5000/api/auth/users/${id}/activate`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const banUser = createAsyncThunk(
  'users/banUser',
  async (data: BanData) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/auth/users/${data.id}/ban`,
      { duration: data.duration, reason: data.reason },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
);

export const unbanUser = createAsyncThunk(
  'users/unbanUser',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/auth/users/${id}/unban`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to deactivate user';
      })
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to activate user';
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer; 