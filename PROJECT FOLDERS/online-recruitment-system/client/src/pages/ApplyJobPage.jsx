import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  UploadCloud,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { profileService } from '../services/profileService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import Input, { TextArea } from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ApplyJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    skills: '',
    experience: '',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobRes, profRes] = await Promise.all([
          jobService.getJobById(id),
          profileService.getProfile(),
        ]);

        if (jobRes.success) {
          setJob(jobRes.data);
          // If applicant already applied, redirect
          if (jobRes.data.hasApplied) {
            toast.error('You have already applied for this job.');
            navigate(`/jobs/${id}`, { replace: true });
            return;
          }
          if (new Date(jobRes.data.deadline) < new Date() || jobRes.data.status === 'Closed') {
            toast.error('Applications for this job are closed.');
            navigate(`/jobs/${id}`, { replace: true });
            return;
          }
        }

        if (profRes.success && profRes.data) {
          const p = profRes.data.profile || {};
          const u = profRes.data.user || user;
          setProfile(p);
          setExistingResume(p.resume || '');
          setFormData({
            fullName: p.fullName || u.name || '',
            email: p.email || u.email || '',
            phone: p.phone || u.phone || '',
            education: p.education || '',
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
            experience: p.experience || '',
            coverLetter: '',
          });
        }
      } catch (err) {
        console.error('Error loading apply page data:', err);
        toast.error('Could not prepare application form');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setErrors({
        ...errors,
        resume: 'Invalid file format. Please upload a PDF, DOC, or DOCX document.',
      });
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        resume: 'File is too large. Maximum allowed size is 5MB.',
      });
      return;
    }

    setResumeFile(file);
    setErrors({ ...errors, resume: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.education.trim()) newErrors.education = 'Education is required';
    if (!formData.skills.trim()) newErrors.skills = 'Please specify your key skills';
    if (!formData.experience.trim()) newErrors.experience = 'Experience description is required';

    if (!resumeFile && !existingResume) {
      newErrors.resume = 'Please upload your resume document';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('jobId', id);
      data.append('fullName', formData.fullName.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formData.phone.trim());
      data.append('education', formData.education.trim());
      data.append('experience', formData.experience.trim());
      data.append('coverLetter', formData.coverLetter.trim());

      // Skills array
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      data.append('skills', JSON.stringify(skillsArray));

      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      const res = await applicationService.applyForJob(data);
      if (res.success) {
        toast.success('Application submitted successfully!');
        navigate('/my-applications', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to submit application. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Preparing application form..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to={`/jobs/${id}`}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Cancel & Return to Job</span>
      </Link>

      {/* Target Job Summary Banner */}
      {job && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Applying for Position at {job.company}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {job.title}
            </h1>
            <p className="text-xs text-slate-300">
              {job.location} • {job.employmentType}
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 rounded-xl text-xs font-semibold">
              Active Opening
            </span>
          </div>
        </div>
      )}

      {/* Application Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Candidate Information</h2>
          <p className="text-xs text-slate-500">
            Review your contact and professional qualifications before submission.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Sarah Connor"
            icon={User}
            error={errors.fullName}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            icon={Mail}
            error={errors.email}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            icon={Phone}
            error={errors.phone}
          />

          <Input
            label="Highest Education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="e.g. B.S. Computer Science, Stanford"
            icon={GraduationCap}
            error={errors.education}
            required
          />
        </div>

        <Input
          label="Key Skills (comma separated)"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS, REST APIs"
          icon={Sparkles}
          error={errors.skills}
          helperText="List your core technical and domain skills relevant to this role"
          required
        />

        <TextArea
          label="Relevant Work Experience Summary"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows={3}
          placeholder="Summarize your professional experience, past projects, or relevant roles..."
          error={errors.experience}
          required
        />

        <TextArea
          label="Cover Letter / Note to Hiring Manager (Optional)"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          rows={4}
          placeholder="Why are you the right fit for this role? Highlight key achievements..."
        />

        {/* Resume Upload Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Resume / Curriculum Vitae <span className="text-rose-500">*</span>
          </label>

          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resume"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                Click to upload resume document
              </p>
              <p className="text-[11px] text-slate-400">
                Supported formats: PDF, DOC, DOCX (Maximum file size: 5MB)
              </p>
            </label>

            {/* Selected File Feedback */}
            {resumeFile ? (
              <div className="mt-4 inline-flex items-center space-x-2 bg-indigo-50 text-indigo-800 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate max-w-xs">{resumeFile.name}</span>
                <span className="text-slate-400">
                  ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="text-slate-400 hover:text-rose-600 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : existingResume ? (
              <div className="mt-4 inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Using saved profile resume: {existingResume}</span>
              </div>
            ) : null}
          </div>
          {errors.resume && (
            <p className="text-xs text-rose-600 font-medium">{errors.resume}</p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link to={`/jobs/${id}`}>
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="rounded-xl px-6"
          >
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplyJobPage;
