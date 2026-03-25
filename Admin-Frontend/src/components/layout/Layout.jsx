import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;