import { CircleDollarSign, ChartArea } from "lucide-react";

interface AmenityData {
  label: string;
  count: number;
  avg_price: number;
  avg_area: number;
}

interface AmenityCardProps {
  amenity: AmenityData;
  index: number;
  icon: React.ReactNode;
  iconBackground: string;
  numberColor: string;
  percentage: number;
  animateCharts: boolean;
}

export default function AmenityCard({
  amenity,
  index,
  icon,
  iconBackground,
  numberColor,
  percentage,
  animateCharts,
}: AmenityCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden border border-gray-200">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-200 to-transparent opacity-30 rounded-bl-full"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-8 h-8 rounded-lg ${numberColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
          >
            {index + 1}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {amenity.count}
            </div>
            <div className="text-xs text-gray-500">tin đăng</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 shadow-sm ${iconBackground}`}
            >
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              {amenity.label}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CircleDollarSign size={16} className="text-green-600" />
              <span>{Math.round(amenity.avg_price / 1000000)}tr</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1">
              <ChartArea size={16} className="text-gray-500" />
              <span>{Math.round(amenity.avg_area)}m²</span>
            </div>
          </div>
        </div>

        <div className="relative h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full ${numberColor} rounded-full transition-all duration-1000 ease-out`}
            style={{
              width: animateCharts ? `${percentage}%` : "0%",
            }}
          >
            <div className="h-full w-full bg-white/30 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-1 text-right">
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
