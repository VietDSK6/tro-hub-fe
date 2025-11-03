import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

type Props = { value?: [number, number] | null, onChange?: (lng:number, lat:number)=>void };

function ClickHandler({ onPick }:{ onPick:(lng:number, lat:number)=>void }){
  useMapEvents({
    click(e){ onPick(e.latlng.lng, e.latlng.lat); }
  });
  return null;
}

export default function MapPicker({ value, onChange }: Props){
  const center = value ? [value[1], value[0]] : [10.78, 106.68];
  useEffect(()=>{}, [value]);
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border">
      <MapContainer center={center as any} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {value && <Marker position={[value[1], value[0]] as any} />}
        <ClickHandler onPick={(lng,lat)=> onChange?.(lng,lat)} />
      </MapContainer>
    </div>
  );
}
