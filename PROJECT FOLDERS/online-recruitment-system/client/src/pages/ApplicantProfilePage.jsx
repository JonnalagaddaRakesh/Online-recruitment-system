import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Sparkles,
  Briefcase,
  UploadCloud,
  FileText,
  Save,
  CheckCircle2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import Input, { TextArea, Select } from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ApplicantProfilePage = () => {
  const { user, updateUser, isApplicant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    education: '',
    skills: '',
    experience: '',
  });

  const [currentResume, setCurrentResume] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res.success) {
          const u = res.data.user || {};
          const p = res.data.profile || {};

          let formattedDob = '';
          if (p.dateOfBirth) {
            formattedDob = new Date(p.dateOfBirth).toISOString().split('T')[0];
          }

          setFormData({
            fullName: p.fullName || u.name || '',
            email: u.email || '',
            phone: p.phone || u.phone || '',
            dateOfBirth: formattedDob,
            gender: p.gender || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            education: p.education || '',
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
            experience: p.experience || '',
          });

          setCurrentResume(p.resume || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Could not load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resume must be under 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName.trim());
      data.append('phone', formData.phone.trim());

      if (isApplicant) {
        if (formData.dateOfBirth) data.append('dateOfBirth', formData.dateOfBirth);
        if (formData.gender) data.append('gender', formData.gender);
        if (formData.address) data.append('address', formData.address.trim());
        if (formData.city) data.append('city', formData.city.trim());
        if (formData.state) data.append('state', formData.state.trim());
        if (formData.education) data.append('education', formData.education.trim());
        if (formData.experience) data.append('experience', formData.experience.trim());

        const skillsArray = formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        data.append('skills', JSON.stringify(skillsArray));

        if (resumeFile) {
          data.append('resume', resumeFile);
        }
      }

      if (avatarFile) {
        data.append('profileImage', avatarFile);
      }

      const res = await profileService.updateProfile(data);
      if (res.success) {
        toast.success('Profile updated successfully!');
        if (res.data.user) {
          updateUser(res.data.user);
        }
        if (res.data.profile?.resume) {
          setCurrentResume(res.data.profile.resume);
          setResumeFile(null);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading user profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-500/20">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {formData.fullName || 'User Profile'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Your core contact and identity details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera"
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              disabled
              helperText="Email address cannot be changed"
              icon={Mail}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              icon={Phone}
            />

            {isApplicant && (
              <>
                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  icon={Calendar}
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />

                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address..."
                  icon={MapPin}
                />

                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco"
                />

                <Input
                  label="State / Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. California"
                />
              </>
            )}
          </div>
        </div>

        {/* Professional Details (Applicant Only) */}
        {isApplicant && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Professional Qualifications</h2>
              <p className="text-xs text-slate-500">
                These qualifications are used to automatically populate your job applications
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Education & Degrees"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.S. in Computer Science, Stanford University"
                icon={GraduationCap}
              />

              <Input
                label="Skills (comma separated)"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, TypeScript, Docker, Tailwind CSS"
                icon={Sparkles}
                helperText="Comma-separated tags representing your core proficiencies"
              />

              <TextArea
                label="Work Experience & Past Roles"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your career trajectory, key accomplishments, technologies used..."
              />

              {/* Resume Document Manager */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Default Resume Document
                </label>

                {currentResume && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{currentResume}</p>
                        <p className="text-[10px] text-slate-500">Current saved resume</p>
                      </div>
                    </div>
                    <a
                      href={`/uploads/resumes/${currentResume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    id="profileResume"
                    name="profileResume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profileResume"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                  >
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600">
                      {resumeFile ? `Selected: ${resumeFile.name}` : 'Upload new resume (PDF/DOC/DOCX)'}
                    </span>
                    <span className="text-[10px] text-slate-400">Max size 5MB</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            icon={Save}
            className="rounded-xl px-6 shadow-sm"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicantProfilePage;
