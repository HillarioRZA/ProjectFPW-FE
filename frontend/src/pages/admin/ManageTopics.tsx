import { useState, useEffect, useMemo } from 'react';
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
  Switch,
  Avatar,
  Chip,
  Tooltip,
  TablePagination,
  Button,
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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminNavbar from '../../components/navbar/AdminNavbar';
import AdminSidebar from '../../components/sidebar/AdminSidebar';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchTopics,
  softDeleteTopic,
  restoreTopic,
  clearError,
  deleteTopic,
} from '../../store/slices/topicSlice';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';

export default function ManageTopics() {
  const dispatch = useDispatch<AppDispatch>();
  const { topics, loading, error } = useSelector((state: RootState) => state.topics);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'deleted'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'views'
  const [searchTerm, setSearchTerm] = useState('');
  const [localTopics, setLocalTopics] = useState<typeof topics>([]);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    dispatch(fetchTopics(searchTerm));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await dispatch(deleteTopic(id)).unwrap();
        dispatch(fetchTopics()); // Refresh topics
      } catch (error) {
        console.error('Failed to delete topic:', error);
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await dispatch(restoreTopic(id)).unwrap();
      dispatch(fetchTopics()); // Refresh topics
    } catch (error) {
      console.error('Failed to restore topic:', error);
    }
  };

  const handleViewTopic = (id: string) => {
    window.open(`/topic/${id}`, '_blank');
  };

  const filteredAndSortedTopics = useMemo(() => {
    let result = [...localTopics];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(topic => 
        topic.title.toLowerCase().includes(searchLower) || 
        topic.userId.username.toLowerCase().includes(searchLower) ||
        topic.categoryId.name.toLowerCase().includes(searchLower)
      );
    }

    result = result.filter(topic => {
      if (filter === 'all') return true;
      if (filter === 'active') return !topic.isDeleted;
      if (filter === 'deleted') return topic.isDeleted;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'views') return b.viewCount - a.viewCount;
      return 0;
    });

    return result;
  }, [localTopics, searchTerm, filter, sortBy]);

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
          <Typography variant="h4">Manage Topics</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by title, author, or category..."
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
                <MenuItem value="all">All Topics</MenuItem>
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
                <MenuItem value="views">Most Views</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTopics
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((topic) => (
                  <TableRow 
                    key={topic._id}
                    sx={{
                      backgroundColor: topic.isDeleted ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          textDecoration: topic.isDeleted ? 'line-through' : 'none',
                          color: topic.isDeleted ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {topic.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={topic.userId.avatarUrl} 
                          alt={topic.userId.username}
                          sx={{ width: 24, height: 24 }}
                        />
                        {topic.userId.username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={topic.categoryId.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {topic.viewCount}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={topic.isDeleted ? 'Deleted' : 'Active'}
                        color={topic.isDeleted ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Topic">
                        <IconButton 
                          onClick={() => handleViewTopic(topic._id)}
                          disabled={topic.isDeleted}
                        >
                          {topic.isDeleted ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      {topic.isDeleted ? (
                        <Tooltip title="Restore Topic">
                          <IconButton 
                            onClick={() => handleRestore(topic._id)}
                            color="primary"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Delete Topic">
                          <IconButton 
                            onClick={() => handleDelete(topic._id)}
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
            count={filteredAndSortedTopics.length}
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