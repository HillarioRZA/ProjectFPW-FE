import { useState, useEffect } from 'react';
import { Box, Container, Toolbar, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import TopicForm from '../components/topics/TopicForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicById } from '../store/slices/topicSlice';
import type { AppDispatch, RootState } from '../store';

export default function EditTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTopic, loading, error } = useSelector((state: RootState) => state.topics);
  const { user } = useSelector((state: RootState) => state.auth);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopicById(topicId));
    }
  }, [dispatch, topicId]);

  useEffect(() => {
    // Check if user is authorized to edit this topic
    if (currentTopic && user) {
      if (currentTopic.userId._id !== user.id) {
        setUnauthorized(true);
      }
    }
  }, [currentTopic, user]);

  const handleSuccess = () => {
    navigate(`/topics/${topicId}`); // Redirect back to topic detail
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (unauthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          You are not authorized to edit this topic.
        </Alert>
      </Box>
    );
  }

  if (!currentTopic) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Topic not found.</Alert>
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
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Edit Topic
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TopicForm
              topicId={topicId}
              initialData={{
                title: currentTopic.title,
                content: currentTopic.content,
                categoryId: currentTopic.categoryId._id,
                tags: currentTopic.tags
              }}
              onSuccess={handleSuccess}
              onCancel={() => navigate(`/topics/${topicId}`)}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}