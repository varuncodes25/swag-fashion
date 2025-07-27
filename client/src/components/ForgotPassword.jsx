import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
      toast({ title: "Reset link sent to your email" });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to send reset link",
        variant: "destructive",
      });
    }
  };

  return (
    <form className="w-[60vw] lg:w-[25vw] mx-auto my-32 grid gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Forgot Password</h2>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit">Send Reset Link</Button>
    </form>
  );
};

export default ForgotPassword;
