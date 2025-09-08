import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

interface DailyStat {
  date: string;
  timeSaved: number;
}

const PersonalSavingsChart = () => {
  const chartData = useMemo(() => {
    const statsRaw = localStorage.getItem('movesmart_daily_stats');
    const stats: DailyStat[] = statsRaw ? JSON.parse(statsRaw) : [];

    // Ensure we have data for the last 7 days, even if it's zero
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const stat = stats.find(s => s.date === dateString);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        "Time Saved (min)": stat ? Math.round(stat.timeSaved) : 0,
      });
    }
    return data;
  }, []);

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Your Weekly Savings</CardTitle>
        <CardDescription>Time you've saved by taking AI-recommended routes over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Time Saved (min)" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PersonalSavingsChart;
