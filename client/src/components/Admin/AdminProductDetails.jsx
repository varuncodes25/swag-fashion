import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  EyeOff,
  Package,
  Eye,
  Star,
  Clock,
  Truck,
  Shield,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Import Redux actions
import { fetchProductById } from "@/redux/slices/admin/productSlice";

const AdminProductDetails = () => {
  const { productId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Redux state se data lo
  const { 
    currentProduct: product,
    loading, 
    error
  } = useSelector((state) => state.adminProduct || {});

  // ✅ Product fetch karo
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId]);

  // ✅ Jab product aaye to first color and image set karo
  useEffect(() => {
    if (product) {
      // Get first color from colors array or imagesByColor
      const colors = Object.keys(product.imagesByColor || {});
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
        const colorImages = product.imagesByColor[colors[0]];
        if (colorImages?.length > 0) {
          setSelectedImage(colorImages[0]);
        }
      } else if (product.allImages?.length > 0) {
        setSelectedImage(product.allImages[0]);
      }
    }
  }, [product]);

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
    const colorImages = product.imagesByColor[color];
    if (colorImages?.length > 0) {
      setSelectedImage(colorImages[0]);
    }
  };

  // Handle next/previous image
  const handleNextImage = () => {
    if (!selectedColor) return;
    const colorImages = product.imagesByColor[selectedColor];
    if (colorImages?.length > 0) {
      const nextIndex = (currentImageIndex + 1) % colorImages.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(colorImages[nextIndex]);
    }
  };

  const handlePrevImage = () => {
    if (!selectedColor) return;
    const colorImages = product.imagesByColor[selectedColor];
    if (colorImages?.length > 0) {
      const prevIndex = (currentImageIndex - 1 + colorImages.length) % colorImages.length;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(colorImages[prevIndex]);
    }
  };

  // Get current color images
  const getCurrentColorImages = () => {
    if (!selectedColor) return [];
    return product.imagesByColor?.[selectedColor] || [];
  };

  const formatSpecValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.length ? value.map((item) => String(item)).join(", ") : "—";
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${formatSpecValue(v)}`)
        .join(" | ");
    }
    return String(value);
  };

  const formatDisplayValue = (value) => formatSpecValue(value);

  const getCategoryName = (category) => {
    if (!category) return "—";
    if (typeof category === "object") {
      return category.name || category.slug || "—";
    }
    return String(category);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium break-words">{formatDisplayValue(value)}</p>
    </div>
  );

  const DetailGrid = ({ items }) => (
    <div className="grid grid-cols-2 gap-4">
      {items.map(({ label, value }) => (
        <DetailItem key={label} label={label} value={value} />
      ))}
    </div>
  );

  // 🔥 Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 🔥 Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Error Loading Product</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Button onClick={() => navigate("/admin/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  // 🔥 Product not found
  if (!product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/admin/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const colors = Object.keys(product.imagesByColor || {});
  const currentColorImages = getCurrentColorImages();

  return (
    <div className="space-y-6 p-6">
      {/* HEADER with Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={product.isInStock ? "success" : "destructive"}>
                {product.isInStock ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.blacklisted && (
                <Badge variant="destructive">Blacklisted</Badge>
              )}
              <Badge variant="outline">{product.status || "published"}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/dashboard/edit-product/${productId}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className={product.blacklisted ? "text-green-600" : "text-yellow-600"}>
            <EyeOff className="w-4 h-4 mr-2" />
            {product.blacklisted ? "Unblacklist" : "Blacklist"}
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Views</p>
              <p className="text-xl font-bold">{product.viewCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sold</p>
              <p className="text-xl font-bold">{product.soldCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-xl font-bold">{product.rating?.toFixed(1) || "0.0"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Wishlist</p>
              <p className="text-xl font-bold">{product.wishlistCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Images & Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Color Selector */}
          {colors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Color</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedColor === color 
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium">{color}</span>
                        <Badge variant="secondary" className="ml-2">
                          {product.imagesByColor[color]?.length || 0}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedColor ? `${selectedColor} Images` : "Product Images"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Main Image with Navigation */}
              {selectedImage && (
                <div className="relative mb-4 border rounded-lg overflow-hidden group">
                  <img
                    src={selectedImage.url}
                    alt={product.name}
                    className="w-full h-96 object-contain bg-gray-50"
                  />
                  
                  {/* Navigation Arrows */}
                  {currentColorImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {currentColorImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {currentImageIndex + 1} / {currentColorImages.length}
                    </div>
                  )}

                  {/* Main Badge */}
                  {selectedImage?.isMain && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Main Image
                    </div>
                  )}
                </div>
              )}
              
              {/* Thumbnails for selected color */}
              {currentColorImages.length > 0 && (
                <div className="grid grid-cols-6 gap-2">
                  {currentColorImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedImage(img);
                        setCurrentImageIndex(index);
                      }}
                      className={`border rounded-lg overflow-hidden ${
                        selectedImage?.id === img.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* All Images Summary */}
              {colors.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">All Colors Summary</p>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color) => (
                      <div key={color} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-600">
                          {product.imagesByColor[color]?.length || 0} images
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailGrid
                items={[
                  { label: "Brand", value: product.brand },
                  { label: "Category", value: getCategoryName(product.category) },
                  { label: "Sub Category", value: product.subCategory },
                  { label: "Clothing Type", value: product.clothingType },
                  { label: "Product Family", value: product.productFamily },
                  { label: "Gender", value: product.gender },
                  { label: "Age Group", value: product.ageGroup },
                  { label: "Slug", value: product.slug },
                ]}
              />

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-2">Short Description</p>
                <p className="text-sm">{formatDisplayValue(product.shortDescription)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-sm whitespace-pre-wrap">
                  {formatDisplayValue(product.fullDescription || product.description)}
                </p>
              </div>

              {product.keyFeatures?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Key Features</p>
                  <ul className="list-disc list-inside space-y-1">
                    {product.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="text-sm">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fabric & Garment */}
          <Card>
            <CardHeader>
              <CardTitle>Fabric & Garment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailGrid
                items={[
                  { label: "Fabric", value: product.fabric },
                  { label: "Fabric Composition", value: product.fabricComposition },
                  { label: "Fit", value: product.fit },
                  { label: "Pattern", value: product.pattern },
                  { label: "Wash Type", value: product.washType },
                  { label: "Sleeve Type", value: product.sleeveType },
                  { label: "Neck Type", value: product.neckType },
                  { label: "Bottom Style", value: product.bottomStyle },
                  { label: "Waist Type", value: product.waistType },
                  { label: "Bottom Length", value: product.bottomLength },
                  { label: "Pocket Style", value: product.pocketStyle },
                  { label: "Hem Style", value: product.hemStyle },
                  { label: "Bottom Closure", value: product.bottomClosure },
                ]}
              />

              {product.careInstructions?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Care Instructions</p>
                    <ul className="list-disc list-inside space-y-1">
                      {product.careInstructions.map((item, idx) => (
                        <li key={idx} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Season & Features */}
          <Card>
            <CardHeader>
              <CardTitle>Season, Occasion & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailGrid
                items={[
                  { label: "Season", value: product.season },
                  { label: "Occasion", value: product.occasion },
                  { label: "Package Content", value: product.packageContent },
                  { label: "Country of Origin", value: product.countryOfOrigin },
                ]}
              />

              {product.features?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Features</p>
                  <ul className="list-disc list-inside space-y-1">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="text-sm">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.productDimensions && (
                <>
                  <Separator />
                  <DetailGrid
                    items={[
                      { label: "Length", value: product.productDimensions.length != null ? `${product.productDimensions.length} cm` : null },
                      { label: "Width", value: product.productDimensions.width != null ? `${product.productDimensions.width} cm` : null },
                      { label: "Height", value: product.productDimensions.height != null ? `${product.productDimensions.height} cm` : null },
                      { label: "Weight", value: product.productDimensions.weight != null ? `${product.productDimensions.weight} kg` : null },
                    ]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (unchanged) */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">MRP</span>
                  <span className="font-semibold">₹{product.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Selling Price</span>
                  <span className="font-bold text-green-600">₹{product.sellingPrice?.toFixed(2)}</span>
                </div>
                {product.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <Badge variant="secondary">{product.discount}% OFF</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Available Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <Badge key={color} variant="outline" className="px-3 py-1">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span>{color}</span>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Available Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="outline" className="px-3 py-1">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Variants */}
                {product.variants?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Stock Details</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {product.variants.map((variant) => (
                          <div key={variant._id} className="text-sm border rounded p-2">
                            <div className="flex justify-between">
                              <span>
                                {variant.color} - {variant.size}
                              </span>
                              <Badge variant={variant.stock > 0 ? "success" : "destructive"}>
                                {variant.stock} in stock
                              </Badge>
                            </div>
                            {variant.sku && (
                              <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Offer Details */}
          {(product.isOfferActive ||
            product.offerTitle ||
            product.offerDescription ||
            product.offerValidFrom ||
            product.offerValidTill) && (
            <Card className={product.isOfferActive ? "border-green-200 bg-green-50" : ""}>
              <CardHeader>
                <CardTitle className={product.isOfferActive ? "text-green-700" : ""}>
                  {product.isOfferActive ? "Active Offer" : "Offer Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{formatDisplayValue(product.offerTitle)}</p>
                <p className="text-gray-600">{formatDisplayValue(product.offerDescription)}</p>
                {product.offerCode && (
                  <p><span className="text-gray-500">Offer Code:</span> {product.offerCode}</p>
                )}
                <p>Valid from: {formatDate(product.offerValidFrom)}</p>
                <p>Valid till: {formatDate(product.offerValidTill)}</p>
                {product.isOfferActive && product.offerDaysLeft != null && (
                  <p className="text-green-600">{product.offerDaysLeft} days left</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Product Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.isFeatured && <Badge>Featured</Badge>}
                {product.isNewArrival && <Badge>New Arrival</Badge>}
                {product.isBestSeller && <Badge>Best Seller</Badge>}
                {product.isPremium && <Badge>Premium</Badge>}
                {product.isTrending && <Badge>Trending</Badge>}
                {product.freeShipping && <Badge>Free Shipping</Badge>}
                {!product.isFeatured && !product.isNewArrival && !product.isBestSeller &&
                 !product.isPremium && !product.isTrending && !product.freeShipping && (
                  <span className="text-sm text-gray-500">No flags set</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping, Returns & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span>Free Shipping: {product.freeShipping ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span>Handling Time: {formatDisplayValue(product.handlingTime != null ? `${product.handlingTime} day(s)` : null)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span>Estimated Delivery: {formatDisplayValue(product.estimatedDelivery != null ? `${product.estimatedDelivery} day(s)` : null)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Warranty: {formatDisplayValue(product.warranty)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Return Policy: {formatDisplayValue(product.returnPolicy)}</span>
              </div>
              {product.returnWindow != null && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Return Window: {product.returnWindow} day(s)</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span>Visible on Store: {product.isVisible !== false ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Total Stock: {formatDisplayValue(product.totalStock)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Available Stock: {formatDisplayValue(product.availableStock)}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Created: {formatDate(product.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Updated: {formatDate(product.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          {(product.metaTitle ||
            product.metaDescription ||
            product.keywords?.length ||
            product.tags?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {product.metaTitle && (
                  <div>
                    <p className="text-gray-500">Meta Title</p>
                    <p className="font-medium">{product.metaTitle}</p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <p className="text-gray-500">Meta Description</p>
                    <p>{product.metaDescription}</p>
                  </div>
                )}
                {product.keywords?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {product.keywords.map((kw) => (
                        <Badge key={kw} variant="outline">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.tags?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Custom specifications only (standard fields shown above) */}
      {product.specifications?.["Additional Specifications"] &&
        Object.keys(product.specifications["Additional Specifications"]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(product.specifications["Additional Specifications"]).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3">
                  <h3 className="font-medium text-sm mb-2">{key}</h3>
                  <p className="text-sm">{formatSpecValue(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProductDetails;