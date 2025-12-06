import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

mapboxgl.accessToken = "pk.eyJ1IjoidHJvLWh1YiIsImEiOiJjbTN4eWJ4eXowMDBjMmtzNWs3NjhpOHE3In0.qK1YqJxY6d9Q8YqQ7Z9Q8Q";

type Listing = {
  _id: string;
  title: string;
  price?: number;
  area?: number;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  images?: string[];
};

type Props = {
  listings: Listing[];
  onClose?: () => void;
};

export default function ListingsMap({ listings, onClose }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const defaultCenter: [number, number] = [105.804817, 21.028511];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultCenter,
      zoom: 12,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (!listings || listings.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    listings.forEach((listing) => {
      if (!listing.location?.coordinates) return;

      const [lng, lat] = listing.location.coordinates;

      const popupContent = document.createElement("div");
      popupContent.className = "p-2 min-w-[200px] z-50";
      popupContent.innerHTML = `
        <div class="cursor-pointer" data-listing-id="${listing._id}">
          ${listing.images && listing.images[0] 
            ? `<img src="${listing.images[0]}" alt="${listing.title}" class="w-full h-32 object-cover rounded mb-2" />`
            : '<div class="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">No image</div>'
          }
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${listing.title}</h3>
          <p class="text-red-600 font-bold text-sm">${(listing.price || 0).toLocaleString()} VNĐ</p>
          <p class="text-gray-600 text-xs">${listing.area || 0} m²</p>
          ${listing.address ? `<p class="text-gray-500 text-xs mt-1">${listing.address}</p>` : ''}
        </div>
      `;

      popupContent.addEventListener("click", (e) => {
        const listingId = (e.currentTarget as HTMLElement).querySelector("[data-listing-id]")?.getAttribute("data-listing-id");
        if (listingId) {
          navigate(`/listings/${listingId}`);
        }
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "300px",
        className: "listing-popup"
      }).setDOMContent(popupContent);

      popup.on("close", () => {
        if (currentPopup.current === popup) {
          currentPopup.current = null;
        }
      });

      const el = document.createElement("div");
      el.className = "bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-xs cursor-pointer hover:bg-red-600 transition-colors shadow-lg border-2 border-white";
      el.textContent = `${((listing.price || 0) / 1000000).toFixed(1)}tr`;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentPopup.current && currentPopup.current !== popup) {
          currentPopup.current.remove();
        }
        marker.togglePopup();
        if (marker.getPopup().isOpen()) {
          currentPopup.current = popup;
        } else {
          currentPopup.current = null;
        }
      });

      markers.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (listings.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [listings, mapLoaded, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Bản đồ phòng trọ</h2>
            <p className="text-sm text-gray-600">{listings.length} phòng trọ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map */}
        <div ref={mapContainer} className="flex-1" />

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Phòng trọ khả dụng</span>
            </div>
            <div className="text-gray-600">
              Click vào marker để xem chi tiết
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
