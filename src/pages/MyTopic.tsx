import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import { fetchTopics, deleteTopic } from '../store/slices/topicSlice';
import type { AppDispatch, RootState } from '../store';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import AddIcon from '@mui/icons-material/Add';

// Define Topic interface to match the backend model
interface TopicType {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  viewCount: number;
  commentCount: number;
  isDeleted: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MyTopic() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { topics, loading } = useSelector((state: RootState) => state.topics);
  const { user } = useSelector((state: RootState) => state.auth);
  const [userTopics, setUserTopics] = useState<TopicType[]>([]);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  useEffect(() => {
    if (topics && user) {
      // Filter topics untuk user yang sedang login
      const filteredTopics = topics.filter(
        topic => topic.userId._id === user.id
      ) as TopicType[];
      setUserTopics(filteredTopics);
    }
  }, [topics, user]);

  const handleCreateTopic = () => {
    navigate('/create-topic');
  };

  const handleEditTopic = (topicId: string) => {
    navigate(`/edit-topic/${topicId}`);
  };

  const handleViewTopic = (topicId: string) => {
    navigate(`/topics/${topicId}`);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await dispatch(deleteTopic(topicId)).unwrap();
        dispatch(fetchTopics()); // Refresh topics after delete
      } catch (error) {
        console.error('Failed to delete topic:', error);
      }
    }
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
      <UserNavbar />
      <UserSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">My Topics</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTopic}
            >
              Create New Topic
            </Button>
          </Box>

          <Grid container spacing={3}>
            {userTopics.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    You haven't created any topics yet.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              userTopics.map((topic) => (
                <Grid item xs={12} key={topic._id}>
                  <Card 
                    sx={{ 
                      opacity: topic.isDeleted ? 0.7 : 1,
                      position: 'relative'
                    }}
                  >
                    {topic.isDeleted && (
                      <Chip
                        label="Deleted"
                        color="error"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      />
                    )}
                    <CardHeader
                      avatar={
                        <Avatar 
                          src={topic.userId.avatarUrl} 
                          alt={topic.userId.username}
                        />
                      }
                      title={topic.title}
                      subheader={`Posted on ${format(new Date(topic.createdAt), 'MMM d, yyyy')}`}
                      action={
                        <Box>
                          <IconButton 
                            onClick={() => handleViewTopic(topic._id)}
                            disabled={topic.isDeleted}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleEditTopic(topic._id)}
                            disabled={topic.isDeleted}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteTopic(topic._id)}
                            color="error"
                            disabled={topic.isDeleted}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    />
                    <CardContent>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          textDecoration: topic.isDeleted ? 'line-through' : 'none'
                        }}
                      >
                        {topic.content.length > 200 
                          ? `${topic.content.substring(0, 200)}...` 
                          : topic.content
                        }
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip 
                          label={topic.categoryId.name}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        {topic.tags?.map((tag: string) => (
                          <Chip 
                            key={tag}
                            label={tag}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.viewCount} views
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.commentCount || 0} comments
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

