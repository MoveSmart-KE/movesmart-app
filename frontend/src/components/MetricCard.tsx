
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  changeType: "increase" | "decrease";
}

const MetricCard = ({ title, value, change, icon: Icon, changeType }: MetricCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className={`text-xs ${
          changeType === "increase" ? "text-green-600" : "text-red-600"
        }`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
