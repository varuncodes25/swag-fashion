import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Heart, LogOut, MapPin, ShoppingBag, User, Mail, Phone, Calendar, Shield } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, getProfile } from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";

export function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Get user data from Redux
  const { user, isAuthenticated, profile } = useSelector((state) => state.auth);
  
  // ✅ Fetch complete profile when authenticated
  
  const menu = [
    { label: "My Profile", icon: User, to: "/account" },
    { label: "My Wishlist", icon: Heart, to: "/account/wishlist" },
    { label: "My Orders", icon: ShoppingBag, to: "/orders" },
  ];
  
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };
  
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      await persistor.purge();
      await persistor.flush();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (preview) return preview;
    if (profile?.avatar) return profile.avatar;
    return "";
  };

  // ✅ Get user role badge color
  const getRoleBadgeColor = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (role === "seller") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  // ✅ Get data from profile (preferred) or user
  const displayName = profile?.name || user?.name || "Guest User";
  const displayEmail = user?.email || "Not signed in";
  const displayPhone = profile?.phone || user?.phone || null;
  const displayRole = user?.role || "user";
  const memberSince = profile?.createdAt || user?.createdAt || null;

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      {/* User Info Section */}
      <div className="flex flex-col items-center gap-2 p-6 relative">
        {/* Hidden input */}
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Avatar with upload button */}
        <div
          className="relative group cursor-pointer"
          onClick={() => fileRef.current.click()}
        >
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={getAvatarUrl()} />
            <AvatarFallback className="bg-primary text-white text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Camera Overlay */}
          <div
            className="absolute inset-0 bg-black/40 rounded-full
              flex items-center justify-center opacity-0
              group-hover:opacity-100 transition cursor-pointer"
          >
            <Camera className="text-white w-5 h-5" />
          </div>
        </div>

        {/* User Name */}
        <div className="text-center">
          <p className="font-semibold text-lg">
            {displayName}
          </p>
          
          {/* Role Badge */}
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor()}`}>
            <Shield className="inline w-3 h-3 mr-1" />
            {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
          </span>
        </div>
        
        {/* User Details Card */}
        <div className="w-full mt-2 space-y-2 text-sm">
          {/* Email */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="text-xs truncate">{displayEmail}</span>
          </div>
          
          {/* Phone - if available */}
          {displayPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span className="text-xs">{displayPhone}</span>
            </div>
          )}
          
          {/* Member Since */}
          {memberSince && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                Joined {new Date(memberSince).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Menu Items */}
      <div className="p-2 space-y-1">
        {isAuthenticated ? (
          <>
            {menu.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  `
                    w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                    hover:bg-muted
                    ${isActive ? "bg-muted font-medium text-primary" : ""}
                  `
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                         text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition mt-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                       bg-primary text-white hover:bg-primary/90 transition"
          >
            <User size={18} />
            Sign In
          </NavLink>
        )}
      </div>
    </div>
  );
}