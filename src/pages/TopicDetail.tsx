import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Paper,
  Button,
  Skeleton,
} from '@mui/material';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import { fetchTopicById, deleteTopic } from '../store/slices/topicSlice';
import { fetchCommentsByTopic } from '../store/slices/commentSlice';
import type { AppDispatch, RootState } from '../store';
import CommentSection from '../components/comments/CommentSection';
import TopicForm from '../components/topics/TopicForm';

export default function TopicDetail() {
  const { topicId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTopic, loading } = useSelector((state: RootState) => state.topics);
  const { comments, loading: commentsLoading } = useSelector((state: RootState) => state.comments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopicById(topicId));
      dispatch(fetchCommentsByTopic(topicId));
    }
  }, [dispatch, topicId]);

  const renderTopicSkeleton = () => (
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="60%" />}
        subheader={<Skeleton variant="text" width="40%" />}
      />
      <CardContent>
        <Skeleton variant="text" height={200} />
      </CardContent>
    </Card>
  );

  const handleEdit = () => {
    navigate(`/edit-topic/${topicId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await dispatch(deleteTopic(topicId!)).unwrap();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete topic:', error);
      }
    }
  };

  const renderTopic = () => {
    if (!currentTopic) return null;

    if (isEditing) {
      return (
        <TopicForm
          topicId={topicId}
          initialData={{
            title: currentTopic.title,
            content: currentTopic.content,
            categoryId: currentTopic.categoryId
          }}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      );
    }

    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">{currentTopic.title}</Typography>
          {currentTopic.userId._id === user?.id && (
            <Box>
              <Button onClick={handleEdit} sx={{ mr: 1 }}>
                Edit
              </Button>
              <Button color="error" onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          )}
        </Box>
        <Card>
          <CardHeader
            avatar={
              <Avatar 
                src={currentTopic.userId.avatarUrl}
                alt={currentTopic.userId.username}
              />
            }
            title={
              <Typography variant="h5" component="div">
                {currentTopic.title}
              </Typography>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  by {currentTopic.userId.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {format(new Date(currentTopic.createdAt), 'MMM d, yyyy')}
                </Typography>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
              {currentTopic.content}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip 
                label={currentTopic.categoryId.name}
                color="primary"
                variant="outlined"
              />
              {currentTopic.tags?.map((tag: string) => (
                <Chip 
                  key={tag}
                  label={tag}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {currentTopic.viewCount} views
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {currentTopic.commentCount || 0} comments
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <UserNavbar />
      <UserSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Main Content - Topic Detail */}
            <Grid item xs={12} md={8}>
              {loading ? renderTopicSkeleton() : renderTopic()}
              
              {/* Comments Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Comments ({comments?.length || 0})
                </Typography>
                <CommentSection 
                  topicId={topicId!}
                  comments={comments || []}
                  loading={commentsLoading}
                  currentUser={{
                    id: user?.id || '',
                    username: user?.username || '',
                    avatarUrl: user?.avatarUrl || ''
                  }}
                />
              </Box>
            </Grid>

            {/* Right Sidebar */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Related Topics
                </Typography>
                {/* Add related topics here if needed */}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}