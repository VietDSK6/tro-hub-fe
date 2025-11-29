import { Doughnut } from "react-chartjs-2";

interface OverviewData {
  total_listings: number;
  active_listings: number;
  rented_listings: number;
  pending_listings: number;
  hidden_listings: number;
}

interface StatusDoughnutChartProps {
  overviewData: OverviewData;
}

export default function StatusDoughnutChart({
  overviewData,
}: StatusDoughnutChartProps) {
  const statusData = [
    {
      label: "Đang hoạt động",
      value: overviewData.active_listings,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      boldColor: "text-blue-700",
      chartColor: "rgba(59, 130, 246, 0.8)",
      chartBorderColor: "rgb(59, 130, 246)",
    },
    {
      label: "Đã cho thuê",
      value: overviewData.rented_listings,
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      textColor: "text-green-600",
      boldColor: "text-green-700",
      chartColor: "rgba(34, 197, 94, 0.8)",
      chartBorderColor: "rgb(34, 197, 94)",
    },
    {
      label: "Chờ duyệt",
      value: overviewData.pending_listings,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-600",
      boldColor: "text-yellow-700",
      chartColor: "rgba(234, 179, 8, 0.8)",
      chartBorderColor: "rgb(234, 179, 8)",
    },
    {
      label: "Đã ẩn",
      value: overviewData.hidden_listings,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-400",
      textColor: "text-gray-600",
      boldColor: "text-gray-700",
      chartColor: "rgba(156, 163, 175, 0.8)",
      chartBorderColor: "rgb(156, 163, 175)",
    },
  ];

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Thống kê tin đăng theo trạng thái
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <div className="w-56 h-56">
            <Doughnut
              data={{
                labels: statusData.map((s) => s.label),
                datasets: [
                  {
                    data: statusData.map((s) => s.value),
                    backgroundColor: statusData.map((s) => s.chartColor),
                    borderColor: statusData.map((s) => s.chartBorderColor),
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed;
                        const total = overviewData.total_listings || 1;
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} tin (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-3">
          {statusData.map((status, idx) => (
            <div
              key={idx}
              className={`${status.bgColor} rounded-lg p-3 border-l-4 ${status.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-xs ${status.textColor} font-medium mb-1`}
                  >
                    {status.label}
                  </div>
                  <div className={`text-xl font-bold ${status.boldColor}`}>
                    {status.value}
                  </div>
                  <div className={`text-xs ${status.textColor} mt-1`}>
                    {Math.round(
                      (status.value / (overviewData.total_listings || 1)) * 100
                    )}
                    % tổng số tin
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
