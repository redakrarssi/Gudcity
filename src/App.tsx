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
const LoyaltyCards = lazy(() => import('./pages/customer/LoyaltyCards'));

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

// Simple suspense fallback component for all route loading
const SuspenseFallback = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const { user, loading } = useAuth();
  const [appReady, setAppReady] = useState(false);
  
  // Set app as ready after a short delay to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show LoadingScreen only during initial auth loading
  if (loading || !appReady) {
    return <LoadingScreen />;
  }
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<SuspenseFallback />}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<SuspenseFallback />}>
              <About />
            </Suspense>
          } />
          <Route path="services" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Services />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Contact />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="register" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Register />
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
            <Suspense fallback={<SuspenseFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Rewards />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<SuspenseFallback />}>
              <CustomerTransactions />
            </Suspense>
          } />
          <Route path="cards" element={
            <Suspense fallback={<SuspenseFallback />}>
              <LoyaltyCards />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<SuspenseFallback />}>
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
            <Suspense fallback={<SuspenseFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="programs" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Programs />
            </Suspense>
          } />
          <Route path="programs/:programId/codes" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ProgramCodes />
            </Suspense>
          } />
          <Route path="customers" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Customers />
            </Suspense>
          } />
          <Route path="customers/:customerId" element={
            <Suspense fallback={<SuspenseFallback />}>
              <CustomerDetail />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Transactions />
            </Suspense>
          } />
          <Route path="transactions/:transactionId" element={
            <Suspense fallback={<SuspenseFallback />}>
              <TransactionDetail />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Settings />
            </Suspense>
          } />
          <Route path="business-cards" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Cards />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Reports />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<SuspenseFallback />}>
              <Rewards />
            </Suspense>
          } />
        </Route>
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<SuspenseFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<SuspenseFallback />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<SuspenseFallback />}>
              <UserManagement />
            </Suspense>
          } />
          <Route path="businesses" element={
            <Suspense fallback={<SuspenseFallback />}>
              <BusinessManagement />
            </Suspense>
          } />
          <Route path="content" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ContentManagement />
            </Suspense>
          } />
          <Route path="branding" element={
            <Suspense fallback={<SuspenseFallback />}>
              <BrandingManagement />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<SuspenseFallback />}>
              <RewardsManagement />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ReportsAnalytics />
            </Suspense>
          } />
          <Route path="seo" element={
            <Suspense fallback={<SuspenseFallback />}>
              <SEOTools />
            </Suspense>
          } />
          <Route path="logs" element={
            <Suspense fallback={<SuspenseFallback />}>
              <SystemLogs />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<SuspenseFallback />}>
              <SystemSettings />
            </Suspense>
          } />
        </Route>
        
        {/* Catch-all route - redirect to appropriate dashboard based on role */}
        <Route path="*" element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user.role === 'customer' ? (
              <Navigate to="/portal" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>
    </Suspense>
  );
}

export default App;