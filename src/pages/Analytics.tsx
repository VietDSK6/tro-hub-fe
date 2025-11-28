import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getOverviewAnalytics,
  getLocationAnalytics,
  getPriceRangeAnalytics,
  getAreaRangeAnalytics,
  getAmenitiesStats,
  getRulesStats,
  getTrendsAnalytics,
} from "@/api/analytics";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCharts(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const overview = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverviewAnalytics,
  });

  const locations = useQuery({
    queryKey: ["analytics", "locations"],
    queryFn: getLocationAnalytics,
  });

  const priceRanges = useQuery({
    queryKey: ["analytics", "price-ranges"],
    queryFn: getPriceRangeAnalytics,
  });

  const areaRanges = useQuery({
    queryKey: ["analytics", "area-ranges"],
    queryFn: getAreaRangeAnalytics,
  });

  const amenities = useQuery({
    queryKey: ["analytics", "amenities"],
    queryFn: getAmenitiesStats,
  });

  const rules = useQuery({
    queryKey: ["analytics", "rules"],
    queryFn: getRulesStats,
  });

  const trends = useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: getTrendsAnalytics,
  });

  const isLoading =
    overview.isLoading || locations.isLoading || priceRanges.isLoading;

  if (isLoading) {
    return (
      <div className="container-app p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu phân tích...</div>
        </div>
      </div>
    );
  }

  const totalPriceListings =
    priceRanges.data?.price_ranges.reduce((sum, r) => sum + r.count, 0) || 0;

  const priceChartData = {
    labels: priceRanges.data?.price_ranges.map((r) => r.label) || [],
    datasets: [
      {
        label: "Số lượng tin",
        data: priceRanges.data?.price_ranges.map((r) => r.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.9)",
          "rgba(16, 185, 129, 0.9)",
          "rgba(245, 158, 11, 0.9)",
          "rgba(239, 68, 68, 0.9)",
          "rgba(139, 92, 246, 0.9)",
          "rgba(236, 72, 153, 0.9)",
          "rgba(99, 102, 241, 0.9)",
        ],
        borderColor: ["rgb(255, 255, 255)"],
        borderWidth: 2,
      },
    ],
  };

  const areaChartData = {
    labels: areaRanges.data?.area_ranges.map((r) => r.label) || [],
    datasets: [
      {
        label: "Số lượng tin",
        data: areaRanges.data?.area_ranges.map((r) => r.count) || [],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(20, 184, 166, 0.8)",
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
          "rgb(34, 197, 94)",
          "rgb(59, 130, 246)",
          "rgb(168, 85, 247)",
          "rgb(236, 72, 153)",
          "rgb(20, 184, 166)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const amenitiesChartData = {
    labels: amenities.data?.amenities.slice(0, 8).map((a) => a.label) || [],
    datasets: [
      {
        label: "Số lượng",
        data: amenities.data?.amenities.slice(0, 8).map((a) => a.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-app max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Thống kê và phân tích thị trường nhà trọ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">
                Tổng số tin
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overview.data?.total_listings || 0}
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">
                Đang cho thuê
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overview.data?.active_listings || 0}
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">tin đang hoạt động</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">
                Giá trung bình
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round((overview.data?.price_stats.average || 0) / 1000000)}
              tr
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-red-600 font-medium">-2.4%</span>
              <span className="text-gray-500 ml-1">
                giảm so với tháng trước
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">
                Diện tích TB
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(overview.data?.area_stats.average || 0)}m²
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 font-medium">+5.1%</span>
              <span className="text-gray-500 ml-1">
                tăng so với tháng trước
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Phân bố theo giá
              </h2>
            </div>
            <div className="space-y-4">
              {priceRanges.data?.price_ranges.map((range, idx) => {
                const maxCount = Math.max(
                  ...(priceRanges.data?.price_ranges.map((r) => r.count) || [1])
                );
                const percentage = (range.count / maxCount) * 100;
                const sharePercent =
                  totalPriceListings > 0
                    ? Math.round((range.count / totalPriceListings) * 100)
                    : 0;

                const colors = [
                  {
                    bg: "bg-blue-500",
                    gradient: "from-blue-400 to-blue-600",
                    text: "text-blue-600",
                  },
                  {
                    bg: "bg-green-500",
                    gradient: "from-green-400 to-green-600",
                    text: "text-green-600",
                  },
                  {
                    bg: "bg-yellow-500",
                    gradient: "from-yellow-400 to-yellow-600",
                    text: "text-yellow-600",
                  },
                  {
                    bg: "bg-red-500",
                    gradient: "from-red-400 to-red-600",
                    text: "text-red-600",
                  },
                  {
                    bg: "bg-purple-500",
                    gradient: "from-purple-400 to-purple-600",
                    text: "text-purple-600",
                  },
                  {
                    bg: "bg-pink-500",
                    gradient: "from-pink-400 to-pink-600",
                    text: "text-pink-600",
                  },
                  {
                    bg: "bg-indigo-500",
                    gradient: "from-indigo-400 to-indigo-600",
                    text: "text-indigo-600",
                  },
                ];

                return (
                  <div key={idx} className="group">
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
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
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
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalPriceListings}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tổng số tin</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {priceRanges.data?.price_ranges.reduce(
                      (max, r) => (r.count > max ? r.count : max),
                      0
                    ) || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Cao nhất</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      totalPriceListings /
                        (priceRanges.data?.price_ranges.length || 1)
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Trung bình</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Phân bố theo diện tích
              </h2>
            </div>
            <div className="space-y-4">
              {areaRanges.data?.area_ranges.map((range, idx) => {
                const maxCount = Math.max(
                  ...(areaRanges.data?.area_ranges.map((r) => r.count) || [1])
                );
                const percentage = (range.count / maxCount) * 100;
                const totalArea =
                  areaRanges.data?.area_ranges.reduce(
                    (sum, r) => sum + r.count,
                    0
                  ) || 1;
                const sharePercent = Math.round(
                  (range.count / totalArea) * 100
                );

                const colors = [
                  {
                    bg: "bg-red-500",
                    gradient: "from-red-400 to-red-600",
                    text: "text-red-600",
                  },
                  {
                    bg: "bg-orange-500",
                    gradient: "from-orange-400 to-orange-600",
                    text: "text-orange-600",
                  },
                  {
                    bg: "bg-green-500",
                    gradient: "from-green-400 to-green-600",
                    text: "text-green-600",
                  },
                  {
                    bg: "bg-blue-500",
                    gradient: "from-blue-400 to-blue-600",
                    text: "text-blue-600",
                  },
                  {
                    bg: "bg-purple-500",
                    gradient: "from-purple-400 to-purple-600",
                    text: "text-purple-600",
                  },
                  {
                    bg: "bg-pink-500",
                    gradient: "from-pink-400 to-pink-600",
                    text: "text-pink-600",
                  },
                  {
                    bg: "bg-teal-500",
                    gradient: "from-teal-400 to-teal-600",
                    text: "text-teal-600",
                  },
                ];

                return (
                  <div key={idx} className="group">
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
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
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
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {areaRanges.data?.area_ranges.reduce(
                      (sum, r) => sum + r.count,
                      0
                    ) || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tổng số tin</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {areaRanges.data?.area_ranges.reduce(
                      (max, r) => (r.count > max ? r.count : max),
                      0
                    ) || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Cao nhất</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (areaRanges.data?.area_ranges.reduce(
                        (sum, r) => sum + r.count,
                        0
                      ) || 0) / (areaRanges.data?.area_ranges.length || 1)
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Trung bình</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Top tiện nghi phổ biến
              </h2>
            </div>
            <div className="space-y-3">
              {amenities.data?.amenities.slice(0, 8).map((amenity, idx) => {
                const maxCount = Math.max(
                  ...(amenities.data?.amenities
                    .slice(0, 8)
                    .map((a) => a.count) || [1])
                );
                const barWidth = (amenity.count / maxCount) * 100;

                const colors = [
                  {
                    bg: "bg-blue-500",
                    light: "bg-blue-100",
                    text: "text-blue-700",
                  },
                  {
                    bg: "bg-green-500",
                    light: "bg-green-100",
                    text: "text-green-700",
                  },
                  {
                    bg: "bg-purple-500",
                    light: "bg-purple-100",
                    text: "text-purple-700",
                  },
                  {
                    bg: "bg-orange-500",
                    light: "bg-orange-100",
                    text: "text-orange-700",
                  },
                  {
                    bg: "bg-pink-500",
                    light: "bg-pink-100",
                    text: "text-pink-700",
                  },
                  {
                    bg: "bg-cyan-500",
                    light: "bg-cyan-100",
                    text: "text-cyan-700",
                  },
                  {
                    bg: "bg-red-500",
                    light: "bg-red-100",
                    text: "text-red-700",
                  },
                  {
                    bg: "bg-indigo-500",
                    light: "bg-indigo-100",
                    text: "text-indigo-700",
                  },
                ];

                return (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-32">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {amenity.label}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className={`relative flex-1 h-8 ${
                            colors[idx % colors.length].light
                          } rounded-lg overflow-hidden`}
                        >
                          <div
                            className={`h-full ${
                              colors[idx % colors.length].bg
                            } transition-all duration-700 ease-out group-hover:opacity-90 flex items-center justify-end pr-3`}
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {amenity.count}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex-shrink-0 w-16 text-right text-sm font-bold ${
                            colors[idx % colors.length].text
                          }`}
                        >
                          {Math.round(barWidth)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {amenities.data?.amenities
                      .slice(0, 8)
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tổng lượt chọn
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {amenities.data?.amenities[0]?.count || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Phổ biến nhất
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Khu vực có nhiều tin nhất
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Khu vực
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Số tin
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Giá TB
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      DT TB
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.data?.top_locations
                    .slice(0, 8)
                    .map((location, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                              {idx + 1}
                            </div>
                            <span className="font-medium text-gray-900">
                              {location.coordinates[1].toFixed(2)},{" "}
                              {location.coordinates[0].toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-semibold text-gray-900">
                          {location.count}
                        </td>
                        <td className="text-right py-3 px-2 text-gray-600">
                          {Math.round(location.avg_price / 1000000)}tr
                        </td>
                        <td className="text-right py-3 px-2 text-gray-600">
                          {Math.round(location.avg_area)}m²
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Thống kê tin đăng theo trạng thái
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  Đang hoạt động
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {overview.data?.active_listings || 0}
                </div>
                <div className="text-xs text-blue-500 mt-1">Đã xác minh</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">
                  Đã cho thuê
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {overview.data?.rented_listings || 0}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  Đã có người thuê
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium mb-1">
                  Chờ duyệt
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {overview.data?.pending_listings || 0}
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  Đang chờ kiểm duyệt
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-medium mb-1">
                  Đã ẩn
                </div>
                <div className="text-2xl font-bold text-gray-700">
                  {overview.data?.hidden_listings || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Người dùng đã ẩn
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-3">
                Phân bố trạng thái
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-4 flex overflow-hidden">
                  <div
                    className="bg-blue-500 h-4"
                    style={{
                      width: `${
                        ((overview.data?.active_listings || 0) /
                          (overview.data?.total_listings || 1)) *
                        100
                      }%`,
                    }}
                    title="Đang hoạt động"
                  ></div>
                  <div
                    className="bg-green-500 h-4"
                    style={{
                      width: `${
                        ((overview.data?.rented_listings || 0) /
                          (overview.data?.total_listings || 1)) *
                        100
                      }%`,
                    }}
                    title="Đã thuê"
                  ></div>
                  <div
                    className="bg-yellow-500 h-4"
                    style={{
                      width: `${
                        ((overview.data?.pending_listings || 0) /
                          (overview.data?.total_listings || 1)) *
                        100
                      }%`,
                    }}
                    title="Chờ duyệt"
                  ></div>
                  <div
                    className="bg-gray-400 h-4"
                    style={{
                      width: `${
                        ((overview.data?.hidden_listings || 0) /
                          (overview.data?.total_listings || 1)) *
                        100
                      }%`,
                    }}
                    title="Đã ẩn"
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">
                    Đang hoạt động:{" "}
                    {Math.round(
                      ((overview.data?.active_listings || 0) /
                        (overview.data?.total_listings || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">
                    Đã thuê:{" "}
                    {Math.round(
                      ((overview.data?.rented_listings || 0) /
                        (overview.data?.total_listings || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">
                    Chờ duyệt:{" "}
                    {Math.round(
                      ((overview.data?.pending_listings || 0) /
                        (overview.data?.total_listings || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="text-gray-600">
                    Đã ẩn:{" "}
                    {Math.round(
                      ((overview.data?.hidden_listings || 0) /
                        (overview.data?.total_listings || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-bold mb-4">Xu hướng thị trường</h2>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="text-sm opacity-90 mb-1">
                  Tổng tin hoạt động
                </div>
                <div className="text-3xl font-bold">
                  {trends.data?.total_active_listings || 0}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Tin đã được xác minh
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="text-sm opacity-90 mb-1">
                  Khoảng giá phổ biến
                </div>
                <div className="text-2xl font-bold">
                  {trends.data?.most_common_price_range?._id
                    ? `${Math.round(
                        Number(trends.data.most_common_price_range._id) /
                          1000000
                      )}-${Math.round(
                        (Number(trends.data.most_common_price_range._id) +
                          1000000) /
                          1000000
                      )}tr`
                    : "N/A"}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {trends.data?.most_common_price_range?.count || 0} tin trong
                  khoảng này
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="text-sm opacity-90 mb-1">
                  Diện tích phổ biến
                </div>
                <div className="text-2xl font-bold">
                  {trends.data?.most_common_area_range?._id
                    ? `${trends.data.most_common_area_range._id}-${
                        Number(trends.data.most_common_area_range._id) + 5
                      }m²`
                    : "N/A"}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {trends.data?.most_common_area_range?.count || 0} tin trong
                  khoảng này
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quy định phổ biến
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rules.data &&
              Object.entries(rules.data.rules_stats).map(([key, stats]) => {
                const labels: Record<string, string> = {
                  pet: "Nuôi thú cưng",
                  smoke: "Hút thuốc",
                  cook: "Nấu ăn",
                  visitor: "Khách thăm",
                };

                const icons: Record<string, string> = {
                  pet: "🐾",
                  smoke: "🚬",
                  cook: "🍳",
                  visitor: "👥",
                };

                const allowedPercent =
                  stats.total > 0
                    ? Math.round((stats.allowed / stats.total) * 100)
                    : 0;

                return (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{icons[key]}</span>
                      <div className="text-sm font-semibold text-gray-900">
                        {labels[key]}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Cho phép</span>
                        <span className="text-sm font-bold text-green-600">
                          {stats.allowed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                          Không cho phép
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {stats.not_allowed}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">
                        Tỷ lệ cho phép
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${allowedPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {allowedPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
