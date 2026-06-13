import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Truck,
  Loader2,
  Search,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TrackingSection from "@/components/order/TrackingSection";
import {
  formatDate,
  formatPrice,
  getStatusColor,
} from "@/utils/orderHelpers";

const API_URL = import.meta.env.VITE_API_URL;

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || "",
  );
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/orders/track-guest`, {
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      });
      setResult(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not find your order. Check the details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = () => {
    const url = result?.tracking?.trackingUrl;
    const awb = result?.tracking?.awb;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (awb && !String(awb).startsWith("MOCK")) {
      window.open(
        `https://shiprocket.co/tracking/${awb}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const canTrackShipment =
    result?.tracking?.isShipped &&
    (result?.tracking?.trackingUrl ||
      (result?.tracking?.awb &&
        !String(result.tracking.awb).startsWith("MOCK")));

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-muted/30 to-background px-4 py-6 sm:py-10">
      <div className="max-w-lg mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your order number and mobile number used at checkout. No login
            required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              placeholder="e.g. SIS-20250519-001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              maxLength={10}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="btn-premium w-full h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Track order
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Have an account?{" "}
            <Link
              to="/orders"
              className="text-primary font-medium hover:underline"
            >
              View all orders
            </Link>
          </p>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {result.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed {formatDate(result.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(result.status)}`}
                >
                  {result.status}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
                <div>
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-semibold text-foreground">
                    {formatPrice(result.totalAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Items</dt>
                  <dd className="font-semibold text-foreground">
                    {result.itemCount}
                  </dd>
                </div>
                {result.shippingCity && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Ship to</dt>
                    <dd className="font-medium text-foreground">
                      {result.shippingCity}
                    </dd>
                  </div>
                )}
              </dl>

              {result.tracking?.awb && (
                <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">AWB: </span>
                  <span className="font-mono font-medium">
                    {result.tracking.awb}
                  </span>
                  {result.tracking.courierName && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {result.tracking.courierName}
                    </span>
                  )}
                </div>
              )}

              {canTrackShipment && (
                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={handleTrackShipment}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Track on courier site
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
                </Button>
              )}

              {!result.tracking?.isShipped && (
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Your order is being prepared. Tracking will be available once
                  it ships.
                </p>
              )}
            </div>

            {result.items?.length > 0 && (
              <div className="rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">Items</h3>
                <ul className="space-y-3">
                  {result.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 items-center text-sm"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover border border-border"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground">
                          Qty {item.quantity}
                          {item.size ? ` · ${item.size}` : ""}
                          {item.color ? ` · ${item.color}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.timeline?.length > 0 && (
              <TrackingSection trackingData={result.timeline} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
