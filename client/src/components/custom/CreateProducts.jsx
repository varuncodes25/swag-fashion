import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Loader2, Upload, X, Star, Plus, Minus, Check } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductForm } from "@/hooks/useProductForm";
import {
  createProduct,
  updateProduct,
} from "@/redux/slices/admin/productSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import SizeChartForm from "../Admin/SizeChartForm";
import { Ruler } from "lucide-react";

const CreateProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const {
    currentProduct,
    loading: productLoading,
    getProduct,
    clearProduct,
  } = useProducts();
  const { categories, getCategories } = useCategories();
  // Simple version - Sirf Top aur Bottom identify karna hai toh
  const getClothingCategory = (clothingType) => {
    const topWear = [
      "T-Shirt",
      "Polo Shirt",
      "Shirt",
      "Formal Shirt",
      "Casual Shirt",
      "Tank Top",
      "Crop Top",
      "Blouse",
      "Tunic",
      "Top",
      "Camisole",
      "Sweater",
      "Cardigan",
      "Pullover",
      "Hoodie",
      "Sweatshirt",
      "Jacket",
      "Blazer",
      "Coat",
      "Raincoat",
      "Windcheater",
      "Bomber Jacket",
      "Denim Jacket",
      "Shrug",
      "Waistcoat",
      "Gilet",
      "Vest",
      "Kurta",
      "Nehru Jacket",
    ];

    const bottomWear = [
      "Jeans",
      "Trousers",
      "Chinos",
      "Cargo Pants",
      "Joggers",
      "Track Pants",
      "Leggings",
      "Palazzo",
      "Skirt",
      "Shorts",
      "Dhoti",
      "Lungi",
    ];

    if (topWear.includes(clothingType)) return "top";
    if (bottomWear.includes(clothingType)) return "bottom";
    return "other";
  };
  const {
    formData,
    updateFormData,
    colors,
    sizes,
    colorStocks,
    variantImages,
    selectedSize,
    currentColor,
    isLoading: formLoading,
    setIsLoading,
    fileInputRefs,
    tempSpecKey,
    tempSpecValue,
    setTempSpecKey,
    setTempSpecValue,
    sizeCharts, // Size charts data
    updateSizeChart, // Update size chart function
    getSizeChartForColor, // Get charts for color
    getSizeChartForVariant, // Get chart for specific variant
    resetSizeCharts, // Reset all charts
    // Constants
    SIZE_OPTIONS,
    COLOR_OPTIONS,
    CLOTHING_TYPES,
    PRODUCT_FAMILIES,
    AGE_GROUPS,
    GENDERS,
    FABRICS,
    FITS,
    PATTERNS,
    SIZE_CHART_TEMPLATES,
    SLEEVE_TYPES,
    NECK_TYPES,
    BOTTOM_STYLES,
    WAIST_TYPES,
    BOTTOM_LENGTHS,
    POCKET_STYLES,
    HEM_STYLES,
    BOTTOM_CLOSURES,
    ALL_FEATURES,
    SEASONS,
    OCCASIONS,
    MAX_IMAGES_PER_COLOR,
    stockMatrix, // ✅ Changed from colorStocks
    updateStock, // ✅ Changed from updateColorStock
    getTotalStockForColor, // ✅ New helper function
    // Handlers
    addSize,
    removeSize,
    setSelectedSize,
    addColor,
    removeColor,
    setCurrentColor,
    updateColorStock,
    handleImageUpload,
    removeImage,
    setMainImage,
    prepareFormData,
    resetForm,
    validateForm,
    initializeForm,
    handleDescriptionChange,
    addKeyFeature,
    removeKeyFeature,
    addSpecification,
    removeSpecification,
    toggleCareInstruction,
    toggleFeature,
    toggleSeason,
    toggleOccasion,
    applySizeChartTemplate,
  } = useProductForm();

  const [customSizeInput, setCustomSizeInput] = useState("");
  const [selectedSizeChartTemplate, setSelectedSizeChartTemplate] = useState("oversizedTshirt");
