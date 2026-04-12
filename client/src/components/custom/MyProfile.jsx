import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { 
  User, Mail, Phone, Lock, 
  Eye, EyeOff, Edit2, Save, X,
  Camera
} from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { getProfile, updateProfile, changePassword } from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function MyProfile() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, loading, updating, changingPassword } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [passwordChanges, setPasswordChanges] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || ""
      }));
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setSelectedAvatar(file);
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges && !selectedAvatar) return;
    
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add text fields if changed
      if (hasChanges) {
        if (formData.name !== profile?.name) {
          formDataToSend.append('name', formData.name);
        }
        if (formData.phone !== profile?.phone) {
          formDataToSend.append('phone', formData.phone);
        }
      }
      
      // Add avatar if selected
      if (selectedAvatar) {
        formDataToSend.append('avatar', selectedAvatar);
      }
      
      await dispatch(updateProfile(formDataToSend)).unwrap();
      await dispatch(getProfile()).unwrap();

      toast({ title: "✅ Profile Updated", description: "Your information has been updated.", variant: "default" });
      setHasChanges(false);
      setIsEditing(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      toast({ title: "Update Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(prev => ({
      ...prev,
      name: profile?.name || "",
      phone: profile?.phone || ""
    }));
    setHasChanges(false);
    setIsEditing(false);
    setSelectedAvatar(null);
    setAvatarPreview(null);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordChanges) return;

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return toast({ title: "All fields required", description: "Please fill all password fields", variant: "destructive" });
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast({ title: "Password mismatch", description: "New password and confirm password must match", variant: "destructive" });
    }

    try {
      await dispatch(changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })).unwrap();

      toast({ title: "✅ Password Updated", description: "Your password has been changed.", variant: "default" });

      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setPasswordChanges(false);
    } catch (err) {
      toast({ title: "Password Change Failed", description: err.message || "Invalid current password", variant: "destructive" });
    }
  };

  if (loading && !profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[60vh]">
        <Card className="mx-auto w-full max-w-xl px-6 py-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold">Please Sign In</h2>
            <p>You need to be signed in to view your profile.</p>
            <Button className="rounded-full px-8 mt-4" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const displayName = profile?.name || "";
  const displayEmail = profile?.email || "";
  const displayPhone = profile?.phone || "";
  
  // Show preview if new avatar selected, otherwise show existing avatar
  const avatarUrl = avatarPreview || profile?.avatar;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and account security</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information Card with Avatar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? "Edit your personal details" : "View your personal information"}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="gap-1">
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSaveChanges} disabled={(!hasChanges && !selectedAvatar) || uploading} className="gap-1">
                  <Save className="w-4 h-4" /> {uploading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-6 border-b">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Edit Avatar Button - Only show in edit mode */}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition group-hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {isEditing && (
              <>
                <p className="text-xs text-muted-foreground mt-3">
                  Click the camera icon to change profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF (Max 5MB)
                </p>
              </>
            )}
          </div>

          {/* Form Fields */}
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                <p className="font-medium mt-1 text-lg">{displayName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email Address</Label>
                <p className="font-medium mt-1">{displayEmail}</p>
                {profile?.isEmailVerified && (
                  <span className="text-xs text-green-600">✓ Verified</span>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Mobile Number</Label>
                <p className="font-medium mt-1">{displayPhone || "Not added"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Account Type</Label>
                <p className="font-medium mt-1 capitalize">{profile?.role || "User"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    value={formData.email} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Mobile Number</Label>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 shrink-0" type="button">
                      🇮🇳 <ChevronDown size={14} />
                    </Button>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)} 
                      placeholder="Enter mobile number"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Add your mobile number for faster checkout</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Security Card - Change Password */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={formData.currentPassword} 
                  onChange={(e) => { 
                    handleInputChange("currentPassword", e.target.value); 
                    setPasswordChanges(true); 
                  }}
                  placeholder="Enter current password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"} 
                  value={formData.newPassword} 
                  onChange={(e) => { 
                    handleInputChange("newPassword", e.target.value); 
                    setPasswordChanges(true); 
                  }}
                  placeholder="Enter new password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={formData.confirmPassword} 
                  onChange={(e) => { 
                    handleInputChange("confirmPassword", e.target.value); 
                    setPasswordChanges(true); 
                  }}
                  placeholder="Confirm new password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwordChanges && (
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="default" 
                  onClick={handlePasswordUpdate} 
                  disabled={changingPassword}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
                <Button 
                  variant="ghost" 
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
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}