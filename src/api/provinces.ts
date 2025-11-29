export interface Province {
  code: number;
  name: string;
}

export async function getProvinces(): Promise<Province[]> {
  const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
  if (!response.ok) {
    throw new Error("Failed to fetch provinces");
  }
  const data: Province[] = await response.json();
  
  return data.sort((a, b) => {
    const aIsCity = a.name.startsWith("Thành phố");
    const bIsCity = b.name.startsWith("Thành phố");
    if (aIsCity && !bIsCity) return -1;
    if (!aIsCity && bIsCity) return 1;
    return a.name.localeCompare(b.name, "vi");
  });
}
