import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xs text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center space-x-3">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary" size="md">
              Find Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
