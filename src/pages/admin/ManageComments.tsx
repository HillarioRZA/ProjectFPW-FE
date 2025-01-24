import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Toolbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import AdminNavbar from '../../components/navbar/AdminNavbar';
import AdminSidebar from '../../components/sidebar/AdminSidebar';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchComments,
  deleteComment,
  restoreComment,
  clearError
} from '../../store/slices/commentSlice';
import { format } from 'date-fns';

export default function ManageComments() {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, error } = useSelector((state: RootState) => state.comments);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'deleted'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  const [localComments, setLocalComments] = useState<typeof comments>([]);

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(id)).unwrap();
        dispatch(fetchComments());
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await dispatch(restoreComment(id)).unwrap();
      dispatch(fetchComments());
    } catch (error) {
      console.error('Error restoring comment:', error);
    }
  };

  const handleViewTopic = (id: string) => {
    window.open(`/topic/${id}`, '_blank');
  };

  const filteredAndSortedComments = useMemo(() => {
    let result = [...localComments];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(comment => 
        comment.content.toLowerCase().includes(searchLower) || 
        comment.topicId.title.toLowerCase().includes(searchLower) ||
        comment.userId.username.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    result = result.filter(comment => {
      if (filter === 'all') return true;
      if (filter === 'active') return !comment.isDeleted;
      if (filter === 'deleted') return comment.isDeleted;
      return true;
    });

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

    return result;
  }, [localComments, searchTerm, filter, sortBy]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminNavbar />
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manage Comments</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by comment, topic, or username..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <FormControl size="small">
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Comments</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="deleted">Deleted Only</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedComments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((comment) => (
                  <TableRow 
                    key={comment._id}
                    sx={{
                      backgroundColor: comment.isDeleted ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          textDecoration: comment.isDeleted ? 'line-through' : 'none',
                          color: comment.isDeleted ? 'text.secondary' : 'text.primary',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={comment.userId.avatarUrl} 
                          alt={comment.userId.username}
                          sx={{ width: 24, height: 24 }}
                        />
                        {comment.userId.username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {comment.topicId.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={comment.isDeleted ? 'Deleted' : 'Active'}
                        color={comment.isDeleted ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Topic">
                        <IconButton 
                          onClick={() => handleViewTopic(comment.topicId._id)}
                          disabled={comment.isDeleted}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {comment.isDeleted ? (
                        <Tooltip title="Restore Comment">
                          <IconButton 
                            onClick={() => handleRestore(comment._id)}
                            color="success"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Delete Comment">
                          <IconButton 
                            onClick={() => handleDelete(comment._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedComments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Box>
  );
}