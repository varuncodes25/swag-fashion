import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  X,
  ArrowRight,
  Package,
  Loader2,
  CreditCard,
  Banknote,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  exchangeOrder,
  previewExchangeOrder,
  clearExchangePreview,
  clearExchangeStatus,
  fetchOrderDetails,
} from "@/redux/slices/order";
import apiClient from "@/api/axiosConfig";
import { formatPrice } from "@/utils/orderHelpers";
import { getImageUrl, optimizeGalleryImage } from "@/utils/productImages";
import ProductCard from "@/components/custom/ProductCard";
import useRazorpay from "@/hooks/use-razorpay";

const EXCHANGE_TYPES = [
  { id: "SIZE", label: "Wrong size", value: "SIZE" },
  { id: "QUALITY", label: "Quality issue", value: "QUALITY" },
  { id: "DEFECTIVE", label: "Defective / damaged", value: "DEFECTIVE" },
  { id: "OTHER", label: "Other", value: "OTHER" },
];

const STEPS = ["reason", "product", "variant", "confirm"];

const STEP_META = {
  reason: { title: "Exchange item", subtitle: "Tell us what went wrong" },
  product: { title: "Choose replacement", subtitle: "Pick a new product" },
  variant: { title: "Select variant", subtitle: "Color & size" },
  confirm: { title: "Review exchange", subtitle: "Confirm your request" },
};

const PRODUCT_LIMIT = 12;

const EXTRA_PAYMENT_OPTIONS = [
  {
    id: "RAZORPAY",
    title: "Pay online now",
    desc: "Cards, UPI, netbanking & wallets via Razorpay",
    icon: CreditCard,
    accent: "blue",
  },
  {
    id: "COD",
    title: "Pay on delivery",
    desc: "Extra amount cash mein delivery agent ko dena hoga",
    icon: Banknote,
    accent: "amber",
  },
];

