import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { trpc, trpcClient } from './trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Modal from './components/Modal';
import Toast from './components/Toast';
import UserProvider from './providers/userProvider';
import ProjectProvider from './providers/projectProvider';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { route, ROUTES } from './constants/routes';
import LandingPage from './pages/LandingPage';
import ProjectPage from './pages/ProjectPage';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <UserProvider>
            <ProjectProvider>
              <RouteContainer />
              <Modal />
              <Toast />
            </ProjectProvider>
          </UserProvider>
        </Router>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);

function RouteContainer(): JSX.Element {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <Navigate
            to={ROUTES.home}
            replace={true}
          />
        }
      />
      <Route
        path={ROUTES.home}
        element={<LandingPage />}
      />
      <Route
        path={route(ROUTES.project, ':projectId')}
        element={<ProjectPage />}
      />
    </Routes>
  );
}
