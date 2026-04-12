import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Heart, LogOut, MapPin, ShoppingBag, User, Shield, Package, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { getProfile } from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";

export function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
const { profile, loading } = useSelector((state) => state.auth);  
  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch, profile]);
  
  const menu = [
    { label: "My Profile", icon: User, to: "/account" },
    { label: "My Wishlist", icon: Heart, to: "/account/wishlist" },
    { label: "My Orders", icon: ShoppingBag, to: "/orders" },
  ];
  
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const totalOrders = profile?.stats?.totalOrders || 0;
  const totalSpent = profile?.stats?.totalSpent || 0;
  const wishlistCount = profile?.stats?.wishlistCount || 0;

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
    if (!profile?.name) return "U";
    return profile.name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (preview) return preview;
    if (profile?.avatar) return profile.avatar;
    return "";
  };

  const getRoleBadgeColor = () => {
    const role = profile?.role?.toLowerCase();
    if (role === "admin") return "bg-red-100 text-red-700";
    if (role === "seller") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  const displayName = profile?.name || "Guest User";
  const displayRole = profile?.role || "user";

  if (loading && !profile) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="animate-pulse space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto" />
          <div className="h-4 bg-muted rounded w-24 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-col items-center gap-2 p-6">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} className="hidden" />
        
        <div className="relative group cursor-pointer" onClick={() => fileRef.current.click()}>
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={getAvatarUrl()} />
            <AvatarFallback className="bg-primary text-white text-xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera className="text-white w-5 h-5" />
          </div>
        </div>

        <div className="text-center">
          <p className="font-semibold text-lg">{displayName}</p>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
          {profile?.phone && (
            <p className="text-xs text-muted-foreground mt-1">{profile.phone}</p>
          )}
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 bg-green-100 text-green-700">
            <Shield className="inline w-3 h-3 mr-1" />
            {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
          </span>
        </div>
      </div>

      <Separator />

      {isAuthenticated && (
        <div className="p-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-primary">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{wishlistCount}</p>
                <p className="text-xs text-muted-foreground">Wishlist</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">₹{totalSpent?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      <div className="p-2 space-y-1">
        {isAuthenticated ? (
          <>
            {menu.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted ${isActive ? "bg-muted font-medium text-primary" : ""}`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/account/addresses" className={({ isActive }) => `w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted ${isActive ? "bg-muted font-medium text-primary" : ""}`}>
              <MapPin size={18} />
              Saved Addresses
            </NavLink>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition mt-2">
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition">
            <User size={18} />
            Sign In
          </NavLink>
        )}
      </div>
    </div>
  );
}