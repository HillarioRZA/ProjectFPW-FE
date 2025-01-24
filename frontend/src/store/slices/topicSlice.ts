import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Topic {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  categoryId: string;
  commentCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopicState {
  topics: Topic[];
  currentTopic: Topic | null;
  loading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  currentTopic: null,
  loading: false,
  error: null
};

// Fetch Latest Topics
export const fetchLatestTopics = createAsyncThunk(
  'topics/fetchLatest',
  async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/topics/latest',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching latest topics:', error);
      throw error;
    }
  }
);

// Fetch Topic by ID
export const fetchTopicById = createAsyncThunk(
  'topics/fetchById',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/topics/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Create Topic
export const createTopic = createAsyncThunk(
  'topics/create',
  async (topicData: { title: string; content: string; categoryId: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/topics',
      topicData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Update Topic
export const updateTopic = createAsyncThunk(
  'topics/update',
  async ({ topicId, updateData }: { 
    topicId: string; 
    updateData: { 
      title: string; 
      content: string; 
      categoryId: string;
      tags?: string[];
    } 
  }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `http://localhost:5000/api/topics/${topicId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Delete Topic (Soft Delete)
export const deleteTopic = createAsyncThunk(
  'topics/delete',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/topics/${id}/delete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Fetch All Topics (for admin)
export const fetchTopics = createAsyncThunk(
  'topics/fetchAll',
  async (search?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/topics${search ? `?search=${search}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Soft Delete Topic
export const softDeleteTopic = createAsyncThunk(
  'topics/softDelete',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/topics/${id}/delete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Restore Topic (update isDeleted to false)
export const restoreTopic = createAsyncThunk(
  'topics/restore',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/topics/${id}/restore`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Latest Topics
      .addCase(fetchLatestTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload || [];
        state.error = null;
      })
      .addCase(fetchLatestTopics.rejected, (state, action) => {
        state.loading = false;
        state.topics = [];
        state.error = action.error.message || 'Failed to fetch latest topics';
      })
      // Fetch Topic by ID
      .addCase(fetchTopicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch topic';
      })
      // Create Topic
      .addCase(createTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.unshift(action.payload);
        state.currentTopic = action.payload;
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create topic';
      })
      // Update Topic
      .addCase(updateTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        if (state.currentTopic?._id === action.payload._id) {
          state.currentTopic = action.payload;
        }
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update topic';
      })
      // Delete Topic (Soft Delete)
      .addCase(deleteTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete topic';
      })
      // Fetch All Topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch topics';
      })
      // Soft Delete Topic
      .addCase(softDeleteTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })
      .addCase(softDeleteTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete topic';
      })
      // Restore Topic
      .addCase(restoreTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })
      .addCase(restoreTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore topic';
      });
  }
});

// Export the clearError action
export const { clearError } = topicSlice.actions;

export default topicSlice.reducer; 