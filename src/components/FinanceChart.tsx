'use client';
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', budgeted: 5000, spent: 4500 },
  { name: 'Feb', budgeted: 6000, spent: 5200 },
  { name: 'Mar', budgeted: 5500, spent: 6000 },
  { name: 'Apr', budgeted: 7000, spent: 6800 },
  { name: 'May', budgeted: 6200, spent: 6100 },
  { name: 'Jun', budgeted: 5800, spent: 5900 },
  { name: 'Jul', budgeted: 6500, spent: 7000 },
  { name: 'Aug', budgeted: 6000, spent: 5700 },
  { name: 'Sep', budgeted: 6300, spent: 6100 },
  { name: 'Oct', budgeted: 6100, spent: 5900 },
  { name: 'Nov', budgeted: 6200, spent: 6400 },
  { name: 'Dec', budgeted: 7000, spent: 7100 },
];

const FinanceChart = () => {
  return (
    <div className='bg-white rounded-xl w-full h-full p-4 text-gray-950'>
      <div className='flex justify-between'>
        <h1 className='text-lg font-semibold'>Monthly Budget Overview</h1>
        <Image src='/moreDark.png' width={20} height={20} alt='more' />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
          <Tooltip />
          <Legend verticalAlign='top' />
          <Line type="monotone" dataKey="budgeted" stroke="#60a5fa" strokeWidth={3} name="Budgeted" />
          <Line type="monotone" dataKey="spent" stroke="#f87171" strokeWidth={3} name="Spent" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
