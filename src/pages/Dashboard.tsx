import { useState, useEffect } from 'react';
import { 
  Box, 
  Toolbar, 
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  Chip,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import { fetchLatestTopics } from '../store/slices/topicSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import type { AppDispatch, RootState } from '../store';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { topics, loading } = useSelector((state: RootState) => state.topics);
  const { categories } = useSelector((state: RootState) => state.categories);
  const [latestTopics, setLatestTopics] = useState<typeof topics>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    dispatch(fetchLatestTopics());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (topics) {
      let filteredTopics = [...topics];
      
      // Apply search filter
      if (searchTerm) {
        filteredTopics = filteredTopics.filter(topic => 
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (category !== 'all') {
        filteredTopics = filteredTopics.filter(topic => 
          topic.categoryId.name === category
        );
      }

      // Apply sort
      switch (sortBy) {
        case 'latest':
          filteredTopics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'mostViewed':
          filteredTopics.sort((a, b) => b.viewCount - a.viewCount);
          break;
        case 'mostCommented':
          filteredTopics.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
          break;
        default:
          break;
      }

      setLatestTopics(filteredTopics);
    }
  }, [topics, searchTerm, category, sortBy]);

  const handleTopicClick = (topicId: string) => {
    navigate(`/topics/${topicId}`);
  };

  const renderTopics = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} key={item}>
              <Card>
                <CardHeader
                  avatar={<Skeleton variant="circular" width={40} height={40} />}
                  title={<Skeleton variant="text" width="60%" />}
                  subheader={<Skeleton variant="text" width="40%" />}
                />
                <CardContent>
                  <Skeleton variant="text" height={100} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!latestTopics || latestTopics.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary" align="center">
          No discussions found
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {latestTopics.map((topic) => (
          <Grid item xs={12} key={topic._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleTopicClick(topic._id)}
            >
              <CardHeader
                avatar={
                  <Avatar 
                    src={topic.userId.avatarUrl}
                    alt={topic.userId.username}
                  />
                }
                title={
                  <Typography variant="h6">
                    {topic.title}
                  </Typography>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      by {topic.userId.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {topic.content}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={topic.categoryId.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Views">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VisibilityIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {topic.viewCount}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Comments">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CommentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {topic.commentCount || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const SearchAndFilterPanel = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Search & Filter
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search discussions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          label="Sort By"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value="latest">Latest</MenuItem>
          <MenuItem value="mostViewed">Most Viewed</MenuItem>
          <MenuItem value="mostCommented">Most Commented</MenuItem>
        </Select>
      </FormControl>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={() => {
          setSearchTerm('');
          setCategory('all');
          setSortBy('latest');
        }}
      >
        Reset Filters
      </Button>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <UserNavbar />
      <UserSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Grid container spacing={3}>
          {/* Main Content - Discussion List */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
              Latest Discussions
            </Typography>
            {renderTopics()}
          </Grid>

          {/* Right Sidebar - Search & Filter */}
          <Grid item xs={12} md={4}>
            <SearchAndFilterPanel />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}