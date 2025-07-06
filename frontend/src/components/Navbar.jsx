import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import OnlineUsers from "./OnlineUsers";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : window.location.origin;
const socket = io(SOCKET_URL, { withCredentials: true });

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();
  const [onlineUsers, setOnlineUsers] = useState({ count: 0, users: [] });

  useEffect(() => {
    // Listen for online users updates
    socket.on("onlineUsers", setOnlineUsers);
    
    // Send user info when component mounts (if user is logged in)
    if (authUser) {
      socket.emit("userConnected", {
        userId: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic
      });
    }
    
    return () => {
      socket.off("onlineUsers", setOnlineUsers);
    };
  }, [authUser]);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <OnlineUsers />
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          {/* TODO */}
          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <span>Online: {onlineUsers.count}</span>
          {onlineUsers.users.length > 0 && (
            <div className="flex -space-x-2">
              {onlineUsers.users.slice(0, 5).map((user) => (
                <div key={user.userId} className="tooltip" data-tip={user.fullName}>
                  <img 
                    src={user.profilePic} 
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full border-2 border-base-200"
                  />
                </div>
              ))}
              {onlineUsers.users.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center border-2 border-base-200">
                  +{onlineUsers.users.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
