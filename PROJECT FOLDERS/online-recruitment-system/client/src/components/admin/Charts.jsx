import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  Applied: '#3b82f6',       // blue-500
  'Under Review': '#f59e0b', // amber-500
  Shortlisted: '#a855f7',    // purple-500
  Interview: '#6366f1',      // indigo-500
  Selected: '#10b981',       // emerald-500
  Rejected: '#ef4444',       // red-500
};

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const StatusDistributionChart = ({ data = [] }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-800">Applications by Status</h4>
        <p className="text-xs text-slate-500">Live breakdown across all recruitment pipeline stages</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value} applications`, 'Count']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || '#6366f1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const EmploymentTypeChart = ({ data = [] }) => {
  const filteredData = data.filter((d) => d.count > 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-800">Jobs by Employment Type</h4>
        <p className="text-xs text-slate-500">Distribution of available roles</p>
      </div>
      <div className="h-64 w-full">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No active jobs to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export const ApplicationsPerJobChart = ({ data = [] }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-800">Top Jobs by Applications</h4>
        <p className="text-xs text-slate-500">Most in-demand job postings</p>
      </div>
      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No applications recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value, name, item) => [
                  `${value} applicants (${item.payload.company})`,
                  item.payload.fullTitle,
                ]}
              />
              <Bar dataKey="applications" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
