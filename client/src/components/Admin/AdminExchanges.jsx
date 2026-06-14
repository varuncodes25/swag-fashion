import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient from "@/api/axiosConfig";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import { formatDate, formatPrice } from "@/utils/orderHelpers";
import { Loader2, RefreshCw, Search, X, ArrowRight } from "lucide-react";

const EXCHANGE_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "PAYMENT_PENDING", label: "Payment pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "PICKUP_SCHEDULED", label: "Pickup scheduled" },
  { value: "IN_TRANSIT", label: "In transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusBadgeClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED") {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }
  if (s === "REQUESTED" || s === "PAYMENT_PENDING") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  }
  if (s === "REJECTED" || s === "CANCELLED") {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
};

const AdminExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await apiClient.get("/admin/exchanges", { params });
      setExchanges(res.data?.data?.exchanges || []);
      setPagination((prev) => ({
        ...prev,
        ...(res.data?.data?.pagination || {}),
      }));
    } catch (error) {
      handleErrorLogout(error, error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch, handleErrorLogout]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const runAction = async (exchangeId, action, body = {}) => {
    setActionId(exchangeId);
    try {
      let res;
      switch (action) {
        case "approve":
          res = await apiClient.put(`/admin/exchanges/${exchangeId}/approve`, body);
          break;
        case "reject":
          res = await apiClient.put(`/admin/exchanges/${exchangeId}/reject`, body);
          break;
        case "complete":
          res = await apiClient.put(`/admin/exchanges/${exchangeId}/complete`, body);
          break;
        case "mark-paid":
          res = await apiClient.put(`/admin/exchanges/${exchangeId}/mark-paid`, body);
          break;
        default:
          return;
      }

      toast({
        title: "Success",
        description: res.data?.message || "Updated successfully",
      });
      fetchExchanges();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = (exchange) => {
    if (
      exchange.pricing?.paymentRequired &&
      exchange.payment?.status === "PENDING" &&
      exchange.payment?.method !== "COD"
    ) {
      toast({
        title: "Payment pending",
        description: "Mark extra payment as paid before approving (or use COD).",
        variant: "destructive",
      });
      return;
    }
    if (!window.confirm("Approve this exchange? Order item and totals will update.")) {
      return;
    }
    runAction(exchange.id, "approve");
  };

  const handleReject = (exchange) => {
    const reason = window.prompt("Rejection reason:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast({
        title: "Required",
        description: "Rejection reason is required",
        variant: "destructive",
      });
      return;
    }
    runAction(exchange.id, "reject", { rejectionReason: reason.trim() });
  };

  const handleComplete = (exchange) => {
    if (!window.confirm("Mark exchange as completed?")) return;
    runAction(exchange.id, "complete");
  };

  const handleMarkPaid = (exchange) => {
    if (!window.confirm("Mark extra payment as received?")) return;
    runAction(exchange.id, "mark-paid");
  };

  return (
    <div className="px-3 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exchange Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve updates order item &amp; sets status to Exchange Approved
          </p>
        </div>
        <Button variant="outline" onClick={fetchExchanges} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exchange # or order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {EXCHANGE_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && exchanges.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : exchanges.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No exchange requests found
        </Card>
      ) : (
        <div className="space-y-4">
          {exchanges.map((ex) => (
            <Card key={ex.id} className="p-5 border border-border bg-card space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {ex.exchangeNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(ex.status)}`}
                    >
                      {ex.status?.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {ex.type?.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order #{ex.orderNumber} · {formatDate(ex.requestedAt)}
                  </p>
                  <p className="text-sm mt-2 text-foreground">{ex.reason}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["REQUESTED", "PAYMENT_PENDING"].includes(ex.status) && (
                    <>
                      {ex.pricing?.paymentRequired &&
                        ex.payment?.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === ex.id}
                            onClick={() => handleMarkPaid(ex)}
                          >
                            Mark paid
                          </Button>
                        )}
                      <Button
                        size="sm"
                        disabled={actionId === ex.id}
                        onClick={() => handleApprove(ex)}
                      >
                        {actionId === ex.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Approve"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionId === ex.id}
                        onClick={() => handleReject(ex)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {ex.status === "APPROVED" && (
                    <Button
                      size="sm"
                      disabled={actionId === ex.id}
                      onClick={() => handleComplete(ex)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Original
                  </p>
                  <p className="text-sm font-medium">{ex.details?.originalProductName}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.details?.originalColor} / {ex.details?.originalSize}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(ex.details?.originalLineTotal)}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/30 p-3 bg-primary/5">
                  <p className="text-[10px] font-semibold text-primary uppercase mb-1 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> New
                  </p>
                  <p className="text-sm font-medium">{ex.details?.newProductName}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.details?.newColor} / {ex.details?.newSize}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(ex.details?.newLineTotal)}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                {ex.pricing?.paymentRequired ? (
                  <span className="text-amber-700 font-medium">
                    Extra payment: {formatPrice(ex.pricing.extraAmountToPay)} (
                    {ex.payment?.status || "PENDING"})
                  </span>
                ) : ex.pricing?.savingsAmount > 0 ? (
                  <span className="text-green-700">
                    {formatPrice(ex.pricing.savingsAmount)} cheaper — no refund
                  </span>
                ) : (
                  <span className="text-muted-foreground">No extra payment</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((p) => ({
                ...p,
                page: Math.min(p.totalPages, p.page + 1),
              }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminExchanges;
