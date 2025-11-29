import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listListings } from "@/api/listings";
import { getOverviewAnalytics } from "@/api/analytics";
import ListingCard from "@/components/layout/ListingCard";
import {
  MessagesSquare,
  CircleCheck,
  CircleDollarSign,
  ChartArea,
  ArrowRight,
  BarChart3,
  Home as HomeIcon,
} from "lucide-react";

export default function Home() {
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ["listings", "home"],
    queryFn: () => listListings({ limit: 10 }),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverviewAnalytics,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Chào mừng đến Trọ Hub</h1>
          <p className="text-gray-600">
            Nền tảng tìm phòng trọ và bạn cùng phòng
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Thống kê thị trường
            </h2>
            <Link
              to="/analytics"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem chi tiết
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Tổng số tin</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessagesSquare className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData?.total_listings || 0}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Đang cho thuê</span>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CircleCheck className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData?.active_listings || 0}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Giá trung bình</span>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CircleDollarSign className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    (analyticsData?.price_stats?.average || 0) / 1000000
                  )}
                  tr
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Diện tích TB</span>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartArea className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(analyticsData?.area_stats?.average || 0)}m²
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <HomeIcon className="w-5 h-5 text-red-500" />
              Phòng trọ mới nhất
            </h2>
            <Link
              to="/listings"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả ({listingsData?.total ?? 0})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {listingsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : listingsData?.items?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chưa có phòng trọ nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listingsData?.items?.slice(0, 8).map((l: any) => (
                  <ListingCard key={l._id} listing={l} />
                ))}
              </div>

              {(listingsData?.total ?? 0) > 8 && (
                <div className="text-center mt-6">
                  <Link
                    to="/listings"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    Xem thêm phòng trọ
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
