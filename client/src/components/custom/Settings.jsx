import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";

const Settings = () => {
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  const changeUsername = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const previousUsername = formData.get("previousUsername");
    const newUsername = formData.get("newUsername");

    if (!newUsername) {
      toast({
        title: "Username to change is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + "/change-username",
        {
          previousUsername,
          newUsername,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.data;
      localStorage.setItem("user", JSON.stringify(data.user));

      e.target.reset();

      return toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      return handleErrorLogout(error);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const previousPassword = formData.get("previousPassword");
    const newPassword = formData.get("newPassword");

    if (!newPassword || !previousPassword) {
      toast({
        title: "Previous and new password is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + "/change-password",
        {
          username: JSON.parse(localStorage.getItem("user")).username,
          previousPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.data;
      localStorage.setItem("user", JSON.stringify(data.user));

      e.target.reset();

      return toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      return handleErrorLogout(error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-screen sm:w-[80vw] sm:justify-start">
      {/* CHANGE USERNAME */}
      <div>
        <h2 className="text-2xl font-bold mb-3">Change Username</h2>
        <form
          className="grid gap-3 w-[80vw] sm:w-[30vw]"
          onSubmit={changeUsername}
        >
          <Input
            type="text"
            placeholder="Enter previous username"
            name="previousUsername"
          />
          <Input
            type="text"
            placeholder="Enter new username"
            name="newUsername"
          />
          <Button type="submit">Change Username</Button>
        </form>
      </div>

      {/* CHANGE PASSWORD */}
      <div>
        <h2 className="text-2xl font-bold mb-3">Change Password</h2>
        <form
          className="grid gap-3 w-[80vw] sm:w-[30vw]"
          onSubmit={changePassword}
        >
          <Input
            type="text"
            placeholder="Enter previous password"
            name="previousPassword"
          />
          <Input
            type="text"
            placeholder="Enter new password"
            name="newPassword"
          />
          <Button type="submit">Change Password</Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
