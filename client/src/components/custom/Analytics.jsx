import React, { useEffect, useState } from "react";
import { SidebarInset } from "../ui/sidebar";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { Chart1 } from "./Chart1";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";

const Analytics = () => {
  const [metrics, setMetrics] = useState([]);
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL + "/get-metrics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const { data } = await res.data;
        setMetrics(data);
      } catch (error) {
        return handleErrorLogout(error);
      }
    };

    getMetrics();
  }, []);

  return (
    <div className="w-screen md:w-[90vw] xl:w-[80vw] flex justify-center items-center">
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <div className="h-fit rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Total Sales</h3>
                <DollarSign size={16} />
              </div>
              <div className="grid mt-2">
                <span className="text-2xl font-bold">
                  ₹{metrics?.totalSales?.count}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  +{metrics?.totalSales?.growth}% from last month
                </span>
              </div>
            </div>

            <div className="h-fit rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Users</h3>
                <Users size={16} />
              </div>
              <div className="grid mt-2">
                <span className="text-2xl font-bold">
                  +{metrics?.users?.count}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  +{metrics?.users?.growth}% from last month
                </span>
              </div>
            </div>

            <div className="h-fit rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Sales</h3>
                <CreditCard size={16} />
              </div>
              <div className="grid mt-2">
                <span className="text-2xl font-bold">
                  ₹{metrics?.sales?.count}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  +{metrics?.sales?.growth}% from last month
                </span>
              </div>
            </div>

            <div className="h-fit rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Active Now</h3>
                <Activity size={16} />
              </div>
              <div className="grid mt-2">
                <span className="text-2xl font-bold">
                  {metrics?.activeNow?.count}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  +{metrics?.activeNow?.growth}% from last month
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Chart1 />
            <div className="p-5 bg-muted/50 rounded-lg">
              <h3 className="font-bold text-xl">Recent Sales</h3>
              <p className="text-sm mt-1 my-8">You make 40 sales this month.</p>
              <div className="flex flex-1 flex-col gap-4">
                {metrics?.recentSales?.users?.map((user, index) => (
                  <div
                    key={user?._id}
                    className="h-fit py-1 w-full xl:w-[30rem] rounded-lg flex justify-between items-center"
                  >
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          {user?.userId?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-md font-semibold capitalize">
                          {user?.userId?.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {user?.userId?.email}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-bold">₹{user?.amount}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default Analytics;
