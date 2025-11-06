import { Link } from "react-router-dom";
export default function ListingCard({ listing }: { listing: any }){
  const firstImage = listing.images?.[0];
  
  return (
    <Link to={`/listings/${listing._id}`} className="card p-0 block hover:shadow-md transition overflow-hidden">
      {firstImage && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={firstImage} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="font-semibold">{listing.title}</div>
          <span className="badge">{(listing.price ?? 0).toLocaleString()} đ</span>
        </div>
        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.desc || "—"}</div>
      </div>
    </Link>
  );
}
