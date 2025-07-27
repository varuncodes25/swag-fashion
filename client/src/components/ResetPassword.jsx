import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react"; // 👁️ Optional: Icon library like lucide

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reset-password/${token}`, { password });
      toast({ title: "Password reset successfully" });
      navigate("/login");
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Reset failed",
        variant: "destructive",
      });
    }
  };

  return (
    <form className="w-[60vw] lg:w-[25vw] mx-auto my-32 grid gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Reset Password</h2>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      </div>

      <Button type="submit">Reset Password</Button>
    </form>
  );
};

export default ResetPassword;
