import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUserId } from "@/api/profiles";

export default function UserProfile() {
  const { userId = "" } = useParams();
  const currentUserId = localStorage.getItem("userId");

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getProfileByUserId(userId),
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="container-app p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container-app p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy người dùng</h2>
          <p className="text-gray-500 mb-4">Người dùng này không tồn tại hoặc đã bị xóa</p>
          <Link to="/listings" className="btn btn-primary">
            Quay lại tìm phòng
          </Link>
        </div>
      </div>
    );
  }

  const habitsLabels: Record<string, string> = {
    smoking: "Hút thuốc",
    drinking: "Uống rượu bia",
    pets: "Nuôi thú cưng",
    nightOwl: "Thức khuya",
    earlyBird: "Dậy sớm",
    clean: "Sạch sẽ",
    quiet: "Yên tĩnh",
    social: "Thích giao lưu"
  };

  const habitsValues: Record<string, string> = {
    never: "Không bao giờ",
    sometimes: "Thỉnh thoảng",
    often: "Thường xuyên",
    always: "Luôn luôn",
    yes: "Có",
    no: "Không"
  };

  return (
    <div className="container-app p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || "Người dùng"}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {profile.gender && (
                    <span className="text-sm text-gray-500">
                      {profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}
                    </span>
                  )}
                  {profile.age && (
                    <span className="text-sm text-gray-500">• {profile.age} tuổi</span>
                  )}
                </div>
              </div>

              {profile.is_own_profile && (
                <Link 
                  to="/profile" 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </Link>
              )}
            </div>

            {profile.has_connection && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-800">Đã kết nối - Bạn có thể xem thông tin liên hệ</span>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Giới thiệu</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.budget && profile.budget > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Ngân sách</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.budget.toLocaleString("vi-VN")} đ/tháng
                    </p>
                  </div>
                )}

                {profile.desiredAreas && profile.desiredAreas.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Khu vực mong muốn</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.desiredAreas.map((area, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile.habits && Object.keys(profile.habits).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Thói quen sinh hoạt</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(profile.habits).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">{habitsLabels[key] || key}:</span>
                        <span className="font-medium text-gray-900">
                          {habitsValues[value as string] || String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(profile.is_own_profile || profile.has_connection) && (profile.email || profile.phone) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin liên hệ</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                          {profile.email}
                        </a>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">
                          {profile.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!profile.is_own_profile && !profile.has_connection && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Thông tin liên hệ bị ẩn</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Bạn cần được người này chấp nhận kết nối để xem thông tin liên hệ của họ.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/connections" className="text-sm text-gray-500 hover:text-gray-700">
            ← Quay lại danh sách kết nối
          </Link>
        </div>
      </div>
    </div>
  );
}
