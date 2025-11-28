import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Search, X, Loader2, CheckCircle2 } from "lucide-react";
import { shortenAddress } from "@/utils/address";

const MAPBOX_TOKEN = "pk.eyJ1IjoidmlldGRzMjYwMSIsImEiOiJjbWk4eHVjNmswaHczMm1vcGwyZXo4dmJqIn0.FBHbH2CHHcuTja4_LK74Yw";
mapboxgl.accessToken = MAPBOX_TOKEN;

type Props = { 
  value?: [number, number] | null;
  onChange?: (lng: number, lat: number) => void;
  children?: React.ReactNode;
  height?: string;
  showSearch?: boolean;
  label?: string;
};

export default function MapPicker({ 
  value, 
  onChange, 
  children, 
  height = "500px",
  showSearch = true,
  label = "Chọn vị trí"
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(value || null);
  const [address, setAddress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const getAddressFromCoords = useCallback(async (lng: number, lat: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(shortenAddress(data.display_name));
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    setIsLoadingAddress(false);
  }, []);

  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&accept-language=vi`
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddress(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = value || [105.83, 21.03];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.current.on("load", () => {
      setMapReady(true);
      if (value) {
        getAddressFromCoords(value[0], value[1]);
      }
    });

    map.current.on("moveend", () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      const newLocation: [number, number] = [center.lng, center.lat];
      setSelectedLocation(newLocation);
      onChange?.(center.lng, center.lat);
      getAddressFromCoords(center.lng, center.lat);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady || !value) return;
    
    const [lng, lat] = value;
    const center = map.current.getCenter();
    
    if (Math.abs(center.lng - lng) > 0.0001 || Math.abs(center.lat - lat) > 0.0001) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [value, mapReady]);

  const selectSearchResult = (result: any) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    setSearchQuery("");
    setSearchResults([]);
    setAddress(shortenAddress(result.display_name));
    setSelectedLocation([lng, lat]);
    onChange?.(lng, lat);
    
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1000,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setSelectedLocation([longitude, latitude]);
        onChange?.(longitude, latitude);
        getAddressFromCoords(longitude, latitude);
        
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1000,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Không thể lấy vị trí hiện tại");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </div>
        </div>

        {showSearch && (
          <div className="p-3 bg-white border-b relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm địa chỉ, khu vực..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 animate-spin" />
                )}
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                title="Vị trí hiện tại"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Vị trí của tôi</span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result: any, index: number) => (
                  <button
                    key={result.place_id || index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.name || shortenAddress(result.display_name)}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{result.display_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative" style={{ height }}>
          <div ref={mapContainer} className="w-full h-full" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <div className="relative animate-bounce">
              <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="#ef4444" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>

          {!mapReady && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                <span className="text-sm text-gray-600">Đang tải bản đồ...</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
            Kéo bản đồ để chọn vị trí
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              {isLoadingAddress ? (
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">Vị trí đã chọn</div>
              {isLoadingAddress ? (
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
              ) : (
                <div className="text-sm font-medium text-gray-900">
                  {address || "Chưa chọn vị trí"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
