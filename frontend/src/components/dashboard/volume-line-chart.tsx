'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VolumeDataPoint } from '@/types/dashboard.types';

interface VolumeLineChartProps {
  data: VolumeDataPoint[];
}

export default function VolumeLineChart({ data }: VolumeLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية
      </div>
    );
  }

  const formattedData = data.map((point) => {
    const date = new Date(point.date);
    return {
      ...point,
      label: date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip
          labelFormatter={(label) => `التاريخ: ${label}`}
          formatter={(value: number) => [value, 'عدد المحادثات']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          name="المحادثات"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}