import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { checkAuth } from './store/slices/authSlice';
import router from './router';
import { setupAxiosInterceptors } from './utils/axiosConfig';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { socket } from './socket';

setupAxiosInterceptors();

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { loading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await dispatch(checkAuth()).unwrap();
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setInitialCheckDone(true);
    };

    if (!isAuthenticated) {
      initAuth();
    } else {
      setInitialCheckDone(true);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Connect to socket when app starts
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup on app unmount
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  if (!initialCheckDone || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
      <RouterProvider router={router} />
  );
}

export default App;
