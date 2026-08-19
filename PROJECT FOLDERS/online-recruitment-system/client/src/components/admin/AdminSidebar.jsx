import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  User,
  LogOut,
  PlusCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminSidebar = ({ mobile = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Admin signed out');
      navigate('/login');
    } catch (e) {
      toast.error('Logout error');
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      end: true,
      icon: LayoutDashboard,
    },
    {
      name: 'Job Management',
      path: '/admin/jobs',
      icon: Briefcase,
    },
    {
      name: 'Applications',
      path: '/admin/applications',
      icon: FileText,
    },
    {
      name: 'Applicants Directory',
      path: '/admin/applicants',
      icon: Users,
    },
    {
      name: 'Admin Profile',
      path: '/profile',
      icon: User,
    },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Admin Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
            <Shield className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
            <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">
              Administrator
            </span>
          </div>
        </div>

        {/* Quick Action */}
        <NavLink
          to="/admin/jobs/create"
          onClick={() => mobile && onClose && onClose()}
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-indigo-400" />
          <span>Post New Job</span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => mobile && onClose && onClose()}
                className={linkClass}
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={() => {
            if (mobile && onClose) onClose();
            handleLogout();
          }}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
