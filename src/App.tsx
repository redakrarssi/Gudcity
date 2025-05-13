import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Core layouts (keep these imported directly as they're critical for initial render)
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';

// Global loading fallback
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

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
const Customers = lazy(() => import('./pages/dashboard/Customers'));
const Transactions = lazy(() => import('./pages/dashboard/Transactions'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Rewards = lazy(() => import('./pages/dashboard/rewards'));
const CustomerSettings = lazy(() => import('./pages/customer/CustomerSettings'));
const CustomerTransactions = lazy(() => import('./pages/customer/CustomerTransactions'));

// Lazy-loaded additional Dashboard Pages
const Cards = lazy(() => import('./pages/dashboard/BusinessCards'));
const Reports = lazy(() => import('./pages/dashboard/Reports'));
const CustomerDetail = lazy(() => import('./pages/dashboard/CustomerDetail'));
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

// Protected Route component - temporarily bypassing authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  // In a real application, you would check if the user has the required role
  // For now, we're bypassing authentication checks completely
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<LoadingFallback />}>
              <About />
            </Suspense>
          } />
          <Route path="services" element={
            <Suspense fallback={<LoadingFallback />}>
              <Services />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<LoadingFallback />}>
              <Contact />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="register" element={
            <Suspense fallback={<LoadingFallback />}>
              <Register />
            </Suspense>
          } />
          <Route path="test-qr" element={
            <Suspense fallback={<LoadingFallback />}>
              <TestQR />
            </Suspense>
          } />
          <Route path="neon-demo" element={
            <Suspense fallback={<LoadingFallback />}>
              <NeonDemo />
            </Suspense>
          } />
        </Route>
        
        {/* Customer Portal Routes */}
        <Route path="/portal" element={<DashboardLayout />}>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingFallback />}>
              <Rewards />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerTransactions />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerSettings />
            </Suspense>
          } />
        </Route>
        
        {/* Business Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="programs" element={
            <Suspense fallback={<LoadingFallback />}>
              <Programs />
            </Suspense>
          } />
          <Route path="programs/:programId/codes" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProgramCodes />
            </Suspense>
          } />
          <Route path="customers" element={
            <Suspense fallback={<LoadingFallback />}>
              <Customers />
            </Suspense>
          } />
          <Route path="customers/:customerId" element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerDetail />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<LoadingFallback />}>
              <Transactions />
            </Suspense>
          } />
          <Route path="transactions/:transactionId" element={
            <Suspense fallback={<LoadingFallback />}>
              <TransactionDetail />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
          <Route path="cards" element={
            <Suspense fallback={<LoadingFallback />}>
              <Cards />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingFallback />}>
              <Reports />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingFallback />}>
              <Rewards />
            </Suspense>
          } />
        </Route>
        
        {/* Admin Dashboard Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<LoadingFallback />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingFallback />}>
              <UserManagement />
            </Suspense>
          } />
          <Route path="businesses" element={
            <Suspense fallback={<LoadingFallback />}>
              <BusinessManagement />
            </Suspense>
          } />
          <Route path="content" element={
            <Suspense fallback={<LoadingFallback />}>
              <ContentManagement />
            </Suspense>
          } />
          <Route path="branding" element={
            <Suspense fallback={<LoadingFallback />}>
              <BrandingManagement />
            </Suspense>
          } />
          <Route path="rewards" element={
            <Suspense fallback={<LoadingFallback />}>
              <RewardsManagement />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingFallback />}>
              <ReportsAnalytics />
            </Suspense>
          } />
          <Route path="seo" element={
            <Suspense fallback={<LoadingFallback />}>
              <SEOTools />
            </Suspense>
          } />
          <Route path="logs" element={
            <Suspense fallback={<LoadingFallback />}>
              <SystemLogs />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
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