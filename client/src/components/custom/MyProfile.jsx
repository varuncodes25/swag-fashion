import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { resolveDisplayAvatarUrl } from "@/utils/avatar";

function InfoRow({ label, value, icon: Icon, extra }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
        <span>{label}</span>
      </div>
      <div className="sm:text-right">
        <p className="font-medium text-foreground break-words">{value}</p>
        {extra}
      </div>
    </div>
  );
}

export default function MyProfile() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, loading, updating, changingPassword } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      }));
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges && !selectedAvatar) return;

    setUploading(true);

    try {
      const formDataToSend = new FormData();

      if (hasChanges) {
        if (formData.name !== profile?.name) {
          formDataToSend.append("name", formData.name);
        }
        if (formData.phone !== profile?.phone) {
          formDataToSend.append("phone", formData.phone);
        }
      }

      if (selectedAvatar) {
        formDataToSend.append("avatar", selectedAvatar);
      }

      await dispatch(updateProfile(formDataToSend)).unwrap();
      await dispatch(getProfile()).unwrap();

      toast({
        title: "Profile updated",
        description: "Your information has been saved.",
      });
      setHasChanges(false);
      setIsEditing(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData((prev) => ({
      ...prev,
      name: profile?.name || "",
      phone: profile?.phone || "",
    }));
    setHasChanges(false);
    setIsEditing(false);
    setSelectedAvatar(null);
    setAvatarPreview(null);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordChanges) return;

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
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

    try {
      await dispatch(
        changePassword({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      ).unwrap();

      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPasswordChanges(false);
    } catch (err) {
      toast({
        title: "Password change failed",
        description: err.message || "Invalid current password",
        variant: "destructive",
      });
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold">Please sign in</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need to be signed in to view your profile.
        </p>
        <Button className="mt-6 rounded-full px-8" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      </Card>
    );
  }

  const displayName = profile?.name || "";
  const displayEmail = profile?.email || "";
  const displayPhone = profile?.phone || "";
  const avatarUrl = avatarPreview || resolveDisplayAvatarUrl(profile?.avatar);
  const roleLabel =
    (profile?.role || "user").charAt(0).toUpperCase() +
    (profile?.role || "user").slice(1);

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account security
        </p>
      </div>

      {/* Profile hero */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <Avatar className="h-20 w-20 border-2 border-primary/20 sm:h-24 sm:w-24">
              <AvatarImage
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="bg-primary text-xl text-white sm:text-2xl">
                {displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
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

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="truncate text-lg font-semibold sm:text-xl">
              {displayName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {displayEmail}
            </p>
            {displayPhone && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {displayPhone}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="gap-1 font-normal">
                <Shield className="h-3 w-3" />
                {roleLabel}
              </Badge>
              {profile?.isEmailVerified && (
                <Badge className="gap-1 border-green-200 bg-green-50 font-normal text-green-700 hover:bg-green-50">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full gap-2 sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="w-full gap-1 sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={(!hasChanges && !selectedAvatar) || uploading}
                  className="w-full gap-1 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  {uploading ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Personal information */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Personal Information</h2>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Update your name and phone number"
                  : "Your account details"}
              </p>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <div className="divide-y divide-border/60">
            <InfoRow label="Full Name" value={displayName || "—"} icon={User} />
            <InfoRow
              label="Email Address"
              value={displayEmail || "—"}
              icon={Mail}
              extra={
                profile?.isEmailVerified ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                ) : null
              }
            />
            <InfoRow
              label="Mobile Number"
              value={displayPhone || "Not added"}
              icon={Phone}
            />
            <InfoRow
              label="Account Type"
              value={roleLabel}
              icon={Shield}
            />
          </div>
        ) : (
          <div className="space-y-5 p-4 sm:p-6">
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF · max 5MB
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Mobile Number</Label>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    className="shrink-0 gap-1 px-3"
                    type="button"
                  >
                    🇮🇳 <ChevronDown size={14} />
                  </Button>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    placeholder="Enter mobile number"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Password */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Keep your account secure with a strong password
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:max-w-lg sm:p-6">
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {passwordChanges && (
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                onClick={handlePasswordUpdate}
                disabled={changingPassword}
                className="w-full sm:w-auto"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
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
  );
}
