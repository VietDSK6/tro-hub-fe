import { LucideIcon } from "lucide-react";

interface TrendCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  colorScheme: "blue" | "green" | "purple";
}

export default function TrendCard({
  title,
  value,
  description,
  icon: Icon,
  colorScheme,
}: TrendCardProps) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      titleText: "text-blue-700",
      valueText: "text-blue-900",
      descText: "text-blue-600",
      iconBg: "bg-blue-200",
      iconColor: "text-blue-700",
    },
    green: {
      gradient: "from-green-50 to-green-100",
      border: "border-green-200",
      titleText: "text-green-700",
      valueText: "text-green-900",
      descText: "text-green-600",
      iconBg: "bg-green-200",
      iconColor: "text-green-700",
    },
    purple: {
      gradient: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      titleText: "text-purple-700",
      valueText: "text-purple-900",
      descText: "text-purple-600",
      iconBg: "bg-purple-200",
      iconColor: "text-purple-700",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <div
      className={`bg-gradient-to-br ${colors.gradient} rounded-xl p-5 border ${colors.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-medium ${colors.titleText} mb-2`}>
            {title}
          </div>
          <div className={`text-3xl font-bold ${colors.valueText}`}>
            {value}
          </div>
          <div className={`text-xs ${colors.descText} mt-2`}>{description}</div>
        </div>
        <div
          className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={colors.iconColor} size={24} />
        </div>
      </div>
    </div>
  );
}
