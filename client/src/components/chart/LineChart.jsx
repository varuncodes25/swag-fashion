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
  // ✅ CHECK: charts.monthlyRevenue from your exact API response
  if (!data?.charts?.monthlyRevenue?.length) {
    return (
      <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur">
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

  /* =========================
     YOUR EXACT API RESPONSE:
     {
       month: "Feb 2026",
       revenue: 25994.96,
       orders: 19
     }
  ========================= */
  const chartData = data.charts.monthlyRevenue.map((item) => ({
    month: item.month.split(' ')[0], // "Feb", "Sep", "Dec"
    fullMonth: item.month, // "Feb 2026"
    revenue: Number(item.revenue) || 0,
    orders: Number(item.orders) || 0,
    // Calculate AOV (Average Order Value)
    aov: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0,
  }));

  // Filter out months with zero revenue? Optional - uncomment if needed
  // .filter(item => item.revenue > 0);

  return (
    <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
        <CardDescription className="text-sm">
          Revenue, Orders & Average Order Value
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            {/* ===== Gradients ===== */}
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={1} />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.25} />
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
              tick={{ fontSize: 12 }}
            />

            {/* ===== Revenue Axis (₹) ===== */}
            <YAxis
              yAxisId="revenue"
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
              }
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={60}
            />

            {/* ===== Orders Axis ===== */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={40}
            />

            {/* ===== AOV Axis (hidden) ===== */}
            <YAxis yAxisId="aov" hide domain={[0, 'auto']} />

            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                borderRadius: 8,
                border: "none",
                color: "#fff",
                fontSize: 13,
                padding: "12px 16px",
              }}
              labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}
              formatter={(value, name, props) => {
                if (name === "Revenue")
                  return [`₹${value.toLocaleString('en-IN')}`, name];
                if (name === "Orders") return [value, name];
                if (name === "AOV") return [`₹${value.toLocaleString('en-IN')}`, "Avg. Order Value"];
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
              height={36}
              formatter={(value) => {
                if (value === "revenue") return "Revenue";
                if (value === "orders") return "Orders";
                if (value === "aov") return "Avg. Order Value";
                return value;
              }}
            />

            {/* ===== Revenue Line ===== */}
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="url(#revenueGradient)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#10B981",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 7,
                fill: "#10B981",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="Revenue"
            />

            {/* ===== Orders Line ===== */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#0EA5E9"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#0EA5E9",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 6,
                fill: "#0EA5E9",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="Orders"
            />

            {/* ===== AOV Line (Dashed) ===== */}
            <Line
              yAxisId="aov"
              type="monotone"
              dataKey="aov"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{
                r: 3,
                fill: "#8B5CF6",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 6,
                fill: "#8B5CF6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="aov"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}