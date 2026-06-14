// Updated Sidebar component with fixes
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Heart, LogOut, MapPin, ShoppingBag, User, Shield } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateProfile } from "@/redux/slices/authSlice";
import { getProfile } from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
    const { isAuthenticated, profile, loading } = useSelector((state) => state.auth);

 
  
  const menu = [
    { label: "My Profile", icon: User, to: "/account" },
    { label: "My Wishlist", icon: Heart, to: "/account/wishlist" },
    { label: "My Orders", icon: ShoppingBag, to: "/orders" },
  ];
  
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const totalOrders = profile?.stats?.totalOrders || 0;
  const totalSpent = profile?.stats?.totalSpent || 0;
  const wishlistCount = profile?.stats?.wishlistCount || 0;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Only image files allowed", variant: "destructive" });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }
    
    setUploading(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      
      // Upload to server
      const formData = new FormData();
      formData.append('avatar', file);
      await dispatch(updateProfile(formData)).unwrap();
      await dispatch(getProfile()).unwrap();
      
      toast({ title: "Success", description: "Profile picture updated", variant: "default" });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({ title: "Failed", description: "Could not update profile picture", variant: "destructive" });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      await persistor.purge();
      await persistor.flush();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout failed", description: "Please try again", variant: "destructive" });
    }
  };

  const getUserInitials = () => {
    if (!profile?.name) return "U";
    return profile.name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
  };

  // ✅ FIXED: Better avatar URL handling
  const getAvatarUrl = () => {
    if (preview) return preview;
    if (profile?.avatar) {
      // Handle different avatar formats
      let avatarUrl = profile.avatar;
      
      // If it's a Google avatar or any valid URL
      if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl;
      }
      
      // If it's a local path
      if (avatarUrl.startsWith('/')) {
        return avatarUrl;
      }
      
      // If it's a relative path
      return avatarUrl;
    }
    return "";
  };

  const getRoleBadgeColor = () => {
    const role = profile?.role?.toLowerCase();
    if (role === "admin") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (role === "seller") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  const displayName = profile?.name || "Guest User";
  const displayRole = profile?.role || "user";
  const avatarUrl = getAvatarUrl();

  const formatSpent = (amount) => {
    const n = Number(amount) || 0;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

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
    <div className="bg-card text-card-foreground md:rounded-none">
      <div className="flex flex-col items-center gap-2 px-4 py-5 sm:px-6">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <div className="relative group cursor-pointer" onClick={() => fileRef.current.click()}>
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            {/* ✅ FIXED: Use key to force re-render when avatar changes */}
            <AvatarImage 
              key={avatarUrl || "default"} 
              src={avatarUrl} 
              className="object-cover"
              onError={(e) => {
                console.error("Image failed to load:", avatarUrl);
                e.target.style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-primary text-white text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera className="text-white w-5 h-5" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold sm:text-lg">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-[220px]">
            {profile?.email}
          </p>
          {profile?.phone && (
            <p className="mt-1 text-xs text-muted-foreground">{profile.phone}</p>
          )}
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor()}`}
          >
            <Shield className="inline h-3 w-3" />
            {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
          </span>
        </div>
      </div>

      <Separator />

      {isAuthenticated && (
        <div className="px-4 py-3 sm:px-5">
          <div className="rounded-xl bg-muted/40 p-3">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="px-1">
                <p className="text-lg font-bold text-primary sm:text-xl">
                  {totalOrders}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Orders
                </p>
              </div>
              <div className="px-1 border-x border-border/60">
                <p className="text-lg font-bold text-primary sm:text-xl">
                  {wishlistCount}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Wishlist
                </p>
              </div>
              <div className="px-1">
                <p className="text-sm font-bold leading-tight text-primary sm:text-base">
                  {formatSpent(totalSpent)}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Spent
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-0.5 p-2 pb-4">
        {isAuthenticated ? (
          <>
            {menu.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/account"}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/80 hover:bg-muted"
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/account/addresses"
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground/80 hover:bg-muted"
                }`
              }
            >
              <MapPin size={18} className="shrink-0" />
              Saved Addresses
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={18} className="shrink-0" />
              Logout
            </button>
          </>
        ) : (
          <NavLink 
            to="/login" 
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition"
          >
            <User size={18} />
            Sign In
          </NavLink>
        )}
      </div>
    </div>
  );
}