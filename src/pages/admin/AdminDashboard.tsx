import { Box, Toolbar, Grid, Paper, Typography, Card, CardContent, IconButton } from '@mui/material';
import AdminNavbar from '../../components/navbar/AdminNavbar';
import AdminSidebar from '../../components/sidebar/AdminSidebar';
import PeopleIcon from '@mui/icons-material/People';
import TopicIcon from '@mui/icons-material/Topic';
import CommentIcon from '@mui/icons-material/Comment';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  stats: {
    users: number;
    topics: number;
    comments: number;
    categories: number;
  };
  userStatus: {
    active: number;
    inactive: number;
    banned: number;
  };
  topicsPerCategory: Array<{
    name: string;
    topicCount: number;
  }>;
  monthlyActivity: {
    topics: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
    comments: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get<DashboardStats>('http://localhost:5000/api/stats/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (!dashboardData) return [];
    return dashboardData.monthlyActivity.topics.map(item => months[item._id.month - 1]);
  };

  const lineChartData = {
    labels: getMonthLabels(),
    datasets: [
      {
        label: 'Topics Created',
        data: dashboardData?.monthlyActivity.topics.map(item => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Comments Made',
        data: dashboardData?.monthlyActivity.comments.map(item => item.count) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Activity'
      }
    }
  };

  const barChartData = {
    labels: dashboardData?.topicsPerCategory.map(item => item.name) || [],
    datasets: [
      {
        label: 'Topics per Category',
        data: dashboardData?.topicsPerCategory.map(item => item.topicCount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Active', 'Inactive', 'Banned'],
    datasets: [
      {
        data: dashboardData ? [
          dashboardData.userStatus.active,
          dashboardData.userStatus.inactive,
          dashboardData.userStatus.banned,
        ] : [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Loading...
    </Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminNavbar />
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{dashboardData?.stats.users}</Typography>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <PeopleIcon fontSize="large" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Topics</Typography>
                  <Typography variant="h4">{dashboardData?.stats.topics}</Typography>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <TopicIcon fontSize="large" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Comments</Typography>
                  <Typography variant="h4">{dashboardData?.stats.comments}</Typography>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <CommentIcon fontSize="large" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Categories</Typography>
                  <Typography variant="h4">{dashboardData?.stats.categories}</Typography>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <CategoryIcon fontSize="large" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>Activity Overview</Typography>
              <Line data={lineChartData} options={lineChartOptions} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>User Status</Typography>
              <Doughnut data={doughnutChartData} options={{ responsive: true }} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>Topics by Category</Typography>
              <Bar data={barChartData} options={{ responsive: true }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}