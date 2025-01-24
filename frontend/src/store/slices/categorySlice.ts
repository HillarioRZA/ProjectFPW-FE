import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null
};

// Helper function untuk generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await axios.get('http://localhost:5000/api/categories');
    return response.data;
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryData: { name: string; description: string }) => {
    const slug = generateSlug(categoryData.name);
    const response = await axios.post('http://localhost:5000/api/categories', {
      ...categoryData,
      slug
    });
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: { name: string; description: string } }) => {
    const slug = generateSlug(data.name);
    const response = await axios.put(`http://localhost:5000/api/categories/${id}`, {
      ...data,
      slug
    });
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
    return id;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Add Category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add category';
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(category => category._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete category';
      });
  }
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer; 