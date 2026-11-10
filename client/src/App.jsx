import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestLayout, AuthLayout } from './pages/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import PreviewPage from './pages/PreviewPage';
import PublishPage from './pages/PublishPage';

const App = () => {
  return (
    <>
      <Routes>
        {/* Guest routes (Redirects to dashboard if already logged in) */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
        </Route>

        {/* Authenticated app routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
        </Route>

        {/* Public & Shareable Website Routes */}
        <Route path="/preview/:id" element={<PreviewPage />} />
        <Route path="/publish/:id" element={<PublishPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
