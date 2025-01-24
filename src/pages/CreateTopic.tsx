import { Box, Container, Toolbar, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import TopicForm from '../components/topics/TopicForm';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function CreateTopic() {
  const navigate = useNavigate();
  const { error } = useSelector((state: RootState) => state.topics);

  const handleSuccess = () => {
    navigate('/'); // Redirect to home after successful creation
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <UserNavbar />
      <UserSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Create New Topic
            </Typography>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TopicForm onSuccess={handleSuccess} />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}