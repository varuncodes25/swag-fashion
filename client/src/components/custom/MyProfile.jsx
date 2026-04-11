import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ChevronDown, User, Mail, Phone, Lock } from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { changePassword, updateProfile, getProfile } from "@/redux/slices/authSlice"; // ✅ getProfile import karo
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function MyProfile() {
  const { isAuthenticated, user, profile, profileLoading } = useSelector((state) => state.auth); // ✅ profile bhi lo
  const dispatch = useDispatch();
  const { toast } = useToast();

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // State for form changes
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordChanges, setPasswordChanges] = useState(false);

  // ✅ Fetch profile using Redux thunk (not direct API call)
  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch, profile,updateProfile]);

  // ✅ Update form data when profile or user changes
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || ""
      }));
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [profile, user]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check if personal info has changed
    if (["name", "phone"].includes(field)) {
      const originalName = profile?.name || user?.name || "";
      const originalPhone = profile?.phone || user?.phone || "";
      
      if (field === "name") {
        setHasChanges(value !== originalName);
      } else if (field === "phone") {
        setHasChanges(value !== originalPhone);
      }
    }
    
    // Check if password fields have changes
    if (["currentPassword", "newPassword", "confirmPassword"].includes(field)) {
      const hasPasswordChanges = 
        formData.currentPassword.trim() !== "" || 
        formData.newPassword.trim() !== "" || 
        formData.confirmPassword.trim() !== "" ||
        value.trim() !== "";
      setPasswordChanges(hasPasswordChanges);
    }
  };

  // Handle save changes for personal info
  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    
    setIsUpdatingProfile(true);
    
    try {
      // ✅ Use Redux updateProfile (not direct API call)
      const result = await dispatch(updateProfile({
        name: formData.name,
        phone: formData.phone
      })).unwrap();
         await dispatch(getProfile()).unwrap();

      console.log("✅ Profile update response:", result);
      
      toast({
        title: "✅ Profile Updated",
        description: "Your personal information has been updated successfully.",
        variant: "default",
      });
      
      setHasChanges(false);
      
    } catch (err) {
      console.error("❌ Profile update error:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!passwordChanges) return;

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return toast({
        title: "All fields required",
        description: "Please fill all password fields",
        variant: "destructive",
      });
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast({
        title: "Password mismatch",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
    }

    setIsUpdatingPassword(true);

    try {
      await dispatch(changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })).unwrap();

      toast({
        title: "✅ Password Updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });

      // Clear fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setPasswordChanges(false);

    } catch (err) {
      console.error("❌ Password change error:", err);
      toast({
        title: "Password Change Failed",
        description: typeof err === 'string' ? err : err.message || "Invalid current password or something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="w-full bg-muted/30 dark:bg-muted/20 transition-colors min-h-screen flex items-center justify-center">
        <Card className="mx-auto w-full max-w-xl p-12 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </Card>
      </div>
    );
  }

  // If not authenticated or no user data
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full bg-muted/30 dark:bg-muted/20 transition-colors min-h-[60vh]">
        <Card className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl rounded-2xl shadow-sm bg-card text-card-foreground px-6 py-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold">Please Sign In</h2>
            <p className="text-muted-foreground">
              You need to be signed in to view your profile.
            </p>
            <Button className="rounded-full px-8 mt-4" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Get display data (prefer profile over user)
  const displayName = profile?.name || user?.name || "";
  const displayEmail = user?.email || "";
  const displayPhone = profile?.phone || user?.phone || "";
  const displayRole = user?.role || "";

  return (
    <div className="w-full bg-muted/30 dark:bg-muted/20 transition-colors min-h-screen">
      <Card
        className="
          mx-auto w-full
          max-w-xl sm:max-w-2xl md:max-w-3xl
          rounded-2xl shadow-sm
          bg-card text-card-foreground
          px-4 sm:px-6 md:px-10
          py-6 sm:py-8 md:py-12
          transition-colors
        "
      >
        {/* HEADER WITH USER INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage your personal information and keep your account secure.
            </p>
          </div>
          
          {/* USER ROLE BADGE */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <User className="w-4 h-4 mr-2" />
            {displayRole.charAt(0).toUpperCase() + displayRole.slice(1) || "User"}
          </div>
        </div>

        <Separator className="my-6 sm:my-8 md:my-10" />

        {/* PERSONAL INFO */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-medium">
                Personal details
              </h2>
              <p className="text-sm text-muted-foreground">
                This information will be used for orders and communication.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Full name</Label>
              </div>
              <Input
                className="h-10 sm:h-11 bg-background"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Email address</Label>
              </div>
              <Input
                className="h-10 sm:h-11 bg-muted/50 dark:bg-muted/30"
                value={formData.email}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Mobile number</Label>
              </div>
              <div className="flex gap-3 max-w-sm">
                <Button
                  variant="outline"
                  className="
                    h-10 sm:h-11 px-3 rounded-lg shrink-0
                    bg-background dark:bg-muted/30
                    gap-2
                  "
                >
                  🇮🇳 <ChevronDown size={14} />
                </Button>
                <Input
                  className="h-10 sm:h-11 bg-background"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Button
              className="
                w-full sm:w-auto
                px-8
                h-10 sm:h-11
                rounded-full
              "
              onClick={handleSaveChanges}
              disabled={!hasChanges || isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                hasChanges ? "Save changes" : "No changes"
              )}
            </Button>
            {hasChanges && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    name: displayName,
                    phone: displayPhone
                  }));
                  setHasChanges(false);
                }}
              >
                Discard changes
              </Button>
            )}
          </div>
        </section>

        <Separator className="my-10 sm:my-12 md:my-14" />

        {/* SECURITY */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-medium">Security</h2>
              <p className="text-sm text-muted-foreground">
                Change your password to protect your account.
              </p>
            </div>
          </div>

          <div className="max-w-sm space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Current password</Label>
              <Input 
                className="h-10 sm:h-11 bg-background" 
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">New password</Label>
              <Input 
                className="h-10 sm:h-11 bg-background" 
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Confirm new password</Label>
              <Input 
                className="h-10 sm:h-11 bg-background" 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="
                  w-full sm:w-auto
                  h-10 sm:h-11
                  rounded-full
                  px-6
                "
                onClick={handlePasswordUpdate}
                disabled={!passwordChanges || isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  passwordChanges ? "Update password" : "No changes"
                )}
              </Button>
              
              {passwordChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    }));
                    setPasswordChanges(false);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ACCOUNT INFO SECTION */}
        <Separator className="my-10 sm:my-12 md:my-14" />
        
        <section className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-base sm:text-lg font-medium">Account Information</h2>
            <p className="text-sm text-muted-foreground">
              Your account details and identification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Account Created
              </Label>
              <div className="text-sm">
                Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}