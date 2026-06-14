import React, { useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "@/api/axiosConfig";
import useRazorpay from "@/hooks/use-razorpay";
import { fetchOrderDetails } from "@/redux/slices/order";
import { formatPrice } from "@/utils/orderHelpers";

const ExchangePaymentStatus = ({
  exchange,
  orderId,
  paymentMethod = "COD",
  customerDetails = {},
  onPaymentSuccess,
  compact = false,
}) => {
  const dispatch = useDispatch();
  const { openExchangePaymentModal } = useRazorpay();
  const { user } = useSelector((state) => state.auth);
  const [paying, setPaying] = useState(false);

  if (!exchange?.pricing?.paymentRequired) {
    return (
      <p className="text-green-700 dark:text-green-400 font-medium mt-1">
        No extra payment required
      </p>
    );
  }

  const extraAmount = Number(exchange.pricing.extraAmountToPay) || 0;
  const isCod =
    String(exchange.payment?.method || paymentMethod || "COD").toUpperCase() ===
    "COD";
  const isPaid = exchange.payment?.status === "PAID";
  const isPending = exchange.payment?.status === "PENDING";
  const canPayOnline =
    !isCod &&
    isPending &&
    exchange.status === "PAYMENT_PENDING" &&
    exchange.id;

  const razorpayUserDetails = {
    name: customerDetails.name || user?.name || "",
    email: customerDetails.email || user?.email || "",
    phone: customerDetails.phone || user?.phone || "",
  };

  const handlePayNow = async () => {
    if (!exchange.id) return;

    setPaying(true);
    try {
      const payRes = await apiClient.post(
        `/exchanges/${exchange.id}/create-payment`
      );
      const payData = payRes.data?.data;

      await openExchangePaymentModal({
        exchangeId: exchange.id,
        razorpayOrderId: payData.razorpayOrderId,
        amount: payData.amount,
        key: payData.key,
        userDetails: razorpayUserDetails,
        onSuccess: () => {
          dispatch(fetchOrderDetails(orderId));
          onPaymentSuccess?.();
        },
        onFailure: () => {
          dispatch(fetchOrderDetails(orderId));
        },
      });
    } catch (err) {
      console.error("Exchange payment error:", err);
    } finally {
      setPaying(false);
    }
  };

  if (isPaid) {
    return (
      <div
        className={`rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 ${
          compact ? "p-3 mt-2" : "p-4 mt-3"
        }`}
      >
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">Extra payment received</p>
        </div>
        <p className="text-lg font-bold text-green-900 dark:text-green-200 mt-1">
          {formatPrice(extraAmount)}
        </p>
      </div>
    );
  }

  if (isCod) {
    return (
      <div
        className={`rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 ${
          compact ? "p-3 mt-2" : "p-4 mt-3"
        }`}
      >
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Banknote className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">Cash on delivery — extra amount</p>
        </div>
        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
          {formatPrice(extraAmount)}
        </p>
        <p className="text-xs text-amber-900/90 dark:text-amber-200/80 mt-2 leading-relaxed">
          Naya product jab deliver hoga, tab delivery agent ko yeh amount cash mein
          dena hoga.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 ${
        compact ? "p-3 mt-2" : "p-4 mt-3"
      }`}
    >
      <div className="flex items-center gap-2 text-[#2874f0]">
        <CreditCard className="w-4 h-4 shrink-0" />
        <p className="text-sm font-semibold">
          {canPayOnline ? "Pay online — extra amount" : "Extra payment pending"}
        </p>
      </div>
      <p className="text-2xl font-bold text-[#2874f0] mt-1">
        {formatPrice(extraAmount)}
      </p>
      {canPayOnline ? (
        <>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
            Exchange request tabhi process hogi jab yeh amount online pay ho jaye.
          </p>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={paying}
            className="mt-3 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#2874f0] text-white text-sm font-semibold hover:bg-[#1c5fd0] disabled:opacity-60"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Opening payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay {formatPrice(extraAmount)} now
              </>
            )}
          </button>
        </>
      ) : (
        <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
          Admin approval ke baad bhi payment status yahan dikhega.
        </p>
      )}
    </div>
  );
};

export default ExchangePaymentStatus;
