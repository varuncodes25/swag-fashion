"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CancelOrderDialog({ orderId, isCancelled, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError("Please enter a reason");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/cancel-order/`,
        { orderId, reason }
      );
      setOpen(false);
      setReason("");
      setError("");
      onSuccess?.(data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={isCancelled ? "outline" : "destructive"}
        onClick={() => !isCancelled && setOpen(true)}
        disabled={isCancelled}
      >
        {isCancelled ? "Cancelled" : "Cancel Order"}
      </Button>

      {!isCancelled && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Please provide a reason for cancelling your order.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="Enter reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
