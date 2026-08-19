import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'applicant',
      });

      if (res.success) {
        toast.success('Registration successful! Welcome to TalentSphere.');
        navigate('/jobs', { replace: true });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Registration failed. Please verify your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Candidate Account
            </h2>
            <p className="text-xs text-slate-500">
              Apply for thousands of jobs with a single profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Alex Morgan"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="alex@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full rounded-xl mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-500"
              >
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
