import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Category from './pages/Category';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/CreateTopic';
import EditTopic from './pages/EditTopic';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageTopics from './pages/admin/ManageTopics';
import ManageUsers from './pages/admin/ManageUsers';
import ManageComments from './pages/admin/ManageComments';
import NotFound from './pages/NotFound';
import { RouteGuard } from './middleware/RouteGuard';
import PublicRoute from './middleware/PublicRoute';
import Topic from './pages/MyTopic';
import MyTopic from './pages/MyTopic';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },
  {
    path: '/dashboard',
    element: (
      <RouteGuard requiredRole="user">
        <Dashboard />
      </RouteGuard>
    ),
  },
  {
    path: '/category',
    element: (
      <RouteGuard requiredRole="user">
        <Category />
      </RouteGuard>
    ),
  },
  {
    path: '/topics/:topicId',
    element: (
      <RouteGuard requiredRole="user">
        <TopicDetail />
      </RouteGuard>
    ),
  },
  {
    path: '/topics',
    element: (
      <RouteGuard requiredRole="user">
        <Topic />
      </RouteGuard>
    )
  },
  {
    path: '/create-topic',
    element: (
      <RouteGuard requiredRole="user">
        <CreateTopic />
      </RouteGuard>
    ),
  },
  {
    path: '/edit-topic/:topicId',
    element: (
      <RouteGuard requiredRole="user">
        <EditTopic />
      </RouteGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RouteGuard requiredRole="user">
        <Profile />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/AdminDashboard',
    element: (
      <RouteGuard requiredRole="admin">
        <AdminDashboard />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/categories',
    element: (
      <RouteGuard requiredRole="admin">
        <ManageCategories />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/topics',
    element: (
      <RouteGuard requiredRole="admin">
        <ManageTopics />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RouteGuard requiredRole="admin">
        <ManageUsers />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/comments',
    element: (
      <RouteGuard requiredRole="admin">
        <ManageComments />
      </RouteGuard>
    ),
  },
  {
    path: '/my-topics',
    element: (
      <RouteGuard requiredRole="user">
        <MyTopic />
      </RouteGuard>
    )
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
