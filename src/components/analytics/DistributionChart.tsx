interface ColorScheme {
  bg: string;
  gradient: string;
  text: string;
}

interface RangeData {
  label: string;
  count: number;
  avg_area?: number;
  avg_price?: number;
}

interface DistributionChartProps {
  title: string;
  data: RangeData[];
  colors: ColorScheme[];
  animateCharts: boolean;
  tooltipField: "avg_area" | "avg_price";
  tooltipLabel: string;
}

export default function DistributionChart({
  title,
  data,
  colors,
  animateCharts,
  tooltipField,
  tooltipLabel,
}: DistributionChartProps) {
  const maxCount = Math.max(...(data.map((r) => r.count) || [1]));
  const totalCount = data.reduce((sum, r) => sum + r.count, 0) || 1;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {data.map((range, idx) => {
          const percentage = (range.count / maxCount) * 100;
          const sharePercent = Math.round((range.count / totalCount) * 100);

          return (
            <div key={idx} className="group relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      colors[idx % colors.length].bg
                    }`}
                  ></div>
                  <span className="text-sm font-semibold text-gray-900">
                    {range.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {range.count} tin
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      colors[idx % colors.length].text
                    } min-w-[3rem] text-right`}
                  >
                    {sharePercent}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden cursor-pointer">
                <div
                  className={`h-full bg-gradient-to-r ${
                    colors[idx % colors.length].gradient
                  } rounded-full transition-all duration-700 ease-out group-hover:opacity-90`}
                  style={{
                    width: animateCharts ? `${percentage}%` : "0%",
                  }}
                >
                  <div className="h-full w-full animate-pulse opacity-30 bg-white"></div>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                  <div className="font-semibold mb-1.5 border-b border-gray-700 pb-1">
                    {range.label}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">Số lượng:</span>
                      <span className="font-bold">{range.count} tin</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">Tỷ lệ:</span>
                      <span className="font-bold">{sharePercent}%</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">{tooltipLabel}:</span>
                      <span className="font-bold">
                        {tooltipField === "avg_area"
                          ? `${Math.round(range.avg_area || 0)}m²`
                          : `${Math.round((range.avg_price || 0) / 1000000)}tr`}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-500 mt-1">Tổng số tin</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{maxCount}</div>
            <div className="text-xs text-gray-500 mt-1">Cao nhất</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(totalCount / (data.length || 1))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Trung bình</div>
          </div>
        </div>
      </div>
    </div>
  );
}
