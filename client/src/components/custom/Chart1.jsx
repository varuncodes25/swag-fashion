"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Colors } from "@/constants/colors";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Mapping product categories to bar keys
const categoryMap = {
  "Men": "mens",
  "Women": "womens",
  "Kids": "kids",
  "Men & Women": "menwomen", // if you use this as a separate category
};


const chartConfig = {
  mens: { label: "Mens", color: Colors.customGray },
  womens: { label: "Womens", color: Colors.customYellow },
  kids: { label: "Kids", color: Colors.customIsabelline },
  menwomen: { label: "Men & Women", color: Colors.customIsabelline },
  // menswomens: { label: "Mens + Womens", color: Colors.customYellow }, // NEW
};


const monthLabels = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function Chart1() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-all-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const orders = response.data.data;
      const monthlyStats = {};

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const month = monthLabels[date.getMonth()];

        // Initialize month entry if not present
        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            month,
            mens: 0,
            womens: 0,
            kids: 0,
            menwomen: 0,
            
          };
        }

        // Add product quantities
        order.products.forEach((prod) => {
          const category = prod.id?.category;
          const key = categoryMap[category];
          if (key && monthlyStats[month][key] !== undefined) {
            monthlyStats[month][key] += prod.quantity;
          }
        });

        // After processing products, update combined mens + womens
        monthlyStats[month].menswomens =
          monthlyStats[month].mens + monthlyStats[month].womens;
      });

      const currentMonthIndex = new Date().getMonth();
      const lastSixMonths = [];

      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonthIndex - i + 12) % 12;
        const monthName = monthLabels[monthIndex];
        lastSixMonths.push(
          monthlyStats[monthName] || {
            month: monthName,
            mens: 0,
            womens: 0,
            kids: 0,
            menwomen: 0,
           
          }
        );
      }

      setChartData(lastSixMonths);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  fetchOrders();
}, []);



  return (
    <Card className="flex-1 rounded-xl bg-muted/50">
      <CardHeader>
        <CardTitle>Orders by Category</CardTitle>
        <CardDescription>Mens, Womens & Kids – Last 6 Months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mens" fill="var(--color-mens)" radius={4} />
              <Bar dataKey="womens" fill="var(--color-womens)" radius={4} />
              <Bar dataKey="kids" fill="var(--color-kids)" radius={4} />
              <Bar dataKey="menwomen" fill="var(--color-kids)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground">
            Based on total quantities ordered in each category
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
