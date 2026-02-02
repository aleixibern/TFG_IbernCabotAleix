import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
// import LoginPage from './pages/LoginPage'; // Encara no la tenim

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigim l'arrel al registre temporalment */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        
        <Route path="/register" element={<RegisterPage />} />
        
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;