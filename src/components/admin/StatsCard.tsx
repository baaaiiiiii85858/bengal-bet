import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
}

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
  };

  return (
    <div className="bg-[#1a1a2e] border border-white/5 p-6 rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={trendUp ? "text-green-500" : "text-red-500"}>
            {trendUp ? "+" : ""}{trend}
          </span>
          <span className="text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
}
