import { Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProfessorChat } from '@/components/ProfessorChat';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import FaqList from '@/pages/FaqList';
import FaqDetail from '@/pages/FaqDetail';
import AskQuestion from '@/pages/AskQuestion';
import Categories from '@/pages/Categories';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas bg-hero-grid dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faqs" element={<FaqList />} />
          <Route path="/faqs/:id" element={<FaqDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ProfessorChat />
    </div>
  );
}
