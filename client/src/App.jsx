import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import GameRoom from './pages/GameRoom';
import Layout from './components/Layout';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return user ? <Navigate to="/" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/friends" 
                element={
                  <PrivateRoute>
                    <Layout>
                        <Friends />
                    </Layout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Layout>
                        <Settings />
                    </Layout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/game/rota" 
                element={
                  <PrivateRoute>
                    <Layout>
                        <GameRoom />
                    </Layout>
                  </PrivateRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
