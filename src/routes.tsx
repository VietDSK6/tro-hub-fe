import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import NewListing from "@/pages/NewListing";
import Favorites from "@/pages/Favorites";
import Profile from "@/pages/Profile";
import Matching from "@/pages/Matching";
import Messages from "@/pages/Messages";
import Auth from "@/pages/Auth";
import Shell from "@/shell";
import { RequireAuth } from "@/app/guard";

export const router = createBrowserRouter([
  {
    element: <Shell/>,
    children: [
      { path: "/", element: <Home/> },
      { path: "/auth", element: <Auth/> },
      { element: <RequireAuth/>, children: [
        { path: "/listings/new", element: <NewListing/> },
        { path: "/favorites", element: <Favorites/> },
        { path: "/profile", element: <Profile/> },
        { path: "/matching", element: <Matching/> },
        { path: "/messages/:peerId", element: <Messages/> },
      ]},
      { path: "/listings/:id", element: <ListingDetail/> }
    ]
  }
]);
