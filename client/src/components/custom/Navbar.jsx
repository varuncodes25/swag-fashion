import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import CartDrawer from "./CartDrawer";
import { User } from "lucide-react";
import LogoutToggle from "./LogoutToggle";
import { useSelector } from "react-redux";
import FaqPage from "../FaqPage";
import { ChevronLeft } from "lucide-react";
const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const handalNavigate = () => {
    navigate("/")
  }
  return (
    <nav className="flex justify-between items-center px-8 py-5 border-b dark:bg-zinc-900">
      {/* icons */}
      <div className="flex gap-2 justify-center items-center">
        <ChevronLeft className="w-5 h-5 text-black" onClick={handalNavigate} />
        <ModeToggle />
        <CartDrawer />

        {isAuthenticated ? (
          <LogoutToggle user={user} />
        ) : (
          <Link to="/login">
            <User
              size={28}
              strokeWidth={1.3}
              className="text-gray-800 dark:text-white hover:scale-105 transition-all ease-in-out cursor-pointer"
            />
          </Link>
        )}
      </div>
      <Link to={"/"} className="text-2xl font-bold">
        swag fashion
      </Link>
      <ul className="hidden sm:flex gap-2 text-xl">
        <Link to="/about">About</Link>
        <Link to="/faq">faq</Link>
      </ul>
    </nav>
  );
};

export default Navbar;
