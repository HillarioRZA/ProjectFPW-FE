import { useState, useEffect } from "react"
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  createTheme,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { validateUsername, validatePassword } from '../utils/validation';

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
  },
});

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [openBanDialog, setOpenBanDialog] = useState(false);
  const [banMessage, setBanMessage] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      // Check for ban status first
      if (error.includes('banned')) {
        setBanMessage(error);
        setOpenBanDialog(true);
        return; // Stop here if user is banned
      }

      // Handle other errors without refreshing
      if (error === 'Username not found') {
        setErrors(prev => ({ ...prev, username: error }));
      } else if (error === 'Wrong password') {
        setErrors(prev => ({ ...prev, password: error }));
      } else {
        setErrors(prev => ({ ...prev, username: error }));
      }
      
      // Clear only error messages after 3 seconds
      setTimeout(() => {
        dispatch(clearError());
        setErrors({ username: '', password: '' });
      }, 3000);
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors = {
      username: validateUsername(username) || '',
      password: validatePassword(password) || ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form refresh
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(login({ username, password })).unwrap();
      
      // Only navigate if login is successful and user is not banned
      if (result && result.user && !result.user.banStatus?.isBanned) {
        const userRole = result.user.role;
        if (userRole === 'admin') {
          navigate('/admin/AdminDashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      // Error will be handled by useEffect
      // Don't do anything here to prevent refresh
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <CssBaseline />
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: '400px',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign in
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                // Only clear the error message, not the value
                if (errors.username) {
                  setErrors(prev => ({ ...prev, username: '' }));
                }
              }}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Only clear the error message, not the value
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              error={!!errors.password}
              helperText={errors.password}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #7b1fa2 90%)',
                }
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2" sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={openBanDialog}
        onClose={() => setOpenBanDialog(false)}
        aria-labelledby="ban-dialog-title"
      >
        <DialogTitle id="ban-dialog-title" sx={{ color: 'error.main' }}>
          Account Banned
        </DialogTitle>
        <DialogContent>
          <Typography>
            {banMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenBanDialog(false)}
            variant="contained"
            color="primary"
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
