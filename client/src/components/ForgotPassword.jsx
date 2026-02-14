import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    // ✅ toast.promise - No need for .finally()
    await toast.promise(
      axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email }),
      {
        loading: 'Sending reset link...',
        success: (response) => {
          setEmail('');
          return response.data?.message || "Reset link sent to your email! 📧";
        },
        error: (err) => err.response?.data?.message || "Failed to send reset link",
      }
    );
    
    setLoading(false);  // ✅ Move this outside
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-12 px-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-300"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                ← Back to Login
              </a>
            </div>
          </form>

          {/* ✅ Optional: Add footer note */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
            We'll send a password reset link to your email
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;