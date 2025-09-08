import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TopRoutesChartProps {
  data: { name: string; value: number }[];
}

const TopRoutesChart = ({ data }: TopRoutesChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Corridors for AI Savings</CardTitle>
        <CardDescription>
          These are the routes where the MoveSmart AI is saving the most time for drivers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Total Time Saved (min)" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopRoutesChart;
