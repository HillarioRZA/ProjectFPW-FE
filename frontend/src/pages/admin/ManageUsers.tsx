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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AdminNavbar from '../../components/navbar/AdminNavbar';
import AdminSidebar from '../../components/sidebar/AdminSidebar';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchUsers,
  deactivateUser,
  activateUser,
  clearError,
  banUser,
  unbanUser,
} from '../../store/slices/userSlice';
import { format } from 'date-fns';

export default function ManageUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  const [localUsers, setLocalUsers] = useState<typeof users>([]);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [banDuration, setBanDuration] = useState<string>('1');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

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

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await dispatch(deactivateUser(id)).unwrap();
        dispatch(fetchUsers());
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await dispatch(activateUser(id)).unwrap();
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    try {
      await dispatch(banUser({
        id: selectedUser,
        duration: banDuration === 'permanent' ? null : parseInt(banDuration),
        reason: banReason
      })).unwrap();
      dispatch(fetchUsers());
      setBanDialogOpen(false);
      setBanReason('');
      setBanDuration('1');
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (id: string) => {
    try {
      await dispatch(unbanUser(id)).unwrap();
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...localUsers];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    result = result.filter(user => {
      if (filter === 'all') return true;
      if (filter === 'active') return user.isActive;
      if (filter === 'inactive') return !user.isActive;
      return true;
    });

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

    return result;
  }, [localUsers, searchTerm, filter, sortBy]);

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
          <Typography variant="h4">Manage Users</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by username, email, or role..."
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
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
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
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow 
                    key={user._id}
                    sx={{
                      backgroundColor: !user.isActive ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={user.avatarUrl} 
                          alt={user.username}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography
                          sx={{
                            color: !user.isActive ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {user.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                        {user.banStatus?.isBanned && (
                          <Chip 
                            label={user.banStatus.banExpires 
                              ? `Banned until ${format(new Date(user.banStatus.banExpires), 'MMM d, yyyy HH:mm')}`
                              : 'Permanently Banned'
                            }
                            color="error"
                            size="small"
                            title={`Reason: ${user.banStatus.banReason}`}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {user.isActive ? (
                        <Tooltip title="Deactivate User">
                          <IconButton 
                            onClick={() => handleDeactivate(user._id)}
                            color="error"
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate User">
                          <IconButton 
                            onClick={() => handleActivate(user._id)}
                            color="success"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user.banStatus?.isBanned ? (
                        <Tooltip title="Unban User">
                          <IconButton 
                            onClick={() => handleUnbanUser(user._id)}
                            color="success"
                          >
                            <LockOpenIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Ban User">
                          <IconButton 
                            onClick={() => {
                              setSelectedUser(user._id);
                              setBanDialogOpen(true);
                            }}
                            color="error"
                          >
                            <GavelIcon />
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
            count={filteredAndSortedUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Ban Duration</InputLabel>
            <Select
              value={banDuration}
              label="Ban Duration"
              onChange={(e) => setBanDuration(e.target.value)}
            >
              <MenuItem value="1">1 Day</MenuItem>
              <MenuItem value="3">3 Days</MenuItem>
              <MenuItem value="7">7 Days</MenuItem>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="permanent">Permanent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Ban Reason"
            fullWidth
            multiline
            rows={3}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBanUser} variant="contained" color="error">
            Ban User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}