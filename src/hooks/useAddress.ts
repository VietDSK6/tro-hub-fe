import { useState, useEffect } from "react";
import { shortenAddress } from "@/utils/address";

export function useAddress(coordinates: [number, number] | null | undefined) {
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!coordinates || coordinates.length !== 2) {
      setAddress("");
      setIsLoading(false);
      return;
    }

    const [lng, lat] = coordinates;
    
    const fetchAddress = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };

    fetchAddress();
  }, [coordinates?.[0], coordinates?.[1]]);

  return { address, isLoading };
}
