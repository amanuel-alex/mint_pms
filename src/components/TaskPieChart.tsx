import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Completed', value: 158 },
  { name: 'Pending', value: 43 },
  { name: 'Overdue', value: 7 },
];

const COLORS = ['#16a34a', '#facc15', '#dc2626'];

const TaskPieChart = () => (
  <PieChart width={400} height={350}>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
);

export default TaskPieChart;
