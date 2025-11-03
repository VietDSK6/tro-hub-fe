import { Link } from "react-router-dom";
export default function ListingCard({ listing }: { listing: any }){
  return (
    <Link to={`/listings/${listing._id}`} className="card p-3 block hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="font-semibold">{listing.title}</div>
        <span className="badge">{(listing.price ?? 0).toLocaleString()} đ</span>
      </div>
      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.desc || "—"}</div>
    </Link>
  );
}
