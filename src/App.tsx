import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/ui/LoadingScreen';

// Core layouts (keep these imported directly as they're critical for initial render)
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy-loaded layouts
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Lazy-loaded pages - Public
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const TestQR = lazy(() => import('./pages/home/TestQR'));
const NeonDemo = lazy(() => import('./pages/NeonDemo'));

// Lazy-loaded pages - Dashboard
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Programs = lazy(() => import('./pages/dashboard/Programs'));
const Customers = lazy(() => 
  import('./pages/dashboard/Customers')
  .catch(error => {
    console.error("Failed to load Customers component:", error);
    // Return a minimal component as fallback
    return { 
      default: () => <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Error Loading Customers</h2>
        <p>There was a problem loading the Customers component. Please try refreshing the page.</p>
      </div> 
    };
  })
);
const Transactions = lazy(() => import('./pages/dashboard/Transactions'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Rewards = lazy(() => import('./pages/dashboard/rewards'));
const CustomerSettings = lazy(() => import('./pages/customer/CustomerSettings'));
const CustomerTransactions = lazy(() => import('./pages/customer/CustomerTransactions'));

// Lazy-loaded additional Dashboard Pages
const Cards = lazy(() => import('./pages/dashboard/BusinessCards'));
const Reports = lazy(() => import('./pages/dashboard/Reports'));
const CustomerDetail = lazy(() => 
  import('./pages/dashboard/CustomerDetail')
  .catch(error => {
    console.error("Failed to load CustomerDetail component:", error);
    // Return a minimal component as fallback
    return { 
      default: () => <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Error Loading Customer Details</h2>
        <p>There was a problem loading the customer details. Please try refreshing the page.</p>
      </div> 
    };
  })
);
const TransactionDetail = lazy(() => import('./pages/dashboard/TransactionDetail'));
const ProgramCodes = lazy(() => import('./pages/dashboard/ProgramCodes'));

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const BusinessManagement = lazy(() => import('./pages/admin/BusinessManagement'));
const RewardsManagement = lazy(() => import('./pages/admin/RewardsManagement'));
const ReportsAnalytics = lazy(() => import('./pages/admin/ReportsAnalytics'));
const ContentManagement = lazy(() => import('./pages/admin/ContentManagement'));
const BrandingManagement = lazy(() => import('./pages/admin/BrandingManagement'));
const SEOTools = lazy(() => import('./pages/admin/SEOTools'));
const SystemLogs = lazy(() => import('./pages/admin/SystemLogs'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // If a role is required, check if user has that role
    if (requiredRole) {
      const hasAccess = 
        (requiredRole === 'admin' && user.role === 'admin') ||
        (requiredRole === 'business' && (user.role === 'manager' || user.role === 'staff' || user.role === 'admin')) ||
        (requiredRole === 'customer' && user.role === 'customer');

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'customer') {
          navigate('/portal', { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, requiredRole, navigate, location]);

  return <>{children}</>;
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Set a maximum loading time of 5 seconds
    const timeoutId = setTimeout(() => {
      setAppLoading(false);
    }, 5000);

    // If auth loading completes before timeout, update app loading state
    if (!authLoading) {
      setAppLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [authLoading]);

  // Show loading screen only during initial app load
  if (appLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingScreen />}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<LoadingScreen />}>
              <About />
            </Suspense>
          } />
          <Route path="services" element={
            <Suspense fallback={<LoadingScreen />}>
              <Services />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<LoadingScreen />}>
              <Contact />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<LoadingScreen />}>
              <Login />
            </Suspense>
          } />
          <Route path="register" element={
            <Suspense fallback={<LoadingScreen />}>
              <Register />
            </Suspense>
          } />
          <Route path="test-qr" element={
            <Suspense fallback={<LoadingScreen />}>
              <TestQR />
            </Suspense>
          } />
          <Route path="neon-demo" element={
            <Suspense fallback={<LoadingScreen />}>
              <NeonDemo />
            </Suspense>
          } />
        </Route>
        
        {/* Customer Portal Routes */}
        <Route path="/portal" element={
          <ProtectedRoute requiredRole="customer">
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingScreen />}>
              <Rewards />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<LoadingScreen />}>
              <CustomerTransactions />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingScreen />}>
              <CustomerSettings />
            </Suspense>
          } />
        </Route>
        
        {/* Business Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="business">
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="programs" element={
            <Suspense fallback={<LoadingScreen />}>
              <Programs />
            </Suspense>
          } />
          <Route path="programs/:programId/codes" element={
            <Suspense fallback={<LoadingScreen />}>
              <ProgramCodes />
            </Suspense>
          } />
          <Route path="customers" element={
            <Suspense fallback={<LoadingScreen />}>
              <Customers />
            </Suspense>
          } />
          <Route path="customers/:customerId" element={
            <Suspense fallback={<LoadingScreen />}>
              <CustomerDetail />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<LoadingScreen />}>
              <Transactions />
            </Suspense>
          } />
          <Route path="transactions/:transactionId" element={
            <Suspense fallback={<LoadingScreen />}>
              <TransactionDetail />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingScreen />}>
              <Settings />
            </Suspense>
          } />
          <Route path="cards" element={
            <Suspense fallback={<LoadingScreen />}>
              <Cards />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingScreen />}>
              <Reports />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingScreen />}>
              <Rewards />
            </Suspense>
          } />
        </Route>
        
        {/* Admin Dashboard Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<LoadingScreen />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingScreen />}>
              <UserManagement />
            </Suspense>
          } />
          <Route path="businesses" element={
            <Suspense fallback={<LoadingScreen />}>
              <BusinessManagement />
            </Suspense>
          } />
          <Route path="content" element={
            <Suspense fallback={<LoadingScreen />}>
              <ContentManagement />
            </Suspense>
          } />
          <Route path="branding" element={
            <Suspense fallback={<LoadingScreen />}>
              <BrandingManagement />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingScreen />}>
              <RewardsManagement />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingScreen />}>
              <ReportsAnalytics />
            </Suspense>
          } />
          <Route path="seo" element={
            <Suspense fallback={<LoadingScreen />}>
              <SEOTools />
            </Suspense>
          } />
          <Route path="logs" element={
            <Suspense fallback={<LoadingScreen />}>
              <SystemLogs />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingScreen />}>
              <SystemSettings />
            </Suspense>
          } />
        </Route>
        
        {/* Redirects based on user role */}
        <Route 
          path="/customer-portal" 
          element={<Navigate to="/portal" replace />} 
        />
        <Route 
          path="/business-portal" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;