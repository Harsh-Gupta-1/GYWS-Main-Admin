import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/auth/loginPage.jsx';
import BlogRoutes from './pages/blogs/blogRoutes.jsx';
import Home from './pages/home/homePage.jsx';
import Profile from './pages/auth/profilePage.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute';
import NotFound from './pages/notFound/page.jsx';
import MemberRoutes from './pages/members/memberRoutes.jsx';
import { Toaster } from 'react-hot-toast';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="*" element={<NotFound />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              {/* Blog routes */}
              <Route path="/blogs/*" element={<BlogRoutes />} />
              <Route path="/profile" element={<Profile />} />
              
              <Route path="/members/*" element={<MemberRoutes />} />
            </Route>
          </Route>
        </Routes>
      </Router>
     <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
