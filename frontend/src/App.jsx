import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SongsPage from './pages/songs/SongsPage';
import SongDetailPage from './pages/songs/SongDetailPage';
import SongFormPage from './pages/songs/SongFormPage';
import SongImportPage from './pages/songs/SongImportPage';
import GroupsPage from './pages/groups/GroupsPage';
import GroupFormPage from './pages/groups/GroupFormPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import JoinGroupPage from './pages/groups/JoinGroupPage';
import SetlistsPage from './pages/setlists/SetlistsPage';
import SetlistDetailPage from './pages/setlists/SetlistDetailPage';
import SetlistFormPage from './pages/setlists/SetlistFormPage';
import ProfilePage from './pages/ProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import './i18n';
import './App.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}

function WideLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route pubbliche */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/come-funziona" element={<WideLayout><HowItWorksPage /></WideLayout>} />

          {/* Route protette */}
          <Route path="/songs" element={
            <ProtectedRoute><WideLayout><SongsPage /></WideLayout></ProtectedRoute>
          } />
          <Route path="/songs/new" element={
            <ProtectedRoute><Layout><SongFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/songs/import" element={
            <ProtectedRoute><Layout><SongImportPage /></Layout></ProtectedRoute>
          } />
          <Route path="/songs/:id" element={
            <ProtectedRoute><Layout><SongDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/songs/:id/edit" element={
            <ProtectedRoute><Layout><SongFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/groups" element={
            <ProtectedRoute><Layout><GroupsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/groups/new" element={
            <ProtectedRoute><Layout><GroupFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/groups/:id/edit" element={
            <ProtectedRoute><Layout><GroupFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/groups/:id" element={
            <ProtectedRoute><Layout><GroupDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/join/:token" element={
            <ProtectedRoute><Layout><JoinGroupPage /></Layout></ProtectedRoute>
          } />
          <Route path="/setlists" element={
            <ProtectedRoute><Layout><SetlistsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/setlists/new" element={
            <ProtectedRoute><Layout><SetlistFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/setlists/:id" element={
            <ProtectedRoute><Layout><SetlistDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/setlists/:id/edit" element={
            <ProtectedRoute><Layout><SetlistFormPage /></Layout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/come-funziona" replace />} />
          <Route path="*" element={<Navigate to="/come-funziona" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
