import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Truck,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";

import { SidebarInset } from "../ui/sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

import useErrorLogout from "@/hooks/use-error-logout";
import LineSalesChart from "../chart/LineChart";
import CategoryPieChart from "../chart/PieChart";
import ComboSalesChart from "../chart/ComboSalesChart";

/* ======================
   HELPERS
====================== */
const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num = 0) => {
  return num.toLocaleString("en-IN");
};

const formatPercent = (value = 0) => {
  const num = Number(value);
  return {
    text: `${num > 0 ? "+" : ""}${num.toFixed(1)}%`,
    color:
      num > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : num < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500 dark:text-gray-400",
    Icon: num >= 0 ? ArrowUpRight : ArrowDownRight,
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handleErrorLogout } = useErrorLogout();
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHalf, setSelectedHalf] = useState("full");
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch metrics when filters change
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-metrics?year=${selectedYear}&half=${selectedHalf}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setMetrics(res.data.data);
        
        if (res.data.data?.metadata?.availableYears) {
          setAvailableYears(res.data.data.metadata.availableYears);
        }
      } catch (error) {
        handleErrorLogout(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedYear, selectedHalf]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const { overview, statusDistribution, paymentStatus, charts, recentOrders, summary, metadata } = metrics;
  
  const revenueGrowth = formatPercent(overview?.monthlyGrowth);
  const todayGrowth = formatPercent(overview?.todayGrowth);

  // Get period label based on selection
  const getPeriodLabel = () => {
    if (selectedHalf === "H1") return "January - June";
    if (selectedHalf === "H2") return "July - December";
    return "Full Year";
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-2 sm:p-4">
          
          {/* HEADER WITH FILTERS */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getPeriodLabel()} {selectedYear}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* HALF YEAR SELECTOR */}
              <Select value={selectedHalf} onValueChange={setSelectedHalf}>
                <SelectTrigger className="w-[140px]">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Year</SelectItem>
                  <SelectItem value="H1">Jan - Jun (H1)</SelectItem>
                  <SelectItem value="H2">Jul - Dec (H2)</SelectItem>
                </SelectContent>
              </Select>

              {/* YEAR SELECTOR */}
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={selectedYear.toString()}>
                      {selectedYear}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                Updated: {formatDate(metrics?.timestamps?.fetchedAt)}
              </Badge>
            </div>
          </div>

          {/* PERIOD SUMMARY CARD */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Period Revenue</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(overview?.periodRevenue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Period Orders</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(overview?.periodOrders || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Avg Monthly</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency((overview?.periodRevenue || 0) / 
                      (selectedHalf === "full" ? 12 : 6))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Best Month</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {charts?.monthlyRevenue?.length > 0 
                      ? formatCurrency(Math.max(...charts.monthlyRevenue.map(m => m.revenue)))
                      : '₹0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI CARDS */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(overview?.totalRevenue)}
              subtitle="Lifetime sales"
              icon={DollarSign}
              trend={{
                value: revenueGrowth.text,
                color: revenueGrowth.color,
                Icon: revenueGrowth.Icon,
                label: "vs last month"
              }}
            />

            <MetricCard
              title="Total Orders"
              value={formatNumber(overview?.totalOrders)}
              subtitle="All time orders"
              icon={ShoppingBag}
              badge={{
                text: `${overview?.totalCOD || 0} COD · ${overview?.totalPrepaid || 0} Prepaid`,
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }}
            />

            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(overview?.todayRevenue)}
              subtitle={`${overview?.todayOrders || 0} orders today`}
              icon={CreditCard}
              trend={{
                value: todayGrowth.text,
                color: todayGrowth.color,
                Icon: todayGrowth.Icon,
                label: "vs yesterday"
              }}
            />

            <MetricCard
              title="Active Orders"
              value={overview?.activeOrders || 0}
              subtitle={`₹${overview?.activeRevenue?.toLocaleString() || 0} in last hour`}
              icon={Activity}
              badge={{
                text: `${overview?.activeGrowth?.toFixed(1) || 0}% vs avg`,
                color: overview?.activeGrowth > 0 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }}
            />
          </div>

          {/* SECONDARY METRICS */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <SimpleMetricCard
              title="This Month"
              value={formatCurrency(overview?.thisMonthRevenue)}
              subtitle={`${overview?.thisMonthOrders || 0} orders`}
              trend={revenueGrowth}
            />

            <SimpleMetricCard
              title="Avg. Order Value"
              value={formatCurrency(overview?.avgOrderValue)}
              subtitle="Per order"
            />

            <SimpleMetricCard
              title="Avg. Delivery"
              value={`${overview?.avgDeliveryDays || 0} days`}
              subtitle="From confirmation"
            />

            <SimpleMetricCard
              title="COD vs Prepaid"
              value={`${summary?.codPercentage || 0}% / ${summary?.prepaidPercentage || 0}%`}
              subtitle="Payment split"
            />
          </div>

          {/* STATUS DISTRIBUTION */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <StatusCard
              title="Order Status"
              icon={Package}
              data={statusDistribution}
              total={overview?.totalOrders}
            />

            <StatusCard
              title="Payment Status"
              icon={CreditCard}
              data={paymentStatus}
              total={overview?.totalOrders}
            />

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Delivery</p>
                    <p className="text-2xl font-bold">{overview?.avgDeliveryDays || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipped Orders</p>
                    <p className="text-2xl font-bold">{statusDistribution?.shipped || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivered Today</p>
                    <p className="text-2xl font-bold">
                      {statusDistribution?.delivered || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CHARTS SECTION */}
          <div className="flex flex-col gap-6">
            
            {/* COMBO CHART */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Revenue & Orders Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <ComboSalesChart data={metrics || []} />
              </CardContent>
            </Card>

            {/* LINE CHART */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <LineSalesChart data={metrics || []} />
              </CardContent>
            </Card>

            {/* BOTTOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* PIE CHART */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <CategoryPieChart data={metrics || {}} />
                </CardContent>
              </Card>

              {/* TOP PRODUCTS */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {charts?.topProducts?.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {index + 1}. {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.quantity} units · {product.orders} orders
                          </p>
                        </div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    ))}
                    {(!charts?.topProducts || charts.topProducts.length === 0) && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No product data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RECENT ORDERS */}
            <RecentSales orders={recentOrders || []} />
          </div>

          {/* PERIOD INFO */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            Period: {new Date(metrics?.timestamps?.period?.start).toLocaleDateString()} - {new Date(metrics?.timestamps?.period?.end).toLocaleDateString()}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

/* ======================
   COMPONENTS
====================== */

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, badge }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <trend.Icon className={`h-3 w-3 ${trend.color}`} />
              <span className={`text-xs font-medium ${trend.color}`}>
                {trend.value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
      
      {badge && (
        <Badge className={`mt-4 ${badge.color}`}>
          {badge.text}
        </Badge>
      )}
    </CardContent>
  </Card>
);

const SimpleMetricCard = ({ title, value, subtitle, trend }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <trend.Icon className={`h-3 w-3 ${trend.color}`} />
          <span className={`text-xs ${trend.color}`}>{trend.text}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const StatusCard = ({ title, icon: Icon, data, total }) => {
  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-500" },
    confirmed: { label: "Confirmed", color: "bg-blue-500" },
    shipped: { label: "Shipped", color: "bg-purple-500" },
    delivered: { label: "Delivered", color: "bg-emerald-500" },
    cancelled: { label: "Cancelled", color: "bg-rose-500" },
    paid: { label: "Paid", color: "bg-emerald-500" },
    failed: { label: "Failed", color: "bg-rose-500" },
    refunded: { label: "Refunded", color: "bg-gray-500" },
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data || {}).map(([key, value]) => {
            if (value === 0) return null;
            const config = statusConfig[key];
            if (!config) return null;
            
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{config.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${config.color}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentSales = ({ orders = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Orders</span>
          <Badge variant="outline">{orders.length} orders</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 8).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {order.customer?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {order.customer?.name || "Guest"}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {order.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>#{order.orderNumber?.slice(-8)}</span>
                    <span>•</span>
                    <span>{order.itemsPreview?.length || 0} items</span>
                    <span>•</span>
                    <span className={order.status === "CANCELLED" ? "text-rose-500" : ""}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(order.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(order.date)}
                </p>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent orders
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsSkeleton = () => (
  <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-6 p-2 sm:p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  </div>
);

export default Analytics;