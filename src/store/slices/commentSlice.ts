import { createSlice, createAsyncThunk,PayloadAction  } from '@reduxjs/toolkit';
import axios from 'axios';

interface Comment {
  _id: string;
  topicId: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null
};

interface CreateCommentData {
  userId: string;
  topicId: string;
  content: string;
}

export const createComment = createAsyncThunk(
  'comments/create',
  async (commentData: CreateCommentData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/comments',
      commentData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
);

export const fetchCommentsByTopic = createAsyncThunk(
  'comments/fetchByTopic',
  async (topicId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/comments/topic/${topicId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data; // Now contains { comments, commentCount }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `http://localhost:5000/api/comments/${commentId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.commentId;
  }
);

export const restoreComment = createAsyncThunk(
  'comments/restore',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/api/comments/${id}/restore`,
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

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (search?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/comments${search ? `?search=${search}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `http://localhost:5000/api/comments/${commentId}`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addCommentRealTime: (state, action: PayloadAction<Comment>) => {
      // Cek apakah komentar sudah ada di state
      const existingComment = state.comments.find((comment) => comment._id === action.payload._id);
      if (!existingComment) {
        state.comments.unshift(action.payload); // Tambahkan komentar baru ke awal array
      }
    },
    updateCommentRealTime: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(
        (comment) => comment._id === action.payload._id
      );
      if (index !== -1) {
        state.comments[index] = action.payload; // Update komentar yang ada
      }
    },
    deleteCommentRealTime: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(
        (comment) => comment._id !== action.payload // Hapus komentar berdasarkan ID
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Comments (for admin)
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create comment';
      })
      // Fetch Comments
      .addCase(fetchCommentsByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
        state.error = null;
      })
      .addCase(fetchCommentsByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        // Remove main comment and its replies
        state.comments = state.comments.filter(
          comment => comment._id !== action.payload && comment.replyTo !== action.payload
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete comment';
      })
      // Restore Comment
      .addCase(restoreComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(comment => comment._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(restoreComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore comment';
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(
          comment => comment._id === action.payload.comment._id
        );
        if (index !== -1) {
          state.comments[index] = action.payload.comment;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update comment';
      });
  }
});

export const { clearError,addCommentRealTime,
  updateCommentRealTime,
  deleteCommentRealTime,} = commentSlice.actions;
export default commentSlice.reducer; 