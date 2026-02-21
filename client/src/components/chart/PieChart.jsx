"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Colors } from "@/constants/colors";

/* =========================
   CATEGORY → COLOR MAP
========================= */
const CATEGORY_COLORS = {
  Cosmetics: Colors.customYellow,
  "Imitation Jewellery": Colors.customPink,
  "Pooja Essentials": Colors.customGreen,
  Bags: Colors.customBlue,
  Toys: Colors.customPurple,
  Gifts: Colors.customPink,
  Stationery: Colors.customGreen,
  Men: Colors.customBlue,
  Women: Colors.customPink,
  Kids: Colors.customGreen,
  Collections: Colors.customPurple,
};

export default function CategoryPieChart({ data }) {
  console.log("📊 Pie chart received data:", data);
  
  // ============ SAFE DATA ACCESS ============
  let categoryData = null;
  
  // Case 1: sixMonthsBarChartData format
  if (data?.sixMonthsBarChartData?.length > 0) {
    console.log("✅ Using sixMonthsBarChartData format");
    categoryData = data.sixMonthsBarChartData;
  }
  // Case 2: charts.categorySales format (tumhara actual data)
  else if (data?.charts?.categorySales) {
    console.log("✅ Using charts.categorySales format");
    
    // Get the latest month's data (e.g., "2026-02")
    const months = Object.keys(data.charts.categorySales);
    if (months.length > 0) {
      const latestMonth = months[months.length - 1];
      const monthData = data.charts.categorySales[latestMonth];
      
      // Convert object to array format
      categoryData = Object.entries(monthData).map(([category, count]) => ({
        _id: { category },
        count
      }));
      console.log("✅ Converted category data:", categoryData);
    }
  }
  // Case 3: No valid data
  else {
    console.log("❌ No valid category data found");
    return (
      <Card className="bg-muted/60 rounded-xl">
        <CardHeader>
          <CardTitle>Category Contribution</CardTitle>
          <CardDescription>Share by category</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No category data available</p>
        </CardContent>
      </Card>
    );
  }

  if (!categoryData || categoryData.length === 0) {
    return (
      <Card className="bg-muted/60 rounded-xl">
        <CardHeader>
          <CardTitle>Category Contribution</CardTitle>
          <CardDescription>Share by category</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No category data available</p>
        </CardContent>
      </Card>
    );
  }

  /* =========================
     AGGREGATE CATEGORY DATA
  ========================= */
  const categoryMap = {};

  categoryData.forEach((item) => {
    const category = item._id?.category || "Unknown";
    const count = item.count || 0;
    categoryMap[category] = (categoryMap[category] || 0) + count;
  });

  const pieData = Object.entries(categoryMap).map(
    ([name, value]) => ({ name, value })
  );

  console.log("✅ Final pieData:", pieData);

  return (
    <Card className="bg-muted/60 rounded-xl">
      <CardHeader>
        <CardTitle>Category Contribution</CardTitle>
        <CardDescription>Share by category</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* ===== PIE ===== */}
          <div className="w-full md:w-[55%] h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        CATEGORY_COLORS[entry.name] ||
                        Colors.customGray
                      }
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ===== LEGEND ===== */}
          <div className="w-full md:w-[45%] flex flex-col gap-3">
            {pieData.map((item) => {
              const total = pieData.reduce(
                (s, d) => s + d.value,
                0
              );
              const percent = (
                (item.value / total) *
                100
              ).toFixed(1);

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[item.name] ||
                          Colors.customGray,
                      }}
                    />
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}