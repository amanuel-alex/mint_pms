'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  {
    name: 'Team A',
    completed: 8,
    inProgress: 3,
    cancelled: 1
  },
  {
    name: 'Team B',
    completed: 6,
    inProgress: 5,
    cancelled: 2
  },
  {
    name: 'Team C',
    completed: 10,
    inProgress: 1,
    cancelled: 0
  },
  {
    name: 'Team D',
    completed: 5,
    inProgress: 4,
    cancelled: 3
  }
];

const AnalyticsChart = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Project Status by Team</h2>
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', backgroundColor: '#f9fafb' }}
              labelStyle={{ fontWeight: 'bold', color: '#111827' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="completed" stackId="a" fill="#34D399" name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="inProgress" stackId="a" fill="#60A5FA" name="In Progress" />
            <Bar dataKey="cancelled" stackId="a" fill="#F87171" name="Delayed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
