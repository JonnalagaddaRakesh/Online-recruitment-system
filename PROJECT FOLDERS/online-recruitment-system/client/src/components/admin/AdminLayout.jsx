import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-slate-800">Admin Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Toggle Button */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
          >
            <Menu className="w-4 h-4" />
            <span>Admin Menu</span>
          </button>
          <span className="text-xs font-bold text-indigo-600">Admin Control Center</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
