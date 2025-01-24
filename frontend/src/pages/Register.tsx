import { useState, useEffect } from "react"
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  createTheme,
  ThemeProvider,
  Alert,
} from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { register, clearError } from '../store/slices/authSlice';
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '../utils/validation';

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

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    githubId: "",
  });
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors = {
      username: validateUsername(formData.username) || '',
      email: validateEmail(formData.email) || '',
      password: validatePassword(formData.password) || '',
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register({
      ...registerData,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.username}`
    }));

    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  }

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
            maxWidth: '500px',
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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {(error || Object.values(errors).some(error => error !== '')) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || Object.values(errors).map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <TextField
              margin="normal"
              fullWidth
              id="githubId"
              label="GitHub Username (Optional)"
              name="githubId"
              value={formData.githubId}
              onChange={handleChange}
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
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2" sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
