import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import ScorecardPage from './ScorecardPage.jsx';
import CreateMatch from './CreateMatch.jsx'; // ← NEW import

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Leaderboard page
  },
  {
    path: '/scorecard',
    element: <ScorecardPage />, // Score entry page
  },
  {
    path: '/create',
    element: <CreateMatch />, // ← NEW route
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
