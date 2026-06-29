'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChannelDistribution } from '@/types/dashboard.types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'واتساب',
  INSTAGRAM: 'إنستغرام',
  TELEGRAM: 'تيليجرام',
  EMAIL: 'بريد إلكتروني',
};

interface ChannelPieChartProps {
  data: ChannelDistribution[];
}

export default function ChannelPieChart({ data }: ChannelPieChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        name: CHANNEL_LABELS[item.channel] ?? item.channel,
      })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [value, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}