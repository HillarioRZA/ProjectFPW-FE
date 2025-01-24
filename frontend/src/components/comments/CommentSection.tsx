import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Paper,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Collapse
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { 
  createComment, 
  fetchCommentsByTopic,
  updateComment,
  deleteComment 
} from '../../store/slices/commentSlice';
import { format } from 'date-fns';
import type { AppDispatch, RootState } from '../../store';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  content: string;
  replyTo: string | null; // Menyimpan ID komentar yang di-reply
  createdAt: string;
}

interface CommentSectionProps {
  topicId: string;
  currentUser: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export default function CommentSection({ topicId, currentUser }: CommentSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading } = useSelector((state: RootState) => state.comments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string>('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  useSocket({ topicId });

  useEffect(() => {
    dispatch(fetchCommentsByTopic(topicId));
  }, [dispatch, topicId]);
  const toggleReplyVisibility = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        userId: currentUser.id,
        topicId: topicId,
        content: newComment.trim(),
        replyTo: replyTo // Menyimpan ID komentar yang di-reply
      };

      await dispatch(createComment(commentData)).unwrap();
      setNewComment('');
      setReplyTo(null);
      setReplyingToUsername('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo(commentId);
    setReplyingToUsername(username);
    setNewComment(`@${username} `);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await dispatch(updateComment({ 
        commentId, 
        content: editContent.trim() 
      })).unwrap();
      
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteClick = async (commentId: string) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const replies = comments.filter((c) => c.replyTo === comment._id);
    const hasReplies = replies.length > 0;
    const isExpanded = expandedReplies[comment._id] || false;

    return (
      <Box key={comment._id} sx={{ ml: level * 4, mb: 2 }}>
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderLeft: level > 0 ? '2px solid #e0e0e0' : 'none',
            backgroundColor: level > 0 ? '#fafafa' : 'white',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar
              src={comment.userId?.avatarUrl || ''}
              alt={comment.userId?.username || 'User'}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2">
                  {comment.userId?.username || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {new Date(comment.createdAt).toLocaleString()}
                </Typography>
                {currentUser.id === comment.userId?._id && (
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.content}
              </Typography>

              {/* Tombol Reply */}
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => handleReply(comment._id, comment.userId?.username || 'Unknown User')}
                sx={{ mt: 1 }}
              >
                Reply
              </Button>

              {/* Tombol untuk menampilkan/sembunyikan reply */}
              {hasReplies && (
                <Button
                  size="small"
                  startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => toggleReplyVisibility(comment._id)}
                  sx={{ mt: 1, ml: 1 }}
                >
                  {isExpanded ? 'Hide replies' : `Show ${replies.length} replies`}
                </Button>
              )}
            </Box>
          </Box>

          {/* Render reply jika diperluas */}
          <Collapse in={isExpanded}>
            {replies.map((reply) => renderComment(reply, level + 1))}
          </Collapse>
        </Paper>
      </Box>
    );
  };

  // Render semua komentar utama
  const renderComments = () => {
    if (loading) {
      return (
        <Box>
          {[1, 2, 3].map((item) => (
            <Paper key={item} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      );
    }

    if (comments.length === 0) {
      return (
        <Typography color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      );
    }

    return comments
      .filter((comment) => !comment.replyTo) // Hanya tampilkan komentar utama
      .map((comment) => renderComment(comment));
  };

  return (
    <Box>
      {/* Form untuk menambahkan komentar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        {replyTo && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Replying to @{replyingToUsername}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setReplyTo(null);
                setReplyingToUsername('');
                setNewComment('');
              }}
            >
              Cancel
            </Button>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" disabled={!newComment.trim()}>
            {replyTo ? 'Reply' : 'Post Comment'}
          </Button>
        </form>
      </Paper>

      {/* Daftar komentar */}
      {renderComments()}
    </Box>
  );
}