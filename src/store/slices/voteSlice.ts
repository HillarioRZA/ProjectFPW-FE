import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Vote {
  _id: string;
  userId: string;
  referenceId: string;
  referenceType: 'topic' | 'comment';
  value: 1 | -1;
}

interface VoteState {
  votes: Vote[];
  loading: boolean;
  error: string | null;
}

const VOTES_STORAGE_KEY = 'forum_votes';

// Load votes dari localStorage
const loadStoredVotes = (): Vote[] => {
  const storedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
  return storedVotes ? JSON.parse(storedVotes) : [];
};

const initialState: VoteState = {
  votes: loadStoredVotes(),
  loading: false,
  error: null
};

export const createVote = createAsyncThunk(
  'votes/create',
  async (voteData: { userId: string; referenceId: string; referenceType: 'topic' | 'comment'; value: 1 | -1 }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/votes',
      voteData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

export const getVotesByReference = createAsyncThunk(
  'votes/getByReference',
  async ({ referenceId, referenceType }: { referenceId: string; referenceType: 'topic' | 'comment' }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/votes/${referenceId}/${referenceType}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

export const deleteVote = createAsyncThunk(
  'votes/delete',
  async ({ userId, referenceId, referenceType }: { userId: string; referenceId: string; referenceType: 'topic' | 'comment' }) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `http://localhost:5000/api/votes/${referenceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId, referenceType }
      }
    );
    return { referenceId, userId };
  }
);

const voteSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createVote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVote.fulfilled, (state, action) => {
        state.loading = false;
        
        // Hapus vote lama jika ada
        if (action.payload.vote) {
          state.votes = state.votes.filter(
            vote => !(
              vote.referenceId === action.payload.vote.referenceId && 
              vote.userId === action.payload.vote.userId
            )
          );
          
          // Tambah vote baru jika bukan unvote
          if (action.payload.action !== 'delete') {
            state.votes.push(action.payload.vote);
          }
        }
        
        // Simpan ke localStorage
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(state.votes));
      })
      .addCase(createVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to vote';
      })
      .addCase(getVotesByReference.fulfilled, (state, action) => {
        const otherVotes = state.votes.filter(
          vote => vote.referenceId !== action.payload[0]?.referenceId
        );
        state.votes = [...otherVotes, ...action.payload];
        // Simpan ke localStorage
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(state.votes));
      })
      .addCase(deleteVote.fulfilled, (state, action) => {
        state.votes = state.votes.filter(
          vote => !(
            vote.referenceId === action.payload.referenceId && 
            vote.userId === action.payload.userId
          )
        );
        // Simpan ke localStorage
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(state.votes));
      });
  }
});

export default voteSlice.reducer; 