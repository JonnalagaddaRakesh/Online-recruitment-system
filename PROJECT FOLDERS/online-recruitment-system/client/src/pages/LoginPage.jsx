import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData);
      if (res.success) {
        toast.success(`Welcome back, ${res.data.user.name}!`);
        if (from) {
          navigate(from, { replace: true });
        } else if (res.data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/jobs', { replace: true });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickDemo = (email, password) => {
    setFormData({ email, password });
    setErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to TalentSphere
            </h2>
            <p className="text-xs text-slate-500">
              Access your recruiter dashboard or candidate applications
            </p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
              ⚡ One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@example.com', 'Admin@123')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center space-x-1 border border-indigo-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.connor@example.com', 'Password@123')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center space-x-1 border border-emerald-200 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Applicant Demo</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full rounded-xl mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-500"
              >
                Create Applicant Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
