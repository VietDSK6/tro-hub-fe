interface LocationData {
  address: string;
  count: number;
  avg_price: number;
  avg_area: number;
}

interface LocationTableProps {
  locations: LocationData[];
}

export default function LocationTable({ locations }: LocationTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Khu vực có nhiều tin nhất
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">
                Khu vực
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                Số tin
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                Giá TB
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                DT TB
              </th>
            </tr>
          </thead>
          <tbody>
            {locations.slice(0, 8).map((location, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {location.address}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-2 font-semibold text-gray-900">
                  {location.count}
                </td>
                <td className="text-right py-3 px-2 text-gray-600">
                  {Math.round(location.avg_price / 1000000)}tr
                </td>
                <td className="text-right py-3 px-2 text-gray-600">
                  {Math.round(location.avg_area)}m²
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
