import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, setAddress } from "@/redux/slices/checkoutSlice";
import AddressForm from "@/components/checkout/AddressForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  MapPin,
  Home,
  Building,
  Phone,
  Edit2,
  Plus,
  X,
  ChevronRight,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom hook for checking screen size
const useMediaQuery = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isDesktop;
};

const AddressSection = () => {
  const dispatch = useDispatch();
  const { addresses, addressId } = useSelector((s) => s.checkout);
  
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(); // Using our custom hook
  
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [expandedAddressId, setExpandedAddressId] = useState(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAddAddress = () => {
    setEditAddress(null);
    if (isDesktop) {
      // Desktop: Open modal
      setShowForm(true);
    } else {
      // Mobile: Navigate to separate page or open full-screen modal
      // Option 1: Navigate to separate page
      // navigate("/checkout/address/new");
      
      // Option 2: Open full-screen modal (simpler)
      setIsMobileFormOpen(true);
    }
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home size={18} className="text-primary dark:text-primary" />;
      case "office":
        return (
          <Building
            size={18}
            className="text-primary dark:text-purple-400"
          />
        );
      default:
        return (
          <MapPin size={18} className="text-muted-foreground" />
        );
    }
  };

  const toggleAddressExpand = (addressId, e) => {
    e.stopPropagation();
    setExpandedAddressId(expandedAddressId === addressId ? null : addressId);
  };

  const handleEditAddress = (addr) => {
    setEditAddress(addr);
    if (isDesktop) {
      setShowForm(true);
    } else {
      setIsMobileFormOpen(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsMobileFormOpen(false);
    setEditAddress(null);
  };

  return (
    <>
      <Card className="space-y-3 rounded-xl border bg-card p-3 shadow-sm md:space-y-6 md:rounded-2xl md:bg-gradient-to-br md:from-gray-100 md:to-gray-200 md:p-6 md:shadow-lg dark:md:from-gray-900 dark:md:to-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5 md:p-2">
              <MapPin className="h-4 w-4 text-primary md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground md:text-xl">
                Delivery Address
              </h2>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Select or add a delivery address
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="btn-premium h-8 shrink-0 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
            onClick={handleAddAddress}
          >
            <Plus size={14} className="md:mr-2" />
            <span className="hidden sm:inline">Add New</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Address list */}
        <div className="space-y-2 md:space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border px-3 py-5 text-center md:py-8">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground md:mb-3 md:h-12 md:w-12" />
              <h3 className="text-sm font-medium text-foreground md:text-lg">
                No Address Found
              </h3>
              <p className="mb-3 mt-1 text-xs text-muted-foreground md:mb-4 md:text-sm">
                Add an address to deliver your order
              </p>
              <Button
                onClick={handleAddAddress}
                className="btn-premium h-9 text-xs md:text-sm"
              >
                <Plus size={14} className="mr-1" />
                Add Address
              </Button>
            </div>
          ) : (
            addresses.map((addr) => {
              const selected = addressId === addr._id;
              const isExpanded = expandedAddressId === addr._id;

              return (
                <div
                  key={addr._id}
                  className={`cursor-pointer rounded-xl border-2 p-2.5 transition-all md:p-5 ${
                    selected
                      ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                  onClick={() => dispatch(setAddress(addr._id))}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 gap-2 md:gap-4">
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 md:h-5 md:w-5 ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white md:h-2 md:w-2" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5 md:space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="hidden rounded-lg bg-primary/10 p-1.5 md:block">
                              {getAddressIcon(addr.address_type)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-foreground md:text-lg">
                                {addr.name}
                              </h3>
                              <span className="mt-0.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:text-xs">
                                {addr.address_type || "Other"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleAddressExpand(addr._id, e)}
                            className="shrink-0 rounded-md p-1 hover:bg-muted md:hidden"
                          >
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          {selected && (
                            <span className="hidden items-center gap-1 text-xs font-medium text-green-600 md:inline-flex">
                              <CheckCircle size={14} />
                              Selected
                            </span>
                          )}
                        </div>

                        {selected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 md:hidden">
                            <CheckCircle size={12} />
                            Selected
                          </span>
                        )}

                        <div>
                          <p className="line-clamp-2 text-xs font-medium text-foreground md:text-base">
                            {addr.address_line1}
                          </p>
                          <p className="text-[11px] text-muted-foreground md:text-sm">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>

                        {(isExpanded || isDesktop) && (
                          <div className="space-y-2 border-t border-border/60 pt-2 text-xs md:space-y-3 md:pt-4 md:text-sm">
                            {addr.address_line2 && (
                              <p className="text-muted-foreground">
                                {addr.address_line2}
                              </p>
                            )}
                            <p className="text-muted-foreground">{addr.country}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
                                <Phone className="h-3.5 w-3.5" />
                                {addr.phone}
                              </span>
                              {addr.email && (
                                <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md bg-muted/60 px-2 py-1">
                                  <Mail className="h-3.5 w-3.5 shrink-0" />
                                  {addr.email}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="hidden shrink-0 md:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 md:hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                    >
                      <Edit2 size={12} className="mr-1" />
                      Edit
                    </Button>
                    {isExpanded && (
                      <button
                        type="button"
                        onClick={(e) => toggleAddressExpand(addr._id, e)}
                        className="text-xs font-medium text-primary"
                      >
                        Less
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Desktop Modal Form */}
      {showForm && isDesktop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60">
          <div className="w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden">
            {/* Desktop Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-b border-primary/20 dark:border-primary/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-primary to-primary/90 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {editAddress ? "Edit Address" : "Add New Address"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Please fill in all required fields marked with *
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <AddressForm
                editAddress={editAddress}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full Screen Form */}
      {isMobileFormOpen && !isDesktop && (
        <div className="fixed inset-0 z-50 bg-card overflow-y-auto">
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
            <button
              onClick={handleCloseForm}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 dark:bg-primary/20 rounded">
                <MapPin className="w-5 h-5 text-primary dark:text-primary" />
              </div>
              <h3 className="font-bold text-foreground">
                {editAddress ? "Edit Address" : "Add Address"}
              </h3>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="p-4">
            <AddressForm
              editAddress={editAddress}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddressSection;