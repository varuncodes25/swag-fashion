"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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

export default function LineSalesChart({ data }) {
  // ============ DEBUGGING ============
  console.log("📊 LineSalesChart received data:", data);
  
  // ============ SAFE DATA ACCESS ============
  // Handle different data structures
  let monthlyData = [];
  
  // Case 1: Direct array
  if (Array.isArray(data)) {
    console.log("✅ Received direct array");
    monthlyData = data;
  }
  // Case 2: Object with charts.monthlyRevenue
  else if (data?.charts?.monthlyRevenue) {
    console.log("✅ Received object with charts.monthlyRevenue");
    monthlyData = data.charts.monthlyRevenue;
  }
  // Case 3: No valid data
  else {
    console.log("❌ No valid data format found");
    return (
      <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
          <CardDescription className="text-sm">
            Revenue & Orders (last 6 months)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[360px]">
          <p className="text-muted-foreground">No sales data available</p>
        </CardContent>
      </Card>
    );
  }

  // Check if monthlyData is empty
  if (!monthlyData || monthlyData.length === 0) {
    console.log("❌ monthlyData array is empty");
    return (
      <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
          <CardDescription className="text-sm">
            Revenue & Orders (last 6 months)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[360px]">
          <p className="text-muted-foreground">No sales data available</p>
        </CardContent>
      </Card>
    );
  }

  // ============ TRANSFORM DATA ============
  console.log("✅ monthlyData:", monthlyData);
  
  const chartData = monthlyData.map((item, index) => {
    // Extract month from "Feb 2026" format
    let month = "N/A";
    let fullMonth = `Month ${index + 1}`;
    
    if (item.month) {
      const parts = item.month.split(' ');
      month = parts[0] || "N/A";
      fullMonth = item.month;
    }
    
    // Handle old format with _id
    if (item._id?.month) {
      const monthMap = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",
                        7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};
      month = monthMap[item._id.month] || "N/A";
      fullMonth = `${month} ${item._id.year || ''}`;
    }
    
    const revenue = Number(item.revenue || item.totalAmount || 0);
    const orders = Number(item.orders || 0);
    
    return {
      month: month,
      fullMonth: fullMonth,
      revenue: revenue,
      orders: orders,
      aov: orders > 0 ? Math.round(revenue / orders) : 0,
    };
  });

  console.log("✅ Transformed chartData:", chartData);

  // ============ CALCULATE TOTALS ============
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  // ============ FIXED RENDER WITH CSS ============
  return (
    <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 w-full max-w-full overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Sales Trend
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Revenue: ₹{totalRevenue.toLocaleString('en-IN')} • 
          Orders: {totalOrders}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 sm:p-4 w-full overflow-x-auto">
        <div className="min-w-[600px] lg:min-w-full h-[360px] relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.25} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.25}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  yAxisId="revenue"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  domain={[0, 'auto']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  width={45}
                />

                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  domain={[0, 'auto']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  width={30}
                />

                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.9)",
                    borderRadius: 8,
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                  formatter={(value, name) => {
                    if (name === "revenue")
                      return [`₹${Number(value).toLocaleString('en-IN')}`, "Revenue"];
                    if (name === "orders") return [value, "Orders"];
                    if (name === "aov") return [`₹${value}`, "Avg. Order Value"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0]?.payload?.fullMonth || label;
                    }
                    return label;
                  }}
                />

                <Legend
                  verticalAlign="top"
                  height={30}
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  formatter={(value) => {
                    if (value === "revenue") return "Revenue";
                    if (value === "orders") return "Orders";
                    if (value === "aov") return "Avg. Order Value";
                    return value;
                  }}
                />

                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10B981" }}
                  activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                  name="revenue"
                />

                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#0EA5E9" }}
                  activeDot={{ r: 4, fill: "#0EA5E9", stroke: "#fff", strokeWidth: 2 }}
                  name="orders"
                />

                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="aov"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ r: 2, fill: "#8B5CF6" }}
                  activeDot={{ r: 4, fill: "#8B5CF6", stroke: "#fff", strokeWidth: 2 }}
                  name="aov"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}