import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Input, { TextArea, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminJobEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    employmentType: 'Full Time',
    salaryMin: '',
    salaryMax: '',
    experienceRequired: '',
    educationRequired: '',
    vacancies: 1,
    deadline: '',
    status: 'Active',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobService.getJobById(id);
        if (res.success) {
          const j = res.data;
          let formattedDeadline = '';
          if (j.deadline) {
            formattedDeadline = new Date(j.deadline).toISOString().split('T')[0];
          }

          setFormData({
            title: j.title || '',
            company: j.company || '',
            location: j.location || '',
            employmentType: j.employmentType || 'Full Time',
            salaryMin: j.salaryMin || '',
            salaryMax: j.salaryMax || '',
            experienceRequired: j.experienceRequired || '',
            educationRequired: j.educationRequired || '',
            vacancies: j.vacancies || 1,
            deadline: formattedDeadline,
            status: j.status || 'Active',
            description: j.description || '',
            requirements: j.requirements || '',
            responsibilities: j.responsibilities || '',
            skills: Array.isArray(j.skills) ? j.skills.join(', ') : '',
          });
        }
      } catch (err) {
        toast.error('Could not load job details');
        navigate('/admin/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Job location is required';
    if (!formData.deadline) newErrors.deadline = 'Application deadline is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix form errors');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        salaryMin: Number(formData.salaryMin) || 0,
        salaryMax: Number(formData.salaryMax) || 0,
        vacancies: Number(formData.vacancies) || 1,
        skills: skillsArray,
      };

      const res = await jobService.updateJob(id, payload);
      if (res.success) {
        toast.success('Job details updated successfully!');
        navigate('/admin/jobs');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update job';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading job for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/admin/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Job Management</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Job Posting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update role specifications, active status, or modify requirements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <Input
              label="Hiring Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              error={errors.company}
              required
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              required
            />

            <Select
              label="Employment Type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={[
                { value: 'Full Time', label: 'Full Time' },
                { value: 'Part Time', label: 'Part Time' },
                { value: 'Remote', label: 'Remote' },
                { value: 'Internship', label: 'Internship' },
                { value: 'Contract', label: 'Contract' },
              ]}
              required
            />

            <Input
              label="Minimum Salary (USD/yr)"
              name="salaryMin"
              type="number"
              value={formData.salaryMin}
              onChange={handleChange}
            />

            <Input
              label="Maximum Salary (USD/yr)"
              name="salaryMax"
              type="number"
              value={formData.salaryMax}
              onChange={handleChange}
            />

            <Input
              label="Experience Required"
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              required
            />

            <Input
              label="Education Required"
              name="educationRequired"
              value={formData.educationRequired}
              onChange={handleChange}
              required
            />

            <Input
              label="Number of Vacancies"
              name="vacancies"
              type="number"
              min="1"
              value={formData.vacancies}
              onChange={handleChange}
              required
            />

            <Input
              label="Application Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              required
            />

            <Select
              label="Listing Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active (Open)' },
                { value: 'Closed', label: 'Closed' },
                { value: 'Draft', label: 'Draft' },
              ]}
              required
            />

            <Input
              label="Required Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, MongoDB"
            />
          </div>

          <TextArea
            label="Job Description & Overview"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />

          <TextArea
            label="Key Responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            rows={4}
            required
          />

          <TextArea
            label="Skills & Qualifications Required"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={4}
            required
          />

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link to="/admin/jobs">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              icon={Save}
              className="rounded-xl px-6"
            >
              Update Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminJobEditPage;
