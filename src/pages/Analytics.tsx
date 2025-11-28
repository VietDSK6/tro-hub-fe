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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600">
                Tổng số tin
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {overview.data?.total_listings || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600">
                Đang cho thuê
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {overview.data?.active_listings || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600">
                Giá trung bình
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
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
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {Math.round((overview.data?.price_stats.average || 0) / 1000000)}
              tr
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600">
                Diện tích TB
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
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
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {Math.round(overview.data?.area_stats.average || 0)}m²
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
                            <span className="text-gray-400">DT TB:</span>
                            <span className="font-bold">
                              {Math.round(range.avg_area)}m²
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
                            <span className="text-gray-400">Giá TB:</span>
                            <span className="font-bold">
                              {Math.round(range.avg_price / 1000000)}tr
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.data?.amenities.slice(0, 6).map((amenity, idx) => {
                const maxCount = Math.max(
                  ...(amenities.data?.amenities
                    .slice(0, 6)
                    .map((a) => a.count) || [1])
                );
                const percentage = (amenity.count / maxCount) * 100;

                const gradients = [
                  "from-blue-500 to-blue-600",
                  "from-green-500 to-green-600",
                  "from-purple-500 to-purple-600",
                  "from-orange-500 to-orange-600",
                  "from-pink-500 to-pink-600",
                  "from-cyan-500 to-cyan-600",
                ];

                const bgColors = [
                  "bg-blue-50",
                  "bg-green-50",
                  "bg-purple-50",
                  "bg-orange-50",
                  "bg-pink-50",
                  "bg-cyan-50",
                ];

                return (
                  <div
                    key={idx}
                    className={`${
                      bgColors[idx % bgColors.length]
                    } rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
                        gradients[idx % gradients.length]
                      } opacity-10 rounded-bl-full`}
                    ></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                            gradients[idx % gradients.length]
                          } flex items-center justify-center text-white font-bold text-lg shadow-md`}
                        >
                          {idx + 1}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {amenity.count}
                          </div>
                          <div className="text-xs text-gray-500">tin đăng</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {amenity.label}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {Math.round(amenity.avg_price / 1000000)}tr
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                            <span>{Math.round(amenity.avg_area)}m²</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            gradients[idx % gradients.length]
                          } rounded-full transition-all duration-1000 ease-out`}
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

                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
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

                const iconSvgs: Record<string, JSX.Element> = {
                  pet: (
                    <svg
                      className="w-7 h-7 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      <circle cx="6" cy="6" r="1.5" />
                      <circle cx="14" cy="6" r="1.5" />
                      <circle cx="10" cy="4" r="1.5" />
                      <circle cx="10" cy="9" r="2" />
                    </svg>
                  ),
                  smoke: (
                    <svg
                      className="w-7 h-7 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ),
                  cook: (
                    <svg
                      className="w-7 h-7 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ),
                  visitor: (
                    <svg
                      className="w-7 h-7 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  ),
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
                      <div className="flex-shrink-0">{iconSvgs[key]}</div>
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
