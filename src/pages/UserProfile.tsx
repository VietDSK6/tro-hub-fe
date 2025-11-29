import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUserId } from "@/api/profiles";
import { User, CheckCircle2, Edit, DollarSign, MapPin, Mail, Phone, Lock } from "lucide-react";

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
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
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
    smoke: "Hút thuốc",
    pet: "Nuôi thú cưng",
    cook: "Nấu ăn",
    sleepTime: "Thời gian ngủ"
  };

  const formatHabitValue = (key: string, value: any): string => {
    if (key === "sleepTime") {
      const sleepLabels: Record<string, string> = {
        early: "Ngủ sớm (trước 22h)",
        late: "Ngủ muộn (sau 23h)",
        flexible: "Linh hoạt"
      };
      return sleepLabels[value] || String(value);
    }
    if (typeof value === "boolean") {
      return value ? "Có" : "Không";
    }
    return String(value);
  };

  return (
    <div className="container-app p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.full_name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
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
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </Link>
              )}
            </div>

            {profile.has_connection && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
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
                      <DollarSign className="w-5 h-5" />
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
                      <MapPin className="w-5 h-5" />
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
                          {formatHabitValue(key, value)}
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
                        <Mail className="w-5 h-5 text-blue-600" />
                        <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                          {profile.email}
                        </a>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-600" />
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
                    <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
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
