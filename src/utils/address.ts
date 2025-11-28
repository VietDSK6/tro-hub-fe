export function shortenAddress(fullAddress: string): string {
  if (!fullAddress) return "";
  
  const parts = fullAddress.split(", ");
  
  if (parts.length <= 2) return fullAddress;
  
  const vietnamKeywords = ["Việt Nam", "Vietnam", "VN"];
  const filteredParts = parts.filter(
    part => !vietnamKeywords.some(kw => part.toLowerCase().includes(kw.toLowerCase()))
  );
  
  const numericPattern = /^\d+$/;
  const relevantParts = filteredParts.filter(part => !numericPattern.test(part.trim()));
  
  if (relevantParts.length <= 2) return relevantParts.join(", ");
  
  return relevantParts.slice(-2).join(", ");
}

export async function getAddressFromCoords(lng: number, lat: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
    );
    const data = await response.json();
    if (data.display_name) {
      return shortenAddress(data.display_name);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
