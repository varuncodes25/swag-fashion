import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, password } = e.target.elements;

    // Name validation
    if (!name.value.trim()) {
      return toast({ title: "Name is required", variant: "destructive" });
    }
    if (name.value.trim().length < 3) {
      return toast({ title: "Name must be at least 3 characters", variant: "destructive" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      return toast({ title: "Email is required", variant: "destructive" });
    }
    if (!emailRegex.test(email.value.trim())) {
      return toast({ title: "Enter a valid email address", variant: "destructive" });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/; // adjust length as needed
    if (!phone.value.trim()) {
      return toast({ title: "Phone number is required", variant: "destructive" });
    }
    if (!phoneRegex.test(phone.value.trim())) {
      return toast({ title: "Enter a valid phone number", variant: "destructive" });
    }

    // Password validation
    if (!password.value.trim()) {
      return toast({ title: "Password is required", variant: "destructive" });
    }
    if (password.value.trim().length < 6) {
      return toast({ title: "Password must be at least 6 characters", variant: "destructive" });
    }

    // Terms validation
    if (!enabled) {
      return toast({ title: "You must accept the terms and conditions", variant: "destructive" });
    }

    // If all validation passes
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/signup", {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
      });

      const data = await res.data;

      toast({ title: data.message });
      navigate("/login");
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="w-[60vw] lg:w-[25vw] mx-auto my-10 grid gap-3">
        <h1 className="text-2xl font-bold">Register your account</h1>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <Input placeholder="Enter Your Name" type="text" name="name" className="p-1" />
          <Input placeholder="Enter Your Email" type="email" name="email" />
          <Input placeholder="Enter Your Phone" type="tel" name="phone" />
          <div className="flex items-center w-full border rounded-md bg-white dark:bg-transparent p-0">
            <Input
              className="flex-1 border-none outline-none focus:ring-0 focus:outline-none 
               bg-transparent text-gray-900 dark:text-gray-100 
               placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter Your Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="pr-3 text-gray-500 dark:text-gray-300 
               hover:text-gray-700 dark:hover:text-gray-100"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>



          <div className="flex items-center space-x-2">
            <Checkbox id="terms" onCheckedChange={(e) => setEnabled(e)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
          </div>
          <Button disabled={!enabled}>Sign Up</Button>
          <div className="flex gap-2 items-center">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Already have an account?
            </label>
            <Link to={"/login"}>
              <label
                htmlFor="terms"
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
              >
                Login
              </label>
            </Link>

          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;