const clothingCategory = getClothingCategory(formData.clothingType);
console.log(clothingCategory,"clothingCategory")
  // React Quill modules
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  // Load categories
  useEffect(() => {
    getCategories();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      getProduct(productId);
    } else {
      resetForm();
    }
  }, [productId]);

  // Initialize form with product data
  useEffect(() => {
    if (currentProduct && productId) {
      initializeForm(currentProduct);
    }
  }, [currentProduct, productId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataObj = prepareFormData();

      let response;
      if (productId) {
        response = await dispatch(
          updateProduct({ id: productId, data: formDataObj }),
        ).unwrap();
      } else {
        response = await dispatch(createProduct(formDataObj)).unwrap();
      }

      toast({
        title: "Success",
        description: response.message || "Product saved successfully",
      });

      if (!productId) {
        resetForm();
      }

      navigate("/admin/dashboard/all-products");
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        error?.toString() ||
        "Failed to save product";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CardHeader>
        <CardTitle className="text-2xl">
          {productId ? "Edit Product" : "Add New Product"}
        </CardTitle>
        <CardDescription>
          {productId
            ? "Update the product details"
            : "Enter the details for the new product"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="variants">Variants & Images</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="offers">Offers & Details</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardContent className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">
                    Short Description (Max 200 chars)
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        updateFormData("shortDescription", e.target.value)
                      }
                      rows={2}
                      placeholder="Brief description for product cards"
                      maxLength={200}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addKeyFeature}
                      variant="outline"
                      className="mt-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Key Features List */}
                  {formData.keyFeatures.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <Label className="text-sm">Key Features:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.keyFeatures.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {feature}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeKeyFeature(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Base Price */}
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (₹) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) =>
                      updateFormData("basePrice", e.target.value)
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clothing Type */}
                <div className="space-y-2">
                  <Label htmlFor="clothingType">Clothing Type *</Label>
                  <Select
                    value={formData.clothingType}
                    onValueChange={(value) =>
                      updateFormData("clothingType", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product family (optional, filters / admin) */}
                <div className="space-y-2">
                  <Label htmlFor="productFamily">Product family</Label>
                  <Select
                    value={formData.productFamily || "none"}
                    onValueChange={(value) =>
                      updateFormData(
                        "productFamily",
                        value === "none" ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional — e.g. Footwear, Ethnic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {PRODUCT_FAMILIES.map((fam) => (
                        <SelectItem key={fam} value={fam}>
                          {fam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateFormData("gender", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              <CardContent className="space-y-6">
                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => updateFormData("brand", e.target.value)}
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                {/* Age Group */}
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group *</Label>
                  <Select
                    value={formData.ageGroup}
                    onValueChange={(value) => updateFormData("ageGroup", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map((ag) => (
                        <SelectItem key={ag} value={ag}>
                          {ag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric */}
                <div className="space-y-2">
                  <Label htmlFor="fabric">Fabric *</Label>
                  <Select
                    value={formData.fabric}
                    onValueChange={(value) => updateFormData("fabric", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      {FABRICS.map((fabric) => (
                        <SelectItem key={fabric} value={fabric}>
                          {fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric Composition */}
                <div className="space-y-2">
                  <Label htmlFor="fabricComposition">Fabric Composition</Label>
                  <Input
                    id="fabricComposition"
                    value={formData.fabricComposition}
                    onChange={(e) =>
                      updateFormData("fabricComposition", e.target.value)
                    }
                    placeholder="e.g., 100% Cotton"
                  />
                </div>

                {/* Fit */}
                <div className="space-y-2">
                  <Label htmlFor="fit">Fit</Label>
                  <Select
                    value={formData.fit}
                    onValueChange={(value) => updateFormData("fit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      {FITS.map((fit) => (
                        <SelectItem key={fit} value={fit}>
                          {fit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pattern */}
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <Select
                    value={formData.pattern}
                    onValueChange={(value) => updateFormData("pattern", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERNS.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </div>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6">
            <CardContent>
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Product Description *
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Use the rich text editor to create a detailed product
                  description with formatting, images, and links.
                </p>

                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  placeholder="Write detailed product description here..."
                  className="h-64 mb-12"
                />

                <div className="mt-8 pt-4 border-t">
                  <Label className="text-sm font-medium text-gray-700">
                    Preview:
                  </Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          formData.description || "<p>No description yet</p>",
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          {/* Variants & Images Tab */}
          <TabsContent value="variants" className="space-y-6">
            <CardContent className="space-y-8">
              {/* Sizes Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">
                  Sizes *
                </Label>
                <div className="flex items-center space-x-2">
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-[120px] bg-background border-input">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem
                          key={size}
                          value={size}
                          className="text-foreground hover:bg-accent"
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSize()}
                    className="border-input hover:bg-accent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                  <Input
                    className="max-w-[200px]"
                    placeholder="Custom size (e.g. UK 9, 32x34)"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSize(customSizeInput);
                        setCustomSizeInput("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      addSize(customSizeInput);
                      setCustomSizeInput("");
                    }}
                  >
                    Add custom
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <div
                      key={size}
                      className="flex items-center bg-muted rounded-full px-3 py-2 border border-border"
                    >
                      <span className="text-sm font-medium mr-2 text-foreground">
                        {size}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full hover:bg-destructive/20 text-foreground"
                        onClick={() => removeSize(size)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Colors Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">
                  Colors *
                </Label>
                <div className="flex gap-2">
                  <select
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="border border-input rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="" className="bg-background text-foreground">
                      Select color
                    </option>
                    {COLOR_OPTIONS.map((color) => (
                      <option
                        key={color.code}
                        value={color.code}
                        className="bg-background text-foreground"
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={addColor}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color
                  </Button>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Size Chart Template
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Apply a default measurement chart, then edit any size manually below.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Select
                      value={selectedSizeChartTemplate}
                      onValueChange={setSelectedSizeChartTemplate}
                    >
                      <SelectTrigger className="bg-background border-input text-foreground sm:max-w-xs">
                        <SelectValue placeholder="Select size chart template" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {Object.entries(SIZE_CHART_TEMPLATES).map(
                          ([templateKey, template]) => (
                            <SelectItem
                              key={templateKey}
                              value={templateKey}
                              className="text-foreground hover:bg-accent"
                            >
                              {template.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => applySizeChartTemplate(selectedSizeChartTemplate)}
                      disabled={!colors.length || !sizes.length}
                      className="border-input hover:bg-accent"
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      Apply Template
                    </Button>
                  </div>
                </div>

                {/* Color List with Images and Size Charts */}
                {colors.map((colorName) => {
                  const colorObj = COLOR_OPTIONS.find(
                    (c) => c.name === colorName,
                  );
                  const colorCode = colorObj?.code || "#000000";
                  const imageCount = variantImages[colorName]?.length || 0;

                  return (
                    <div
                      key={colorName}
                      className="border border-border rounded-lg p-4 space-y-3 bg-card"
                    >
                      {/* Color Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                            style={{ backgroundColor: colorCode }}
                            title={colorName}
                          />
                          <div>
                            <span className="font-medium text-foreground">
                              {colorName}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              {imageCount} / {MAX_IMAGES_PER_COLOR} images
                              {getTotalStockForColor && (
                                <span className="ml-2">
                                  • Total Stock:{" "}
                                  {getTotalStockForColor(colorName)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stock Matrix */}
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-1">
                            <Label className="text-sm whitespace-nowrap text-muted-foreground">
                              Stock by Size:
                            </Label>
                            <div className="flex space-x-2">
                              {sizes.map((size) => (
                                <div key={size} className="text-center">
                                  <div className="text-xs text-muted-foreground">
                                    {size}
                                  </div>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={stockMatrix[colorName]?.[size] || ""}
                                    onChange={(e) =>
                                      updateStock(
                                        colorName,
                                        size,
                                        e.target.value,
                                      )
                                    }
                                    className="w-12 h-8 text-sm bg-background border-input text-foreground placeholder:text-muted-foreground"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeColor(colorName)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Images Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        {variantImages[colorName]?.map((imgObj, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 group"
                            style={{
                              borderColor: imgObj.isMain
                                ? "hsl(var(--primary))"
                                : "hsl(var(--border))",
                            }}
                          >
                            <img
                              src={imgObj.preview}
                              alt={`${colorName} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setMainImage(colorName, index)}
                                  className={`h-8 w-8 p-0 ${imgObj.isMain ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/80"}`}
                                >
                                  <Star
                                    className={`h-4 w-4 ${imgObj.isMain ? "fill-current" : ""}`}
                                  />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeImage(colorName, index)}
                                  className="h-8 w-8 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {imgObj.isMain && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Upload Button */}
                      <Button
                        type="button"
                        variant="outline"
                        disabled={imageCount >= MAX_IMAGES_PER_COLOR}
                        onClick={() =>
                          fileInputRefs.current[colorName]?.click()
                        }
                        className="w-full border-input hover:bg-accent text-foreground"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {imageCount >= MAX_IMAGES_PER_COLOR
                          ? "Maximum Images Reached"
                          : "Upload Images"}
                      </Button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={(el) => (fileInputRefs.current[colorName] = el)}
                        onChange={handleImageUpload(colorName)}
                      />

                      {/* ============ SIZE CHART SECTION ============ */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            Size Measurements for {colorName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs border-border text-muted-foreground"
                          >
                            {
                              sizes.filter(
                                (size) =>
                                  sizeCharts[colorName]?.[size] &&
                                  Object.keys(sizeCharts[colorName][size])
                                    .length > 2,
                              ).length
                            }{" "}
                            / {sizes.length} sizes configured
                          </Badge>
                        </div>

                        {/* Size Chart Forms for each size */}
                        <div className="space-y-2">
                          {sizes.map((size) => (
                            <SizeChartForm
                              key={`${colorName}-${size}`}
                              color={colorName}
                              size={size}
                              sizeData={sizeCharts[colorName]?.[size]}
                              onUpdate={updateSizeChart}
                            />
                          ))}
                        </div>

                        {/* Message if no sizes added */}
                        {sizes.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4 border border-border rounded bg-muted/50">
                            Please add sizes first to configure size charts
                          </p>
                        )}
                      </div>
                      {/* ============ END SIZE CHART SECTION ============ */}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </TabsContent>

          {/* Specifications Tab */}
          {/* Specifications Tab - REPLACE COMPLETELY */}
<TabsContent value="specifications" className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    {/* ========== LEFT COLUMN - Dynamic Fields ========== */}
    <CardContent className="space-y-6">
      
      {/* Fabric Composition */}
      <div className="space-y-2">
        <Label htmlFor="fabricComposition">Fabric Composition</Label>
        <Input
          id="fabricComposition"
          value={formData.fabricComposition}
          onChange={(e) => updateFormData("fabricComposition", e.target.value)}
          placeholder="e.g., 100% Cotton"
        />
      </div>

      {/* ===== TOP WEAR FIELDS (Sirf Top Wear ke liye) ===== */}
      {clothingCategory === "top" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sleeveType">Sleeve Type</Label>
            <Select
              value={formData.sleeveType}
              onValueChange={(value) => updateFormData("sleeveType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sleeve type" />
              </SelectTrigger>
              <SelectContent>
                {SLEEVE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neckType">Neck Type</Label>
            <Select
              value={formData.neckType}
              onValueChange={(value) => updateFormData("neckType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select neck type" />
              </SelectTrigger>
              <SelectContent>
                {NECK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* ===== BOTTOM WEAR FIELDS (Sirf Bottom Wear ke liye) ===== */}
      {clothingCategory === "bottom" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="bottomStyle">Bottom Style</Label>
            <Select
              value={formData.bottomStyle}
              onValueChange={(value) => updateFormData("bottomStyle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {BOTTOM_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waistType">Waist Type</Label>
            <Select
              value={formData.waistType}
              onValueChange={(value) => updateFormData("waistType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select waist type" />
              </SelectTrigger>
              <SelectContent>
                {WAIST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottomLength">Bottom Length</Label>
            <Select
              value={formData.bottomLength}
              onValueChange={(value) => updateFormData("bottomLength", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {BOTTOM_LENGTHS.map((length) => (
                  <SelectItem key={length} value={length}>{length}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pocketStyle">Pocket Style</Label>
            <Select
              value={formData.pocketStyle}
              onValueChange={(value) => updateFormData("pocketStyle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pocket style" />
              </SelectTrigger>
              <SelectContent>
                {POCKET_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hemStyle">Hem Style</Label>
            <Select
              value={formData.hemStyle}
              onValueChange={(value) => updateFormData("hemStyle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hem style" />
              </SelectTrigger>
              <SelectContent>
                {HEM_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottomClosure">Bottom Closure</Label>
            <Select
              value={formData.bottomClosure}
              onValueChange={(value) => updateFormData("bottomClosure", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select closure" />
              </SelectTrigger>
              <SelectContent>
                {BOTTOM_CLOSURES.map((closure) => (
                  <SelectItem key={closure} value={closure}>{closure}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* ===== COMMON FIELDS ===== */}
      <div className="space-y-2">
        <Label htmlFor="fit">Fit</Label>
        <Select
          value={formData.fit}
          onValueChange={(value) => updateFormData("fit", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select fit" />
          </SelectTrigger>
          <SelectContent>
            {FITS.map((fit) => (
              <SelectItem key={fit} value={fit}>{fit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern">Pattern</Label>
        <Select
          value={formData.pattern}
          onValueChange={(value) => updateFormData("pattern", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pattern" />
          </SelectTrigger>
          <SelectContent>
            {PATTERNS.map((pattern) => (
              <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Care Instructions */}
      <div className="space-y-2">
        <Label>Care Instructions</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Machine Wash", "Hand Wash", "Dry Clean Only", "Do Not Bleach",
            "Tumble Dry Low", "Line Dry", "Iron Low Heat", "Do Not Iron", "Dry Flat"
          ].map((instruction) => (
            <div key={instruction} className="flex items-center space-x-2">
              <Checkbox
                id={`care-${instruction}`}
                checked={formData.careInstructions.includes(instruction)}
                onCheckedChange={() => toggleCareInstruction(instruction)}
              />
              <Label htmlFor={`care-${instruction}`} className="text-sm cursor-pointer">
                {instruction}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Product Features</Label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={formData.features.includes(feature)}
                onCheckedChange={() => toggleFeature(feature)}
              />
              <Label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer">
                {feature}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="space-y-2">
        <Label>Season</Label>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((season) => (
            <Button
              key={season}
              type="button"
              variant={formData.season.includes(season) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSeason(season)}
              className="text-xs"
            >
              {formData.season.includes(season) && <Check className="h-3 w-3 mr-1" />}
              {season}
            </Button>
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div className="space-y-2">
        <Label>Occasion</Label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occasion) => (
            <Button
              key={occasion}
              type="button"
              variant={formData.occasion.includes(occasion) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleOccasion(occasion)}
              className="text-xs"
            >
              {formData.occasion.includes(occasion) && <Check className="h-3 w-3 mr-1" />}
              {occasion}
            </Button>
          ))}
        </div>
      </div>

    </CardContent>

    {/* ========== RIGHT COLUMN ========== */}
    <CardContent className="space-y-6">
      
      {/* Custom Specifications */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Custom Specifications</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Specification name"
              value={tempSpecKey}
              onChange={(e) => setTempSpecKey(e.target.value)}
            />
            <Input
              placeholder="Specification value"
              value={tempSpecValue}
              onChange={(e) => setTempSpecValue(e.target.value)}
            />
          </div>
          <Button type="button" onClick={addSpecification} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Specification
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Added Specifications:</Label>
          {formData.specifications.size === 0 ? (
            <p className="text-sm text-gray-500">No specifications added yet</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {Array.from(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <span className="font-medium text-sm block mb-1">{key}:</span>
                    <div className="ml-2 text-gray-700">
                      {typeof value === "object" && value !== null ? (
                        Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {String(item)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey} className="text-sm">
                                <span className="font-medium text-gray-600">{subKey}:</span>{" "}
                                {String(subValue)}
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <span className="text-sm">{String(value)}</span>
                      )}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(key)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Package Details</Label>
        
        <div className="space-y-2">
          <Label htmlFor="packageContent">Package Content</Label>
          <Input
            id="packageContent"
            value={formData.packageContent}
            onChange={(e) => updateFormData("packageContent", e.target.value)}
            placeholder="e.g., 1 Piece"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
          <Input
            id="countryOfOrigin"
            value={formData.countryOfOrigin}
            onChange={(e) => updateFormData("countryOfOrigin", e.target.value)}
            placeholder="e.g., India"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="warranty">Warranty</Label>
          <Input
            id="warranty"
            value={formData.warranty}
            onChange={(e) => updateFormData("warranty", e.target.value)}
            placeholder="e.g., 1 Year Warranty"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="returnPolicy">Return Policy</Label>
          <Input
            id="returnPolicy"
            value={formData.returnPolicy}
            onChange={(e) => updateFormData("returnPolicy", e.target.value)}
            placeholder="e.g., 7 Days Return Available"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="returnWindow">Return Window (Days)</Label>
          <Input
            id="returnWindow"
            type="number"
            min="0"
            value={formData.returnWindow}
            onChange={(e) => updateFormData("returnWindow", e.target.value)}
          />
        </div>
      </div>
      
    </CardContent>
  </div>
</TabsContent>

          {/* Offers & Details Tab */}
          <TabsContent value="offers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardContent className="space-y-6">
                {/* Discount */}
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => updateFormData("discount", e.target.value)}
                    placeholder="Enter discount percentage"
                  />
                </div>

                {/* Offer Title */}
                <div className="space-y-2">
                  <Label htmlFor="offerTitle">Offer Title</Label>
                  <Input
                    id="offerTitle"
                    value={formData.offerTitle}
                    onChange={(e) =>
                      updateFormData("offerTitle", e.target.value)
                    }
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                {/* Offer Description */}
                <div className="space-y-2">
                  <Label htmlFor="offerDescription">Offer Description</Label>
                  <Textarea
                    id="offerDescription"
                    value={formData.offerDescription}
                    onChange={(e) =>
                      updateFormData("offerDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Describe the offer details"
                  />
                </div>

                {/* Offer Validity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offerValidFrom">Valid From</Label>
                    <Input
                      id="offerValidFrom"
                      type="date"
                      value={formData.offerValidFrom}
                      onChange={(e) =>
                        updateFormData("offerValidFrom", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerValidTill">Valid Till</Label>
                    <Input
                      id="offerValidTill"
                      type="date"
                      value={formData.offerValidTill}
                      onChange={(e) =>
                        updateFormData("offerValidTill", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-3">
                  <Label>Product Flags</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          updateFormData("isFeatured", checked)
                        }
                      />
                      <Label htmlFor="isFeatured" className="cursor-pointer">
                        Featured Product
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isNewArrival"
                        checked={formData.isNewArrival}
                        onCheckedChange={(checked) =>
                          updateFormData("isNewArrival", checked)
                        }
                      />
                      <Label htmlFor="isNewArrival" className="cursor-pointer">
                        New Arrival
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isBestSeller"
                        checked={formData.isBestSeller}
                        onCheckedChange={(checked) =>
                          updateFormData("isBestSeller", checked)
                        }
                      />
                      <Label htmlFor="isBestSeller" className="cursor-pointer">
                        Best Seller
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardContent className="space-y-6">
                {/* Free Shipping */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={formData.freeShipping}
                    onCheckedChange={(checked) =>
                      updateFormData("freeShipping", checked)
                    }
                  />
                  <Label htmlFor="freeShipping" className="cursor-pointer">
                    Free Shipping
                  </Label>
                </div>

                {/* Package Dimensions */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Package Dimensions
                  </Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dimensionsLength">Length (cm)</Label>
                      <Input
                        id="dimensionsLength"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.productDimensions?.length || ""}
                        onChange={(e) =>
                          updateFormData("productDimensions", {
                            ...formData.productDimensions,
                            length: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensionsWidth">Width (cm)</Label>
                      <Input
                        id="dimensionsWidth"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.productDimensions?.width || ""}
                        onChange={(e) =>
                          updateFormData("productDimensions", {
                            ...formData.productDimensions,
                            width: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensionsHeight">Height (cm)</Label>
                      <Input
                        id="dimensionsHeight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.productDimensions?.height || ""}
                        onChange={(e) =>
                          updateFormData("productDimensions", {
                            ...formData.productDimensions,
                            height: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensionsWeight">Weight (kg)</Label>
                      <Input
                        id="dimensionsWeight"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.productDimensions?.weight || ""}
                        onChange={(e) =>
                          updateFormData("productDimensions", {
                            ...formData.productDimensions,
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Shipping Information
                  </Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="handlingTime">Handling Time (Days)</Label>
                      <Input
                        id="handlingTime"
                        type="number"
                        min="0"
                        value={formData.handlingTime || 1}
                        onChange={(e) =>
                          updateFormData(
                            "handlingTime",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDelivery">
                        Estimated Delivery (Days)
                      </Label>
                      <Input
                        id="estimatedDelivery"
                        type="number"
                        min="0"
                        value={formData.estimatedDelivery || 7}
                        onChange={(e) =>
                          updateFormData(
                            "estimatedDelivery",
                            parseInt(e.target.value) || 7,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <CardFooter className="mt-8 flex gap-4">
          <Button type="submit" className="flex-1" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={formLoading}
          >
            Reset Form
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default CreateProduct;