const ExchangeOrderModal = ({
  isOpen,
  onClose,
  orderId,
  items = [],
  paymentMethod = "COD",
  customerDetails = {},
  onExchangeSuccess,
}) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { openExchangePaymentModal } = useRazorpay();
  const { user } = useSelector((state) => state.auth);

  const {
    exchangeLoading,
    exchangeSuccess,
    exchangePreview,
    exchangePreviewLoading,
    error,
  } = useSelector((state) => state.order);

  const [step, setStep] = useState("reason");
  const [exchangeType, setExchangeType] = useState("");
  const [itemIndex, setItemIndex] = useState(0);
  const [customReason, setCustomReason] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeQuickTag, setActiveQuickTag] = useState("all");
  const observer = useRef();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [extraPaymentMethod, setExtraPaymentMethod] = useState("RAZORPAY");

  const selectedItem = items[itemIndex] || items[0];
  const extraAmount = Number(exchangePreview?.pricing?.extraAmountToPay) || 0;
  const needsExtraPayment = Boolean(exchangePreview?.pricing?.paymentRequired);
  const payOnlineSelected = extraPaymentMethod === "RAZORPAY";
  const needsOnlinePay = needsExtraPayment && payOnlineSelected;
  const razorpayUserDetails = {
    name: customerDetails.name || user?.name || "",
    email: customerDetails.email || user?.email || "",
    phone: customerDetails.phone || user?.phone || "",
  };
  const stepIndex = STEPS.indexOf(step);
  const meta = STEP_META[step];

  useEffect(() => {
    if (isOpen) {
      setExtraPaymentMethod(
        String(paymentMethod || "COD").toUpperCase() === "COD"
          ? "COD"
          : "RAZORPAY"
      );
    }
  }, [isOpen, paymentMethod]);

  const quickTags = useMemo(() => {
    const tags = [
      { id: "all", label: "All products" },
      { id: "similar", label: "Similar products" },
    ];

    if (selectedItem?.productId) {
      tags.push({
        id: "same-product",
        label: exchangeType === "SIZE" ? "Same product · new size" : "Same product",
      });
    }

    const nameWords = (selectedItem?.name || "")
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
      .filter((w) => w.length > 3);

    const keyword = nameWords.find(
      (w) => !["size", "with", "from", "your"].includes(w.toLowerCase())
    );

    if (keyword) {
      tags.push({ id: "keyword", label: keyword, searchText: keyword });
    }

    tags.push(
      { id: "best-seller", label: "Best sellers" },
      { id: "new-arrival", label: "New arrivals" }
    );

    return tags;
  }, [selectedItem, exchangeType]);

  const getProductImageSrc = (product, color) => {
    const fromImage = getImageUrl(product?.image);
    if (fromImage)
      return optimizeGalleryImage(fromImage, { maxWidth: 600, thumb: true });

    const fromList = getImageUrl(product?.images?.[0]);
    if (fromList)
      return optimizeGalleryImage(fromList, { maxWidth: 600, thumb: true });

    if (color && product?.imagesByColor?.[color]?.[0]) {
      const colorUrl = getImageUrl(product.imagesByColor[color][0]);
      if (colorUrl)
        return optimizeGalleryImage(colorUrl, { maxWidth: 600, thumb: true });
    }

    if (product?.allImages?.[0]) {
      const allUrl = getImageUrl(product.allImages[0]);
      if (allUrl)
        return optimizeGalleryImage(allUrl, { maxWidth: 600, thumb: true });
    }

    return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  };

  const isSameSelection = useCallback(
    (productId, color, size) => {
      if (!selectedItem?.productId || !productId) return false;
      return (
        String(selectedItem.productId) === String(productId) &&
        String(selectedItem.color || "").toLowerCase() ===
          String(color || "").toLowerCase() &&
        String(selectedItem.size || "") === String(size || "")
      );
    },
    [selectedItem]
  );

  const getAvailableSizes = useCallback(
    (variants, color) =>
      (variants || [])
        .filter((v) => {
          if (v.color !== color) return false;
          const stock =
            v.availableStock ?? (v.stock || 0) - (v.reservedStock || 0);
          if (stock <= 0) return false;
          if (!selectedProduct?._id) return true;
          return !isSameSelection(selectedProduct._id, color, v.size);
        })
        .map((v) => v.size)
        .filter((size, idx, arr) => arr.indexOf(size) === idx),
    [isSameSelection, selectedProduct]
  );

  const pickDefaultVariant = useCallback(
    (variants, preferredColor) => {
      const color = preferredColor || variants?.[0]?.color || "";
      const sizes = getAvailableSizes(variants, color);
      return { color, size: sizes[0] || "" };
    },
    [getAvailableSizes]
  );

  const resetState = useCallback(() => {
    setStep("reason");
    setExchangeType("");
    setItemIndex(0);
    setCustomReason("");
    setSearch("");
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setTotalProducts(0);
    setActiveQuickTag("all");
    setSelectedProduct(null);
    setProductDetails(null);
    setSelectedColor("");
    setSelectedSize("");
    dispatch(clearExchangePreview());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) resetState();
  }, [isOpen, resetState]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const fetchProducts = useCallback(
    async (pageNum = 1, { query = "", filter = "all" } = {}, shouldAppend = false) => {
      if (pageNum === 1) {
        setLoadingProducts(true);
      } else {
        setLoadingMore(true);
      }

      const browseFilter = ["all", "keyword"].includes(filter) ? "all" : filter;

      try {
        const response = await apiClient.get("/get-products", {
          params: {
            page: pageNum,
            limit: PRODUCT_LIMIT,
            search: query.trim(),
            inStock: "true",
            ...(browseFilter === "best-seller" && { isBestSeller: "true" }),
            ...(browseFilter === "new-arrival" && { isNewArrival: "true" }),
          },
        });

        const newProducts = response.data?.data || [];
        const pagination = response.data?.pagination;
        const total = pagination?.totalProducts || newProducts.length;
        const totalPages =
          pagination?.totalPages || Math.ceil(total / PRODUCT_LIMIT);

        if (shouldAppend) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setTotalProducts(total);
        setHasMore(pageNum < totalPages);
      } catch {
        if (!shouldAppend) setProducts([]);
        toast({
          title: "Error",
          description: "Could not load products",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    },
    [toast]
  );

  const fetchSimilarProducts = useCallback(async () => {
    if (!selectedItem?.productId) return;

    setLoadingProducts(true);
    setLoadingMore(false);
    setPage(1);
    setHasMore(false);

    try {
      const response = await apiClient.get(
        `/similar-products/${selectedItem.productId}`,
        { params: { limit: 24 } }
      );
      const similar = response.data?.data || [];
      setProducts(similar);
      setTotalProducts(similar.length);
    } catch {
      setProducts([]);
      setTotalProducts(0);
      toast({
        title: "Error",
        description: "Could not load similar products",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedItem, toast]);

  useEffect(() => {
    if (!isOpen || step !== "product") return;
    if (activeQuickTag === "similar" || activeQuickTag === "same-product") return;

    setPage(1);
    setHasMore(true);
    const timer = setTimeout(
      () =>
        fetchProducts(
          1,
          {
            query: search,
            filter: activeQuickTag,
          },
          false
        ),
      300
    );
    return () => clearTimeout(timer);
  }, [isOpen, step, search, activeQuickTag, fetchProducts]);

  useEffect(() => {
    if (!isOpen || step !== "product" || page <= 1) return;
    if (activeQuickTag === "similar" || activeQuickTag === "same-product") return;

    fetchProducts(page, { query: search, filter: activeQuickTag }, true);
  }, [page, isOpen, step, search, activeQuickTag, fetchProducts]);

  const lastProductRef = useCallback(
    (node) => {
      if (loadingProducts || loadingMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingProducts, loadingMore, hasMore]
  );

  const loadProductDetails = async (product) => {
    setLoadingProductDetails(true);
    setSelectedProduct(product);
    try {
      const response = await apiClient.get(
        `/get-product-by-id/${product._id}`
      );
      const data =
        response.data?.data || response.data?.product || response.data;
      setProductDetails(data);

      const sameProduct =
        String(data._id || product._id) === String(selectedItem?.productId);
      const startColor =
        sameProduct && exchangeType === "SIZE"
          ? selectedItem.color
          : data.colors?.[0] || data.variants?.[0]?.color || "";

      const { color, size } = pickDefaultVariant(data.variants, startColor);
      setSelectedColor(color);
      setSelectedSize(size);
      setStep("variant");
    } catch {
      toast({
        title: "Error",
        description: "Could not load product details",
        variant: "destructive",
      });
    } finally {
      setLoadingProductDetails(false);
    }
  };

  const handleQuickTag = (tag) => {
    if (tag.id === "same-product") {
      if (!selectedItem?.productId) return;
      setActiveQuickTag("same-product");
      loadProductDetails({
        _id: selectedItem.productId,
        name: selectedItem.name,
      });
      return;
    }

    if (tag.id === activeQuickTag) {
      setActiveQuickTag("all");
      setSearch("");
      return;
    }

    setActiveQuickTag(tag.id);
    setPage(1);
    setHasMore(true);

    if (tag.id === "similar") {
      setSearch("");
      fetchSimilarProducts();
      return;
    }

    if (tag.id === "keyword") {
      setSearch(tag.searchText || "");
      return;
    }

    setSearch("");
    fetchProducts(1, { query: "", filter: tag.id }, false);
  };

  const colors = productDetails?.colors?.length
    ? productDetails.colors
    : [...new Set((productDetails?.variants || []).map((v) => v.color))];

  const sizesForSelectedColor = getAvailableSizes(
    productDetails?.variants,
    selectedColor
  );

  const selectedVariant = (productDetails?.variants || []).find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const selectionIsSameAsOriginal =
    selectedProduct &&
    selectedColor &&
    selectedSize &&
    isSameSelection(selectedProduct._id, selectedColor, selectedSize);

  useEffect(() => {
    if (
      !isOpen ||
      step !== "confirm" ||
      !selectedProduct?._id ||
      !selectedColor ||
      !selectedSize
    ) {
      return;
    }

    dispatch(
      previewExchangeOrder({
        orderId,
        itemIndex,
        newProductId: selectedProduct._id,
        newColor: selectedColor,
        newSize: selectedSize,
        newVariantId: selectedVariant?._id,
      })
    );
  }, [
    dispatch,
    isOpen,
    step,
    orderId,
    itemIndex,
    selectedProduct,
    selectedColor,
    selectedSize,
    selectedVariant,
  ]);

  useEffect(() => {
    if (exchangeSuccess) {
      const extraMsg =
        needsExtraPayment && extraPaymentMethod === "COD"
          ? ` Delivery par ${formatPrice(extraAmount)} cash ready rakhein.`
          : "";
      toast({
        title: "Exchange Requested",
        description: `Your exchange request has been submitted.${extraMsg}`,
        variant: "success",
      });
      onClose();
      if (onExchangeSuccess) onExchangeSuccess();
    }
  }, [
    exchangeSuccess,
    needsExtraPayment,
    extraPaymentMethod,
    extraAmount,
    onClose,
    onExchangeSuccess,
    toast,
  ]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getReason = () => {
    if (exchangeType === "OTHER") return customReason.trim();
    const typeLabel =
      EXCHANGE_TYPES.find((t) => t.value === exchangeType)?.label ||
      exchangeType;
    if (selectedProduct && selectedColor && selectedSize) {
      return `${typeLabel}: exchange for ${selectedProduct.name} (${selectedColor} / ${selectedSize})`;
    }
    return typeLabel;
  };

  const goToConfirm = () => {
    if (!selectedColor || !selectedSize || !selectedVariant) {
      toast({
        title: "Error",
        description: "Please select color and size",
        variant: "destructive",
      });
      return;
    }

    if (selectionIsSameAsOriginal) {
      toast({
        title: "Same item selected",
        description:
          "Purane jaisa hi product/size choose nahi kar sakte. Koi alag size ya product select karein.",
        variant: "destructive",
      });
      return;
    }

    dispatch(clearExchangePreview());
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!exchangePreview || !selectedProduct?._id) {
      toast({
        title: "Error",
        description: "Please wait for price calculation",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      orderId,
      reason: getReason(),
      exchangeType,
      itemIndex,
      newProductId: selectedProduct._id,
      newColor: selectedColor,
      newSize: selectedSize,
      newVariantId: selectedVariant?._id,
      extraPaymentMethod: needsExtraPayment ? extraPaymentMethod : undefined,
    };

    setSubmitting(true);

    try {
      if (needsOnlinePay) {
        const createRes = await apiClient.post("/exchanges", payload);
        const exchange = createRes.data?.data?.exchange;

        if (!exchange?.id) {
          throw new Error("Could not create exchange request");
        }

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
            dispatch(clearExchangeStatus());
            onClose();
            if (onExchangeSuccess) onExchangeSuccess();
          },
          onFailure: () => {
            dispatch(fetchOrderDetails(orderId));
          },
        });
      } else {
        await dispatch(exchangeOrder(payload)).unwrap();
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to submit exchange",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedFromReason = () => {
    if (!exchangeType) return false;
    if (exchangeType === "OTHER" && !customReason.trim()) return false;
    return true;
  };

  const handleBack = () => {
    if (step === "product") setStep("reason");
    else if (step === "variant") {
      setStep("product");
      setProductDetails(null);
      setSelectedProduct(null);
      dispatch(clearExchangePreview());
    } else if (step === "confirm") {
      setStep("variant");
      dispatch(clearExchangePreview());
    }
  };

  if (!isOpen) return null;

  const primaryBtn =
    "w-full py-3.5 rounded-lg font-semibold text-white bg-[#2874f0] hover:bg-[#1c5fd0] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm";

  const chipBtn = (active) =>
    `min-w-[3rem] px-4 py-2 rounded-md border text-sm font-medium transition-all ${
      active
        ? "border-[#2874f0] bg-[#e7f0ff] text-[#2874f0] ring-1 ring-[#2874f0]"
        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
    }`;

  const quickTagBtn = (active) =>
    `shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
      active
        ? "border-[#2874f0] bg-[#e7f0ff] text-[#2874f0]"
        : "border-gray-200 bg-white text-gray-600 hover:border-[#2874f0]/40"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        onClick={onClose}
        aria-label="Close exchange modal"
      />
      <div className="relative z-10 bg-white dark:bg-zinc-950 w-full h-full sm:h-[92vh] sm:max-w-md sm:rounded-t-2xl flex flex-col shadow-2xl overflow-hidden isolate">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-3">
            {step !== "reason" ? (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {meta.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">{meta.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-3 px-1">
            {STEPS.map((s, idx) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= stepIndex ? "bg-[#2874f0]" : "bg-gray-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === "reason" && (
            <div className="space-y-4">
              {items.length > 1 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Item to exchange
                  </label>
                  <select
                    value={itemIndex}
                    onChange={(e) => setItemIndex(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                  >
                    {items.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.name} — {item.color} / {item.size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedItem && (
                <div className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/80">
                  {getImageUrl(selectedItem.image) && (
                    <img
                      src={optimizeGalleryImage(getImageUrl(selectedItem.image), {
                        maxWidth: 120,
                        thumb: true,
                      })}
                      alt={selectedItem.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {selectedItem.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedItem.color} · Size {selectedItem.size}
                    </p>
                    <p className="text-sm font-semibold text-[#2874f0] mt-1">
                      {formatPrice(
                        selectedItem.pricing?.lineTotal ??
                          selectedItem.lineTotal ??
                          (selectedItem.finalPrice || selectedItem.price || 0) *
                            (selectedItem.quantity || 1)
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Reason for exchange
                </p>
                <div className="space-y-2">
                  {EXCHANGE_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        exchangeType === type.value
                          ? "border-[#2874f0] bg-[#f0f6ff]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="exchangeType"
                        value={type.value}
                        checked={exchangeType === type.value}
                        onChange={(e) => setExchangeType(e.target.value)}
                        className="accent-[#2874f0]"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {exchangeType === "OTHER" && (
                <textarea
                  placeholder="Describe the issue..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] resize-none"
                  rows="3"
                />
              )}
            </div>
          )}

          {step === "product" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    if (
                      value &&
                      activeQuickTag !== "all" &&
                      activeQuickTag !== "keyword"
                    ) {
                      setActiveQuickTag("all");
                    }
                    if (!value && activeQuickTag === "keyword") {
                      setActiveQuickTag("all");
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-zinc-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                />
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Quick picks
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {quickTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className={quickTagBtn(activeQuickTag === tag.id)}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
                {activeQuickTag === "similar" && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Same category & style as your original item
                  </p>
                )}
              </div>

              {!loadingProducts && products.length > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {products.length}
                  {totalProducts > 0 ? ` of ${totalProducts}` : ""} products
                  {hasMore ? " · scroll for more" : ""}
                </p>
              )}

              {loadingProducts && products.length === 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-gray-100 animate-pulse"
                    >
                      <div className="aspect-[3/4] bg-gray-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    {products.map((product, index) => {
                      const isLast = index === products.length - 1;
                      return (
                        <div
                          key={product._id}
                          ref={isLast ? lastProductRef : null}
                        >
                          <ProductCard
                            {...product}
                            selectable
                            hideWishlist
                            onSelect={() => loadProductDetails(product)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2874f0]" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              )}
            </div>
          )}

          {step === "variant" && productDetails && (
            <div className="space-y-5">
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/80">
                <img
                  src={getProductImageSrc(productDetails, selectedColor)}
                  alt={productDetails.name}
                  className="w-20 h-20 rounded-lg object-contain bg-white shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {productDetails.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a different variant than your original item
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        const sizes = getAvailableSizes(
                          productDetails.variants,
                          color
                        );
                        setSelectedSize(sizes[0] || "");
                      }}
                      className={chipBtn(selectedColor === color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelectedColor.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={chipBtn(selectedSize === size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizesForSelectedColor.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    No alternate sizes available. Go back and pick another product.
                  </p>
                )}
                {selectionIsSameAsOriginal && (
                  <p className="text-xs text-red-500 mt-2">
                    This matches your current item. Choose a different size.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "confirm" && (
            <>
              {exchangePreviewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#2874f0] animate-spin" />
                  <p className="text-sm text-gray-500">Calculating price...</p>
                </div>
              ) : exchangePreview ? (
                <div className="space-y-4">
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">
                        Current
                      </p>
                      {exchangePreview.originalItem.image && (
                        <img
                          src={optimizeGalleryImage(
                            exchangePreview.originalItem.image,
                            { maxWidth: 80, thumb: true }
                          )}
                          alt=""
                          className="w-14 h-14 object-contain mb-2"
                        />
                      )}
                      <p className="text-xs font-medium line-clamp-2">
                        {exchangePreview.originalItem.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {exchangePreview.originalItem.color} /{" "}
                        {exchangePreview.originalItem.size}
                      </p>
                      <p className="text-sm font-bold mt-2">
                        {formatPrice(exchangePreview.originalItem.lineTotal)}
                      </p>
                    </div>

                    <div className="flex items-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 p-3 rounded-xl border-2 border-[#2874f0]/30 bg-[#f0f6ff]">
                      <p className="text-[10px] font-semibold text-[#2874f0] uppercase mb-2">
                        New
                      </p>
                      {exchangePreview.newItem.image && (
                        <img
                          src={optimizeGalleryImage(
                            exchangePreview.newItem.image,
                            { maxWidth: 80, thumb: true }
                          )}
                          alt=""
                          className="w-14 h-14 object-contain mb-2"
                        />
                      )}
                      <p className="text-xs font-medium line-clamp-2">
                        {exchangePreview.newItem.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {exchangePreview.newItem.color} /{" "}
                        {exchangePreview.newItem.size}
                      </p>
                      <p className="text-sm font-bold mt-2">
                        {formatPrice(exchangePreview.newItem.lineTotal)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl ${
                      needsExtraPayment
                        ? "bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    {needsExtraPayment ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Extra payment required
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {formatPrice(extraAmount)}
                        </p>

                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Payment option choose karein
                        </p>
                        <div className="space-y-2">
                          {EXTRA_PAYMENT_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const selected = extraPaymentMethod === option.id;
                            const isBlue = option.accent === "blue";

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setExtraPaymentMethod(option.id)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                  selected
                                    ? isBlue
                                      ? "border-[#2874f0] bg-blue-50 dark:bg-blue-950/30"
                                      : "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-lg shrink-0 ${
                                      isBlue
                                        ? "bg-blue-100 text-[#2874f0]"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {option.title}
                                      </p>
                                      {selected && (
                                        <Check
                                          className={`w-4 h-4 shrink-0 ${
                                            isBlue ? "text-[#2874f0]" : "text-amber-600"
                                          }`}
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                      {option.desc}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                          {payOnlineSelected
                            ? "Submit par Razorpay khulega. Payment successful hone ke baad hi exchange request admin ke paas jayegi."
                            : "Submit ke baad exchange request jayegi. Naya product deliver hote waqt delivery agent ko cash dena hoga."}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          No extra payment needed
                        </p>
                        {exchangePreview.pricing.savingsAmount > 0 && (
                          <p className="text-xs text-green-700 mt-1">
                            ₹{exchangePreview.pricing.savingsAmount} cheaper —
                            no cash refund (exchange only)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-red-600 font-medium">
                    {error || "Could not calculate price"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearExchangePreview());
                      setStep("variant");
                    }}
                    className="text-sm text-[#2874f0] font-semibold"
                  >
                    Change selection
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 safe-area-pb">
          {step === "reason" && (
            <button
              onClick={() => setStep("product")}
              disabled={!canProceedFromReason()}
              className={primaryBtn}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === "variant" && (
            <button
              onClick={goToConfirm}
              disabled={
                !selectedColor ||
                !selectedSize ||
                sizesForSelectedColor.length === 0 ||
                selectionIsSameAsOriginal
              }
              className={primaryBtn}
            >
              Review price
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === "confirm" && exchangePreview && (
            <button
              onClick={handleSubmit}
              disabled={exchangeLoading || submitting}
              className={primaryBtn}
            >
              {exchangeLoading || submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {needsOnlinePay ? "Opening payment..." : "Submitting..."}
                </>
              ) : needsOnlinePay ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatPrice(extraAmount)} &amp; submit
                </>
              ) : needsExtraPayment && extraPaymentMethod === "COD" ? (
                <>
                  <Banknote className="w-4 h-4" />
                  Submit — pay {formatPrice(extraAmount)} on delivery
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Confirm exchange
                </>
              )}
            </button>
          )}

          {step === "reason" && (
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Exchange within 7 days of delivery · No returns
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeOrderModal;
