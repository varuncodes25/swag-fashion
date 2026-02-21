"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

/* =========================
   MONTH MAP
========================= */
const monthMap = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

export default function RevenueDashboard({ data }) {
  console.log("📊 RevenueDashboard received data:", data);
  
  // ============ SAFE DATA ACCESS ============
  let monthlyData = [];
  
  // Case 1: monthlySalesTrend format
  if (data?.monthlySalesTrend?.length > 0) {
    console.log("✅ Using monthlySalesTrend format");
    monthlyData = data.monthlySalesTrend;
  }
  // Case 2: charts.monthlyRevenue format (tumhara actual data)
  else if (data?.charts?.monthlyRevenue?.length > 0) {
    console.log("✅ Using charts.monthlyRevenue format");
    monthlyData = data.charts.monthlyRevenue.map(item => {
      // Parse month from "Feb 2026" format
      const [monthName, year] = item.month.split(' ');
      const monthNum = Object.keys(monthMap).find(key => monthMap[key] === monthName) || 1;
      
      return {
        _id: { 
          month: parseInt(monthNum), 
          year: parseInt(year) 
        },
        totalAmount: item.revenue,
        orders: item.orders
      };
    });
    console.log("✅ Converted monthlyData:", monthlyData);
  }
  // Case 3: No valid data
  else {
    console.log("❌ No valid monthly data found");
    return (
      <Card className="rounded-2xl bg-muted/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Revenue Intelligence</CardTitle>
          <CardDescription>Actuals, forecast & anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[360px]">
          <p className="text-muted-foreground">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card className="rounded-2xl bg-muted/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Revenue Intelligence</CardTitle>
          <CardDescription>Actuals, forecast & anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[360px]">
          <p className="text-muted-foreground">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  /* =========================
     BASE DATA
  ========================= */
  const chartData = monthlyData.map((item, index) => {
    const prev = monthlyData[index - 1]?.totalAmount || 0;
    const curr = Number(item.totalAmount);

    const growth = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;

    // Handle both formats
    let month = "";
    if (item._id?.month && item._id?.year) {
      month = `${monthMap[item._id.month]} ${item._id.year}`;
    } else if (item.month) {
      month = item.month;
    } else {
      month = `Month ${index + 1}`;
    }

    return {
      month: month,
      revenue: curr,
      growth,
    };
  });

  console.log("✅ Transformed chartData:", chartData);

  // ============ KPI CALCULATIONS ============
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

  const first = chartData[0]?.revenue || 0;
  const last = chartData.at(-1)?.revenue || 0;

  const overallGrowth = first > 0 ? Number((((last - first) / first) * 100).toFixed(1)) : 0;

  const bestMonth = chartData.reduce(
    (best, cur) => (cur.revenue > best.revenue ? cur : best),
    chartData[0]
  );

  const lastMoMGrowth = chartData.at(-1)?.growth ?? 0;

  // ============ FORECAST (NEXT MONTH) ============
  const lastThree = chartData.slice(-3);
  const deltas = lastThree.map((d, i) =>
    i === 0 ? 0 : d.revenue - lastThree[i - 1].revenue
  );
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length || 0;

  const forecastValue = Math.round(last + avgDelta);

  const forecastData = [
    ...chartData,
    {
      month: "Forecast",
      revenue: forecastValue,
      forecast: forecastValue,
    },
  ];

  // ============ ANOMALY DETECTION ============
  const avgRevenue = totalRevenue / chartData.length || 0;

  return (
    <>
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">💰 Total Revenue</div>
            <div className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">📈 Overall Growth</div>
            <div className="text-xl font-bold">{overallGrowth}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">⭐ Best Month</div>
            <div className="text-xl font-bold">₹{bestMonth.revenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">⚡ Last MoM</div>
            <div className="text-xl font-bold">{lastMoMGrowth}%</div>
          </CardContent>
        </Card>
      </div>

      {/* ================= CHART ================= */}
      <Card className="rounded-2xl bg-muted/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Revenue Intelligence</CardTitle>
          <CardDescription>
            Actuals, forecast & anomaly detection
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                {/* ===== Grid ===== */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />

                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                  formatter={(v, n) =>
                    n === "revenue"
                      ? [`₹${v.toLocaleString()}`, "Revenue"]
                      : [`₹${v.toLocaleString()}`, "Forecast"]
                  }
                />

                {/* ===== Gradients ===== */}
                <defs>
                  <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>

                  <linearGradient id="barSpike" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>

                {/* ===== Revenue Bars ===== */}
                <Bar
                  dataKey="revenue"
                  radius={[10, 10, 0, 0]}
                  barSize={36}
                >
                  {forecastData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.revenue > avgRevenue * 1.8
                          ? "url(#barSpike)"
                          : "url(#barNormal)"
                      }
                    />
                  ))}
                </Bar>

                {/* ===== Forecast Line ===== */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#6366F1"
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />

                {/* ===== Average Line ===== */}
                <ReferenceLine
                  y={avgRevenue}
                  stroke="#64748B"
                  strokeDasharray="4 4"
                  label={{
                    value: "Avg",
                    position: "right",
                    fill: "#64748B",
                    fontSize: 12
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}