import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listListings } from "@/api/listings";
import ListingCard from "@/components/layout/ListingCard";
import ListingsMap from "@/components/map/ListingsMap";
import { Search, Map, Filter, ChevronDown, X, Mail } from "lucide-react";

const priceRanges = [
  { label: "Tất cả", value: "" },
  { label: "Dưới 1 triệu", min: 0, max: 1000000 },
  { label: "1 - 2 triệu", min: 1000000, max: 2000000 },
  { label: "2 - 3 triệu", min: 2000000, max: 3000000 },
  { label: "3 - 4 triệu", min: 3000000, max: 4000000 },
  { label: "4 - 5 triệu", min: 4000000, max: 5000000 },
  { label: "5 - 7 triệu", min: 5000000, max: 7000000 },
  { label: "7 - 10 triệu", min: 7000000, max: 10000000 },
  { label: "10 - 15 triệu", min: 10000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: undefined },
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    verified: true,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    areaMin: undefined as number | undefined,
    areaMax: undefined as number | undefined,
    amenities: [] as string[],
    rules: {
      pet: undefined as boolean | undefined,
      smoke: undefined as boolean | undefined,
      cook: undefined as boolean | undefined,
      visitor: undefined as boolean | undefined,
    },
  });
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["listings", searchTerm, filters, sortBy],
    queryFn: () => listListings({ 
      q: searchTerm || undefined,
      page: 1, 
      limit: 20,
      min_price: filters.priceMin,
      max_price: filters.priceMax,
      min_area: filters.areaMin,
      max_area: filters.areaMax,
      amenities: filters.amenities.length > 0 ? filters.amenities.join(",") : undefined,
      pet: filters.rules.pet,
      smoke: filters.rules.smoke,
      cook: filters.rules.cook,
      visitor: filters.rules.visitor,
      exclude_own: true,
    }),
  });

  const handleSearch = () => {
    setSearchTerm(searchQuery);
  };

  const sortedListings = () => {
    if (!data?.items) return [];
    const items = [...data.items];
    
    switch (sortBy) {
      case "price-asc":
        return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "area-asc":
        return items.sort((a, b) => (a.area || 0) - (b.area || 0));
      case "area-desc":
        return items.sort((a, b) => (b.area || 0) - (a.area || 0));
      default:
        return items;
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleRule = (rule: keyof typeof filters.rules) => {
    setFilters(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [rule]: prev.rules[rule] === true ? undefined : true
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      verified: true,
      priceMin: undefined,
      priceMax: undefined,
      areaMin: undefined,
      areaMax: undefined,
      amenities: [],
      rules: {
        pet: undefined,
        smoke: undefined,
        cook: undefined,
        visitor: undefined,
      },
    });
  };

  const hasActiveFilters = () => {
    return filters.priceMin !== undefined || 
           filters.priceMax !== undefined || 
           filters.areaMin !== undefined || 
           filters.areaMax !== undefined ||
           filters.amenities.length > 0 ||
           filters.rules.pet !== undefined ||
           filters.rules.smoke !== undefined ||
           filters.rules.cook !== undefined ||
           filters.rules.visitor !== undefined;
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

  const openPriceDropdown = () => {
    setShowPriceDropdown(!showPriceDropdown);
    setShowAreaDropdown(false);
    setShowFilterModal(false);
  };

  const openAreaDropdown = () => {
    setShowAreaDropdown(!showAreaDropdown);
    setShowPriceDropdown(false);
    setShowFilterModal(false);
  };

  const openFilterModal = () => {
    setShowFilterModal(!showFilterModal);
    setShowPriceDropdown(false);
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
      <div className="bg-white sticky top-16 z-10">
        <div className="container-app px-8 py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm theo địa chỉ, quận, tiêu đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button 
                onClick={handleSearch}
                className="btn btn-primary px-8"
              >
                Tìm kiếm
              </button>
            </div>

            <button 
              onClick={() => setShowMap(true)}
              className="btn bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Map className="w-5 h-5" />
              Xem bản đồ
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="container-app px-8 py-3">
          <div className="flex gap-3 items-center text-sm">
            <button 
              onClick={openFilterModal}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${showFilterModal ? 'bg-red-50 border-red-500' : 'hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              Lọc
              {hasActiveFilters() && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {filters.amenities.length + Object.values(filters.rules).filter(v => v !== undefined).length}
                </span>
              )}
            </button>

            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed">
                Loại phòng
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={openPriceDropdown}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${showPriceDropdown ? 'bg-red-50 border-red-500' : 'hover:bg-gray-50'}`}
              >
                {getSelectedPriceLabel()}
                <ChevronDown className="w-4 h-4" />
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

            <div className="relative">
              <button 
                onClick={openAreaDropdown}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${showAreaDropdown ? 'bg-red-50 border-red-500' : 'hover:bg-gray-50'}`}
              >
                {getSelectedAreaLabel()}
                <ChevronDown className="w-4 h-4" />
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

            {hasActiveFilters() && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600"
              >
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilterModal && (
        <div className="bg-white border-t border-b shadow-lg">
          <div className="container-app px-8 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Tiện ích</h3>
                <div className="space-y-2">
                  {[
                    { value: "ac", label: "Điều hòa" },
                    { value: "wifi", label: "Wifi" },
                    { value: "parking", label: "Chỗ để xe" },
                    { value: "water_heater", label: "Nóng lạnh" },
                    { value: "washing_machine", label: "Máy giặt" },
                    { value: "fridge", label: "Tủ lạnh" },
                  ].map(amenity => (
                    <label key={amenity.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-500"
                        checked={filters.amenities.includes(amenity.value)}
                        onChange={() => toggleAmenity(amenity.value)}
                      />
                      <span>{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Quy định</h3>
                <div className="space-y-2">
                  {[
                    { value: "pet" as const, label: "Cho phép nuôi thú cưng" },
                    { value: "smoke" as const, label: "Cho phép hút thuốc" },
                    { value: "cook" as const, label: "Cho phép nấu ăn" },
                    { value: "visitor" as const, label: "Cho phép khách thăm" },
                  ].map(rule => (
                    <label key={rule.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-500"
                        checked={filters.rules[rule.value] === true}
                        onChange={() => toggleRule(rule.value)}
                      />
                      <span>{rule.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-app px-8 pb-8">
        <h1 className="text-2xl font-bold mb-2">Tìm phòng trọ phù hợp</h1>
        <p className="text-gray-600 mb-6">
          Hiện có {sortedListings().length} phòng trọ.
        </p>

        <div className="flex justify-end mb-4">
          <select 
            className="border rounded-lg px-4 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="area-asc">Diện tích nhỏ đến lớn</option>
            <option value="area-desc">Diện tích lớn đến nhỏ</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : sortedListings().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings().map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy phòng trọ nào</p>
          </div>
        )}
      </div>

      {showMap && data?.items && (
        <ListingsMap 
          listings={data.items} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}
