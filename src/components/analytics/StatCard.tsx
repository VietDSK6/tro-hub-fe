import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-600">{title}</div>
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}
        >
          <Icon className={iconColor} />
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
    </div>
  );
}
