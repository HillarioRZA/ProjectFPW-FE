import { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Container,
  Toolbar,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UserNavbar from '../components/navbar/UserNavbar';
import UserSidebar from '../components/sidebar/UserSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
      });
      setPreviewUrl(profile.avatarUrl || '/default-avatar.png');
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // Only include changed fields
    const updatedData = new FormData();
    if (formData.username !== profile?.username) {
      updatedData.append('username', formData.username);
    }
    if (formData.email !== profile?.email) {
      updatedData.append('email', formData.email);
    }
    if (formData.bio !== profile?.bio) {
      updatedData.append('bio', formData.bio);
    }
    if (avatar) {
      updatedData.append('avatar', avatar);
    }

    try {
      await dispatch(updateProfile(updatedData)).unwrap();
      setSuccess(true);
      setAvatar(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
      });
      setPreviewUrl(profile.avatarUrl || '/default-avatar.png');
      setAvatar(null);
    }
    setIsEditing(false);
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
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">Profile</Typography>
              {!isEditing && (
                <Button variant="contained" onClick={handleEdit}>
                  Edit Profile
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated successfully!
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={previewUrl}
                      sx={{ width: 120, height: 120 }}
                    />
                    {isEditing && (
                      <>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="avatar-upload"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                        <label htmlFor="avatar-upload">
                          <IconButton
                            color="primary"
                            component="span"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              backgroundColor: 'background.paper'
                            }}
                          >
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    helperText="Tell us about yourself"
                  />
                </Grid>

                {isEditing && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}