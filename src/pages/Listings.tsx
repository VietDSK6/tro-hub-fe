import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listListings } from "@/api/listings";
import ListingCard from "@/components/layout/ListingCard";
import ListingsMap from "@/components/map/ListingsMap";

const priceRanges = [
  { label: "Thỏa thuận", value: "" },
  { label: "Dưới 500 triệu", min: 0, max: 500000000 },
  { label: "500 - 800 triệu", min: 500000000, max: 800000000 },
  { label: "800 triệu - 1 tỷ", min: 800000000, max: 1000000000 },
  { label: "1 - 2 tỷ", min: 1000000000, max: 2000000000 },
  { label: "2 - 3 tỷ", min: 2000000000, max: 3000000000 },
  { label: "3 - 5 tỷ", min: 3000000000, max: 5000000000 },
  { label: "5 - 7 tỷ", min: 5000000000, max: 7000000000 },
  { label: "7 - 10 tỷ", min: 7000000000, max: 10000000000 },
  { label: "10 - 20 tỷ", min: 10000000000, max: 20000000000 },
  { label: "20 - 30 tỷ", min: 20000000000, max: 30000000000 },
  { label: "30 - 40 tỷ", min: 30000000000, max: 40000000000 },
  { label: "40 - 60 tỷ", min: 40000000000, max: 60000000000 },
  { label: "Trên 60 tỷ", min: 60000000000, max: undefined },
];

const areaRanges = [
  { label: "Dưới 30 m²", min: 0, max: 30 },
  { label: "30 - 50 m²", min: 30, max: 50 },
  { label: "50 - 80 m²", min: 50, max: 80 },
  { label: "80 - 100 m²", min: 80, max: 100 },
  { label: "100 - 150 m²", min: 100, max: 150 },
  { label: "150 - 200 m²", min: 150, max: 200 },
  { label: "200 - 250 m²", min: 200, max: 250 },
  { label: "250 - 300 m²", min: 250, max: 300 },
  { label: "300 - 500 m²", min: 300, max: 500 },
  { label: "Trên 500 m²", min: 500, max: undefined },
];

export default function Listings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    verified: true,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    areaMin: undefined as number | undefined,
    areaMax: undefined as number | undefined,
  });
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => listListings({ 
      page: 1, 
      limit: 20,
      min_price: filters.priceMin,
      max_price: filters.priceMax,
    }),
  });

  const handleSearch = () => {
    // Trigger search with current query
    console.log("Search:", searchQuery);
  };

  const handlePriceSelect = (range: typeof priceRanges[0]) => {
    if (range.value === "") {
      setFilters({ ...filters, priceMin: undefined, priceMax: undefined });
    } else {
      setFilters({ ...filters, priceMin: range.min, priceMax: range.max });
    }
    setShowPriceDropdown(false);
  };

  const handleAreaSelect = (range: typeof areaRanges[0]) => {
    setFilters({ ...filters, areaMin: range.min, areaMax: range.max });
    setShowAreaDropdown(false);
  };

  const getSelectedPriceLabel = () => {
    if (!filters.priceMin && !filters.priceMax) return "Khoảng giá";
    const range = priceRanges.find(r => r.min === filters.priceMin && r.max === filters.priceMax);
    return range?.label || "Khoảng giá";
  };

  const getSelectedAreaLabel = () => {
    if (!filters.areaMin && !filters.areaMax) return "Diện tích";
    const range = areaRanges.find(r => r.min === filters.areaMin && r.max === filters.areaMax);
    return range?.label || "Diện tích";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container-app px-8 py-4">
          <div className="flex gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhà riêng Thủ Đức dưới 5 tỷ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <svg 
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button 
                onClick={handleSearch}
                className="btn btn-primary px-8"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Map View Button */}
            <button 
              onClick={() => setShowMap(true)}
              className="btn bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Xem bản đồ
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b">
        <div className="container-app px-8 py-3">
          <div className="flex gap-3 items-center text-sm">
            {/* Filter Toggle */}
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Lọc
            </button>

            {/* Verified Toggle */}
            <button 
              onClick={() => setFilters({ ...filters, verified: !filters.verified })}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${filters.verified ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'}`}
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center ${filters.verified ? 'bg-green-500' : 'bg-gray-300'}`}>
                {filters.verified && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              Tin xác thực
            </button>

            {/* Property Type Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                Loại nhà đất
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Price Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                {getSelectedPriceLabel()}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showPriceDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border rounded-lg shadow-lg z-20 w-64 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="font-semibold px-3 py-2 text-gray-700">Lọc theo khoảng giá</div>
                    {priceRanges.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePriceSelect(range)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Area Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                {getSelectedAreaLabel()}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAreaDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border rounded-lg shadow-lg z-20 w-64 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="font-semibold px-3 py-2 text-gray-700">Lọc theo diện tích</div>
                    {areaRanges.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAreaSelect(range)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Professional Toggle */}
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <span className="text-green-600">✓</span>
              Môi giới chuyên nghiệp
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container-app px-8 py-4">
        <div className="text-sm text-gray-600">
          <Link to="/" className="hover:text-red-500">Bán</Link>
          <span className="mx-2">/</span>
          <span>Tất cả BDS trên toàn quốc</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app px-8 pb-8">
        <h1 className="text-2xl font-bold mb-2">Mua bán nhà đất trên toàn quốc</h1>
        <p className="text-gray-600 mb-6">
          Hiện có {data?.total || 0} bất động sản.
        </p>

        {/* Email Alerts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold">Nhận email tin mới</div>
            <div className="text-sm text-gray-600">Đăng ký để nhận thông báo tin mới phù hợp</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
          </label>
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-end mb-4">
          <select className="border rounded-lg px-4 py-2 text-sm">
            <option>Mặc định</option>
            <option>Giá thấp đến cao</option>
            <option>Giá cao đến thấp</option>
            <option>Diện tích nhỏ đến lớn</option>
            <option>Diện tích lớn đến nhỏ</option>
            <option>Mới nhất</option>
          </select>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy tin đăng nào</p>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && data?.items && (
        <ListingsMap 
          listings={data.items} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}
