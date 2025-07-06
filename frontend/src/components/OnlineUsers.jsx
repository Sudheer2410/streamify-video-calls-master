import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { UsersIcon } from "lucide-react";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : window.location.origin;
const socket = io(SOCKET_URL, { withCredentials: true });

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState({ count: 0, users: [] });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    socket.on("onlineUsers", setOnlineUsers);
    return () => {
      socket.off("onlineUsers", setOnlineUsers);
    };
  }, []);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn btn-ghost btn-sm gap-2"
      >
        <UsersIcon className="h-4 w-4" />
        <span>{onlineUsers.count} Online</span>
      </button>

      {/* Expanded List */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-base-300">
            <h3 className="font-semibold text-sm">Online Users ({onlineUsers.count})</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {onlineUsers.users.length === 0 ? (
              <div className="p-3 text-center text-sm text-base-content/70">
                No users online
              </div>
            ) : (
              onlineUsers.users.map((user) => (
                <div key={user.userId} className="flex items-center gap-3 p-3 hover:bg-base-200">
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.fullName}</p>
                    <p className="text-xs text-base-content/70">
                      Online since {new Date(user.connectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineUsers; 