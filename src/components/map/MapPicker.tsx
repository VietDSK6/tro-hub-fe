import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoidmlldGRzMjYwMSIsImEiOiJjbWk4eHVjNmswaHczMm1vcGwyZXo4dmJqIn0.FBHbH2CHHcuTja4_LK74Yw"; // Replace with your token

type Props = { 
  value?: [number, number] | null;
  onChange?: (lng: number, lat: number) => void;
  children?: React.ReactNode;
};

export default function MapPicker({ value, onChange, children }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [lng, setLng] = useState(value?.[0] || 105.83);
  const [lat, setLat] = useState(value?.[1] || 21.03);
  const [zoom, setZoom] = useState(13);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      if (!map.current) return;
      setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current.getZoom().toFixed(2)));
    });

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setLng(lng);
      setLat(lat);
      onChange?.(lng, lat);
      
      // Update or create marker
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !value) return;

    const [newLng, newLat] = value;
    
    if (marker.current) {
      marker.current.setLngLat([newLng, newLat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([newLng, newLat])
        .addTo(map.current);
    }

    map.current.flyTo({
      center: [newLng, newLat],
      zoom: 13,
    });

    setLng(newLng);
    setLat(newLat);
  }, [value]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[600px]">
      {/* Left side - Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Right side - Map */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 rounded-t-lg">
          Vị trí: {lat.toFixed(4)}, {lng.toFixed(4)} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="flex-1 rounded-b-lg" />
      </div>
    </div>
  );
}
