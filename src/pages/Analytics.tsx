import { useQuery } from "@tanstack/react-query";
import {
  getOverviewAnalytics,
  getLocationAnalytics,
  getPriceRangeAnalytics,
  getAreaRangeAnalytics,
  getAmenitiesStats,
  getRulesStats,
  getTrendsAnalytics
} from "@/api/analytics";

export default function Analytics() {
  const overview = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverviewAnalytics
  });

  const locations = useQuery({
    queryKey: ["analytics", "locations"],
    queryFn: getLocationAnalytics
  });

  const priceRanges = useQuery({
    queryKey: ["analytics", "price-ranges"],
    queryFn: getPriceRangeAnalytics
  });

  const areaRanges = useQuery({
    queryKey: ["analytics", "area-ranges"],
    queryFn: getAreaRangeAnalytics
  });

  const amenities = useQuery({
    queryKey: ["analytics", "amenities"],
    queryFn: getAmenitiesStats
  });

  const rules = useQuery({
    queryKey: ["analytics", "rules"],
    queryFn: getRulesStats
  });

  const trends = useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: getTrendsAnalytics
  });

  const isLoading = overview.isLoading || locations.isLoading || priceRanges.isLoading;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Phân tích & Thống kê Thị trường</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Tổng số tin</div>
            <div className="text-3xl font-bold text-blue-600">{overview.data?.total_listings || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Tất cả tin đăng</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Đang cho thuê</div>
            <div className="text-3xl font-bold text-green-600">{overview.data?.active_listings || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Tin đang hoạt động</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Giá trung bình</div>
            <div className="text-3xl font-bold text-red-600">
              {overview.data?.price_stats.average.toLocaleString('vi-VN') || 0}đ
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((overview.data?.price_stats.average || 0) / 1000000)}tr/tháng
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Diện tích TB</div>
            <div className="text-3xl font-bold text-purple-600">
              {overview.data?.area_stats.average || 0}m²
            </div>
            <div className="text-xs text-gray-500 mt-1">Diện tích trung bình</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Phân bố theo giá</h2>
            <div className="space-y-3">
              {priceRanges.data?.price_ranges.map((range, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{range.label}</div>
                    <div className="text-xs text-gray-500">
                      Diện tích TB: {range.avg_area}m²
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{range.count}</div>
                    <div className="text-xs text-gray-500">tin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Phân bố theo diện tích</h2>
            <div className="space-y-3">
              {areaRanges.data?.area_ranges.map((range, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{range.label}</div>
                    <div className="text-xs text-gray-500">
                      Giá TB: {range.avg_price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{range.count}</div>
                    <div className="text-xs text-gray-500">tin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top tiện nghi phổ biến</h2>
            <div className="space-y-3">
              {amenities.data?.amenities.slice(0, 10).map((amenity, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{amenity.label}</div>
                      <div className="text-xs text-gray-500">
                        TB: {amenity.avg_price.toLocaleString('vi-VN')}đ | {amenity.avg_area}m²
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{amenity.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Khu vực có nhiều tin nhất</h2>
            <div className="space-y-3">
              {locations.data?.top_locations.slice(0, 10).map((location, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {location.coordinates[1].toFixed(3)}, {location.coordinates[0].toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-500">
                        TB: {location.avg_price.toLocaleString('vi-VN')}đ | {location.avg_area}m²
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">{location.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quy định phổ biến</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rules.data && Object.entries(rules.data.rules_stats).map(([key, stats]) => {
              const labels: Record<string, string> = {
                pet: "Nuôi thú cưng",
                smoke: "Hút thuốc",
                cook: "Nấu ăn",
                visitor: "Khách"
              };
              
              const allowedPercent = stats.total > 0 ? Math.round((stats.allowed / stats.total) * 100) : 0;
              
              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">{labels[key]}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Cho phép</span>
                      <span className="font-bold text-green-600">{stats.allowed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-600">Không</span>
                      <span className="font-bold text-red-600">{stats.not_allowed}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-gray-500">Tỷ lệ cho phép</div>
                      <div className="text-lg font-bold text-blue-600">{allowedPercent}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Xu hướng thị trường</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90 mb-2">Tổng tin đang hoạt động</div>
              <div className="text-3xl font-bold">{trends.data?.total_active_listings || 0}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90 mb-2">Khoảng giá phổ biến nhất</div>
              <div className="text-xl font-bold">
                {trends.data?.most_common_price_range 
                  ? `${trends.data.most_common_price_range.count} tin`
                  : "Đang tải..."}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90 mb-2">Diện tích phổ biến nhất</div>
              <div className="text-xl font-bold">
                {trends.data?.most_common_area_range
                  ? `${trends.data.most_common_area_range.count} tin`
                  : "Đang tải..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
