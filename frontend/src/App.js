import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Profile from './pages/Profile';
import Vendors from './pages/Vendors';
import CreateVendor from './pages/CreateVendor';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import LoadingSpinner from './components/common/LoadingSpinner';
import TaskDetail from './pages/TaskDetail';
import VendorDetail from './pages/VendorDetail';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/edit-event/:id" 
            element={
              <PrivateRoute>
                <EditEvent />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/vendors" 
            element={
              <PrivateRoute>
                <Vendors />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/vendors/create" 
            element={
              <PrivateRoute>
                <CreateVendor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/vendors/:id" 
            element={
              <PrivateRoute>
                <VendorDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks/create" 
            element={
              <PrivateRoute>
                <CreateTask />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks/:id" 
            element={
              <PrivateRoute>
                <TaskDetail />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 