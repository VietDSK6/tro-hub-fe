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
  MessagesSquare,
  CircleCheck,
  CircleDollarSign,
  ChartArea,
  SunSnow,
  HouseWifi,
  AirVent,
  CircleParking,
  WashingMachine,
  Refrigerator,
  PawPrint,
  Cigarette,
  ChefHat,
  User,
} from "lucide-react";
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

import StatCard from "@/components/analytics/StatCard";
import DistributionChart from "@/components/analytics/DistributionChart";
import AmenityCard from "@/components/analytics/AmenityCard";
import LocationTable from "@/components/analytics/LocationTable";
import StatusDoughnutChart from "@/components/analytics/StatusDoughnutChart";
import TrendCard from "@/components/analytics/TrendCard";
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



  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-app max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-gray-600 mt-1">
            Thống kê và phân tích thị trường nhà trọ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng số tin"
            value={overview.data?.total_listings || 0}
            icon={MessagesSquare}
            iconBgColor="bg-blue-100"
            iconColor="text-[#65a6ff]"
          />
          <StatCard
            title="Đang cho thuê"
            value={overview.data?.active_listings || 0}
            icon={CircleCheck}
            iconBgColor="bg-green-100"
            iconColor="text-[#15c140]"
          />
          <StatCard
            title="Giá trung bình"
            value={`${Math.round(
              (overview.data?.price_stats.average || 0) / 1000000
            )}tr`}
            icon={CircleDollarSign}
            iconBgColor="bg-orange-100"
            iconColor="text-[#c18b15]"
          />
          <StatCard
            title="Diện tích TB"
            value={`${Math.round(overview.data?.area_stats.average || 0)}m²`}
            icon={ChartArea}
            iconBgColor="bg-purple-100"
            iconColor="text-[#894aa5]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DistributionChart
            title="Phân bố theo giá"
            data={priceRanges.data?.price_ranges || []}
            colors={[
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
            ]}
            animateCharts={animateCharts}
            tooltipField="avg_area"
            tooltipLabel="DT TB"
          />

          <DistributionChart
            title="Phân bố theo diện tích"
            data={areaRanges.data?.area_ranges || []}
            colors={[
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
            ]}
            animateCharts={animateCharts}
            tooltipField="avg_price"
            tooltipLabel="Giá TB"
          />
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

                const numberColors = [
                  "bg-[#93C5FD]",
                  "bg-[#6EE7B7]",
                  "bg-[#C4B5FD]",
                  "bg-[#FDBA74]",
                  "bg-[#FDA4AF]",
                  "bg-[#7DD3FC]",
                ];

                const amenityIcons = [
                  <SunSnow size={14} className="text-blue-600" />,
                  <AirVent size={14} className="text-green-600" />,
                  <HouseWifi size={14} className="text-purple-600" />,
                  <CircleParking size={14} className="text-orange-700" />,
                  <WashingMachine size={14} className="text-pink-600" />,
                  <Refrigerator size={14} className="text-cyan-600" />,
                ];

                const iconBackgrounds = [
                  "bg-[#93C5FD] border-blue-300",
                  "bg-[#6EE7B7] border-green-300",
                  "bg-[#C4B5FD] border-purple-300",
                  "bg-[#FDBA74] border-orange-300",
                  "bg-[#FDA4AF] border-pink-300",
                  "bg-[#7DD3FC] border-cyan-300",
                ];

                return (
                  <AmenityCard
                    key={idx}
                    amenity={amenity}
                    index={idx}
                    icon={amenityIcons[idx]}
                    iconBackground={iconBackgrounds[idx]}
                    numberColor={numberColors[idx % numberColors.length]}
                    percentage={percentage}
                    animateCharts={animateCharts}
                  />
                );
              })}
            </div>
          </div>

          <LocationTable locations={locations.data?.top_locations || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {overview.data && (
            <StatusDoughnutChart overviewData={overview.data} />
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Xu hướng thị trường
            </h2>
            <div className="space-y-4">
              <TrendCard
                title="Tổng tin hoạt động"
                value={trends.data?.total_active_listings || 0}
                description="Tin đã được xác minh"
                icon={CircleCheck}
                colorScheme="blue"
              />

              <TrendCard
                title="Khoảng giá phổ biến"
                value={
                  trends.data?.most_common_price_range?._id
                    ? `${Math.round(
                        Number(trends.data.most_common_price_range._id) /
                          1000000
                      )}-${Math.round(
                        (Number(trends.data.most_common_price_range._id) +
                          1000000) /
                          1000000
                      )}tr`
                    : "N/A"
                }
                description={`${
                  trends.data?.most_common_price_range?.count || 0
                } tin trong khoảng này`}
                icon={CircleDollarSign}
                colorScheme="green"
              />

              <TrendCard
                title="Diện tích phổ biến"
                value={
                  trends.data?.most_common_area_range?._id
                    ? `${trends.data.most_common_area_range._id}-${
                        Number(trends.data.most_common_area_range._id) + 5
                      }m²`
                    : "N/A"
                }
                description={`${
                  trends.data?.most_common_area_range?.count || 0
                } tin trong khoảng này`}
                icon={ChartArea}
                colorScheme="purple"
              />
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
                  pet: <PawPrint className="w-7 h-7 text-orange-500" />,
                  smoke: <Cigarette className="w-7 h-7 text-gray-500" />,
                  cook: <ChefHat className="w-7 h-7 text-red-500" />,
                  visitor: <User className="w-7 h-7 text-blue-500" />,
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
