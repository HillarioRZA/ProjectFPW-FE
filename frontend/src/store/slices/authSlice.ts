import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    avatarUrl: string;
  } | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  githubId?: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Login failed. Please try again.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', credentials);
      return { success: true };
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const user = {
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        avatarUrl: response.data.avatarUrl
      };

      return { token, user };
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Authentication failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 