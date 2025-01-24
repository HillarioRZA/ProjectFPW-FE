import { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { createComment } from '../../store/slices/commentSlice';
import type { AppDispatch } from '../../store';

interface CommentFormProps {
  topicId: string;
}

export default function CommentForm({ topicId }: CommentFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      const commentData = {
        userId: currentUser.id,
        topicId: topicId,
        content: newComment.trim(),
        replyTo: replyTo // Kirim ID komentar yang di-reply
      };
  
      await dispatch(createComment(commentData)).unwrap();
      setNewComment('');
      setReplyTo(null);
      setReplyingToUsername('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        multiline
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        sx={{ mb: 2 }}
      />
      
      <Button 
        type="submit" 
        variant="contained"
        disabled={!content.trim()}
      >
        Post Comment
      </Button>
    </Box>
  );
} 