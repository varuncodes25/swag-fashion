import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { setUserLogin } from "@/redux/slices/authSlice";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = e.target.elements;

    if (email.value.trim() === "" || password.value.trim() === "") {
      toast({
        title: "Please fill all the fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/login", {
        email: email.value,
        password: password.value,
      });

      const data = res.data;
      dispatch(setUserLogin(data));

      toast({ title: data.message });
      navigate("/");
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Login failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-[60vw] lg:w-[25vw] mx-auto my-32 grid gap-3">
      <h1 className="text-2xl font-bold">Login into your account</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input placeholder="Enter Your Email" type="email" name="email" />

        <div className="relative">
          <Input
            placeholder="Enter Your Password"
            type={showPassword ? "text" : "password"}
            name="password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2/4 transform -translate-y-1/2 text-sm text-blue-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <Button type="submit">Login</Button>

        <div className="flex gap-2 items-center">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Don't have an account?
          </label>
          <Link to="/signup">
            <label
              htmlFor="terms"
              className="text-sm font-medium cursor-pointer text-blue-600 hover:underline"
            >
              Signup
            </label>
          </Link>

          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline ml-2"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
