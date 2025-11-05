import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import NewListing from "@/pages/NewListing";
import Favorites from "@/pages/Favorites";
import Profile from "@/pages/Profile";
import Matching from "@/pages/Matching";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Shell from "@/shell";
import { RequireAuth } from "@/app/guard";

export const router = createBrowserRouter([
  {
    element: <Shell/>,
    children: [
      { path: "/", element: <Home/> },
      { path: "/login", element: <Login/> },
      { path: "/register", element: <Register/> },
      { element: <RequireAuth/>, children: [
        { path: "/listings/new", element: <NewListing/> },
        { path: "/favorites", element: <Favorites/> },
        { path: "/profile", element: <Profile/> },
        { path: "/matching", element: <Matching/> },
      ]},
      { path: "/listings/:id", element: <ListingDetail/> }
    ]
  }
]);
