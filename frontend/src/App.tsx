import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { PrivateRoute } from './components/PrivateRoute'; 
import DashboardPage from './pages/DashboardPage';
import ProjectBoardPage from './pages/ProjectBoardPage';

const DashboardPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-screen text-white">
    <h1 className="text-4xl font-bold">🎉 Dins!</h1>
    <p>Has iniciat sessió correctament.</p>
    <button 
      onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
      className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
    >
      Tancar Sessió
    </button>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/project/:id" element={<ProjectBoardPage />} />
      <Route path="/projects/:id" element={<ProjectBoardPage />} />
    </Routes>
  );
}

export default App;