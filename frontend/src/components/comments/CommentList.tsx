import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { updateComment, deleteComment } from '../../store/slices/commentSlice';
import type { AppDispatch, RootState } from '../../store';

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  topicId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isEdited: boolean;
}

interface CommentListProps {
  comments: Comment[];
  topicId: string;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (comment: Comment) => void;
}

export default function CommentList({ 
  comments, 
  topicId,
  onCommentUpdated,
  onCommentDeleted 
}: CommentListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    if (selectedComment) {
      setEditContent(selectedComment.content);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (selectedComment && editContent.trim()) {
      try {
        const result = await dispatch(updateComment({
          commentId: selectedComment._id,
          content: editContent.trim()
        })).unwrap();

        if (onCommentUpdated) {
          onCommentUpdated(result);
        }
      } catch (error) {
        console.error('Failed to update comment:', error);
      }
    }
    setEditDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedComment) {
      try {
        await dispatch(deleteComment(selectedComment._id)).unwrap();
        if (onCommentDeleted) {
          onCommentDeleted(selectedComment);
        }
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <List>
        {comments.map((comment) => (
          <ListItem
            key={comment._id}
            alignItems="flex-start"
            sx={{
              opacity: comment.isDeleted ? 0.5 : 1,
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <ListItemAvatar>
              <Avatar src={comment.userId.avatarUrl} alt={comment.userId.username} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" variant="subtitle2">
                    {comment.userId.username}
                  </Typography>
                  <Typography component="span" variant="caption" color="text.secondary">
                    • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </Typography>
                  {comment.isEdited && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      • (edited)
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color={comment.isDeleted ? "text.secondary" : "text.primary"}
                  sx={{ 
                    display: 'inline',
                    textDecoration: comment.isDeleted ? 'line-through' : 'none'
                  }}
                >
                  {comment.content}
                </Typography>
              }
            />
            {!comment.isDeleted && user && user.id === comment.userId._id && (
              <IconButton
                edge="end"
                aria-label="more"
                onClick={(e) => handleMenuOpen(e, comment)}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this comment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}