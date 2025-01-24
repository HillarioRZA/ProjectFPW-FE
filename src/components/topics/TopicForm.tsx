import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTopic, updateTopic } from '../../store/slices/topicSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import type { AppDispatch, RootState } from '../../store';

interface TopicFormProps {
  topicId?: string;
  initialData?: {
    title: string;
    content: string;
    categoryId: string;
    tags?: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TopicForm({ topicId, initialData, onSuccess, onCancel }: TopicFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.categories);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validasi input
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!content.trim()) {
        throw new Error('Content is required');
      }
      if (!categoryId) {
        throw new Error('Please select a category');
      }

      const topicData = {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        tags: tags.map(tag => tag.trim()).filter(tag => tag !== '')
      };

      if (topicId) {
        await dispatch(updateTopic({
          topicId,
          updateData: topicData
        })).unwrap();
      } else {
        await dispatch(createTopic(topicData)).unwrap();
      }

      onSuccess?.();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (event: React.SyntheticEvent, newValue: string[]) => {
    // Filter out empty tags and trim whitespace
    const cleanedTags = newValue
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    setTags(cleanedTags);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={!!error && !title.trim()}
        helperText={error && !title.trim() ? 'Title is required' : ''}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth error={!!error && !categoryId} sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryId}
          label="Category"
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
        {error && !categoryId && (
          <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
            Please select a category
          </Typography>
        )}
      </FormControl>

      <Autocomplete
        multiple
        freeSolo
        options={[]} // You can add suggested tags here
        value={tags}
        onChange={handleTagsChange}
        renderTags={(value: string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Add tags (press enter after each tag)"
            helperText="Add relevant tags to help others find your topic"
            sx={{ mb: 2 }}
          />
        )}
      />

      <TextField
        fullWidth
        multiline
        rows={8}
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={!!error && !content.trim()}
        helperText={error && !content.trim() ? 'Content is required' : ''}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="contained"
          disabled={loading || !title.trim() || !content.trim() || !categoryId}
        >
          {loading ? 'Saving...' : (topicId ? 'Update Topic' : 'Create Topic')}
        </Button>
      </Box>
    </Box>
  );
} 