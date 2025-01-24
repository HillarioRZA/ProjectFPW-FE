import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ForumIcon from '@mui/icons-material/Forum';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TopicIcon from '@mui/icons-material/Topic';

const drawerWidth = 240;

export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Create Topic', icon: <AddCircleIcon />, path: '/create-topic' },
    { text: 'Category', icon: <CategoryIcon />, path: '/category' },
    {
      text: 'My Topics',
      icon: <TopicIcon />,
      path: '/my-topics'
    },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
} 