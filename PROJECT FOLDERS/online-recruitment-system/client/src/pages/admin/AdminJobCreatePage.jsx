import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, Plus } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Input, { TextArea, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const AdminJobCreatePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    employmentType: 'Full Time',
    salaryMin: '',
    salaryMax: '',
    experienceRequired: '1-3 Years',
    educationRequired: "Bachelor's Degree",
    vacancies: 1,
    deadline: '',
    status: 'Active',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
  });

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
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Job location is required';
    if (!formData.deadline) newErrors.deadline = 'Application deadline is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    if (!formData.responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
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

      const res = await jobService.createJob(payload);
      if (res.success) {
        toast.success('Job posting created successfully!');
        navigate('/admin/jobs');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
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
            Create New Job Posting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify job specifications, compensation, requirements, and deadline.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Engineer"
              error={errors.title}
              required
            />

            <Input
              label="Hiring Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Tech Solutions"
              error={errors.company}
              required
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA or Remote"
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
              placeholder="e.g. 90000"
            />

            <Input
              label="Maximum Salary (USD/yr)"
              name="salaryMax"
              type="number"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g. 130000"
            />

            <Input
              label="Experience Required"
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              placeholder="e.g. 3-5 Years"
              required
            />

            <Input
              label="Education Required"
              name="educationRequired"
              value={formData.educationRequired}
              onChange={handleChange}
              placeholder="e.g. Bachelor's in Computer Science"
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
                { value: 'Active', label: 'Active (Accepting Applications)' },
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
              placeholder="e.g. React, Node.js, Express, MongoDB"
              helperText="Comma-separated competencies"
            />
          </div>

          <TextArea
            label="Job Description & Overview"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Detailed description of the role, team, and company culture..."
            error={errors.description}
            required
          />

          <TextArea
            label="Key Responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            rows={4}
            placeholder="• Deliver production React components&#10;• Maintain scalable Node APIs&#10;• Collaborate with UX designers..."
            error={errors.responsibilities}
            required
          />

          <TextArea
            label="Skills & Qualifications Required"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={4}
            placeholder="• 3+ years experience with JavaScript/React&#10;• Proven knowledge of MongoDB schema design&#10;• Experience with Git and CI/CD..."
            error={errors.requirements}
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
              loading={submitting}
              icon={Save}
              className="rounded-xl px-6"
            >
              Publish Job Posting
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminJobCreatePage;
