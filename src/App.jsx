import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
// Import your other components here

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Your routes here */}
          <Route path="/" element={<div>Home Page</div>} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App; 