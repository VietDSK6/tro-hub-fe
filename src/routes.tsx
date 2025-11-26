import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ListingDetail from "@/pages/ListingDetail";
import NewListing from "@/pages/NewListing";
import Favorites from "@/pages/Favorites";
import Profile from "@/pages/Profile";
import Matching from "@/pages/Matching";
import RoomateGuide from "@/pages/RoomateGuide";
import AdminApproval from "@/pages/AdminApproval";
import Analytics from "@/pages/Analytics";
import Shell from "@/shell";
import { RequireAuth } from "@/app/guard";

export const router = createBrowserRouter([
  {
    element: <Shell/>,
    children: [
      { path: "/", element: <Home/> },
      { path: "/listings", element: <Listings/> },
      { path: "/analytics", element: <Analytics/> },
      { path: "/guide", element: <RoomateGuide/> },
      { element: <RequireAuth/>, children: [
        { path: "/listings/new", element: <NewListing/> },
        { path: "/favorites", element: <Favorites/> },
        { path: "/profile", element: <Profile/> },
        { path: "/matching", element: <Matching/> },
        { path: "/admin/approval", element: <AdminApproval/> },
      ]},
      { path: "/listings/:id", element: <ListingDetail/> }
    ]
  }
]);
