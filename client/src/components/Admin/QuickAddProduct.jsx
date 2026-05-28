import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Loader2, Upload, X, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { useProductForm } from "@/hooks/useProductForm";
import { createProduct } from "@/redux/slices/admin/productSlice";
import { MAX_IMAGE_SIZE_MB } from "@/constants/uploadLimits";

const QUICK_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function QuickAddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { categories, getCategories } = useCategories();
  const presetApplied = useRef(false);

  const {
    formData,
    updateFormData,
    colors,
    variantImages,
    isLoading,
    setIsLoading,
    fileInputRefs,
    COLOR_OPTIONS,
    GENDERS,
    CLOTHING_TYPES,
    FITS,
    addSize,
    removeSize,
    sizes,
    setCurrentColor,
    currentColor,
    addColor,
    handleImageUpload,
    removeImage,
    setMainImage,
    prepareFormData,
    validateForm,
    applyQuickListingPreset,
    updateStock,
    stockMatrix,
  } = useProductForm();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (presetApplied.current) return;
    presetApplied.current = true;
    applyQuickListingPreset();
  }, [applyQuickListingPreset]);

  const activeColor = colors[0] || "Black";
  const images = variantImages[activeColor] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = prepareFormData();
      const res = await dispatch(createProduct(payload)).unwrap();
      toast({
        title: "Product listed",
        description: res.message || "Product created successfully",
      });
      navigate("/admin/dashboard/all-products");
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || String(error) || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSize = (size) => {
    if (sizes.includes(size)) removeSize(size);
    else addSize(size);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Quick listing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Fast product upload</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sirf zaroori fields — Black, S–XL, size chart auto. Same design ka naya
            variant? Pehle similar product se{" "}
            <button
              type="button"
              className="font-medium text-primary underline"
              onClick={() => navigate("/admin/dashboard/all-products")}
            >
              Duplicate
            </button>{" "}
            karo, phir naam/photos badlo.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/dashboard")}
        >
          Full form
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Product name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="e.g. God Mode"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Price (₹) *</Label>
            <Input
              type="number"
              min="1"
              value={formData.basePrice}
              onChange={(e) => updateFormData("basePrice", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Discount %</Label>
            <Input
              type="number"
              min="0"
              max="90"
              value={formData.discount}
              onChange={(e) => updateFormData("discount", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(v) => updateFormData("category", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => updateFormData("gender", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Type *</Label>
            <Select
              value={formData.clothingType}
              onValueChange={(v) => updateFormData("clothingType", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLOTHING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fit *</Label>
            <Select value={formData.fit} onValueChange={(v) => updateFormData("fit", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
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

          <div className="flex items-end gap-2 sm:col-span-2">
            <div className="flex-1">
              <Label>Extra color (optional)</Label>
              <Select value={currentColor} onValueChange={setCurrentColor}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pick color" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.filter((c) => !colors.includes(c.name)).map(
                    (c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={addColor}>
              Add color
            </Button>
          </div>
        </div>

        {colors.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Colors: {colors.join(", ")}
          </p>
        )}

        <div>
          <Label className="mb-2 block">Sizes (default stock 20)</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  sizes.includes(size)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {colors[0] && sizes.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {sizes.map((size) => (
                <div key={size}>
                  <Label className="text-xs">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="mt-0.5 h-8"
                    value={stockMatrix[colors[0]]?.[size] ?? 20}
                    onChange={(e) =>
                      updateStock(colors[0], size, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Short description</Label>
          <Textarea
            className="mt-1 min-h-[72px]"
            value={formData.shortDescription}
            onChange={(e) => updateFormData("shortDescription", e.target.value)}
          />
        </div>

        <div>
          <Label>Description *</Label>
          <Textarea
            className="mt-1 min-h-[100px]"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-2 block">
            Photos for {activeColor} * (max {MAX_IMAGE_SIZE_MB}MB each)
          </Label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img.preview}
                  alt=""
                  className="h-24 w-24 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white"
                  onClick={() => removeImage(activeColor, idx)}
                >
                  <X className="h-3 w-3" />
                </button>
                {!img.isMain ? (
                  <button
                    type="button"
                    className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white"
                    onClick={() => setMainImage(activeColor, idx)}
                  >
                    Main
                  </button>
                ) : (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-[10px] text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRefs.current[activeColor]?.click()}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary"
            >
              <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add</span>
            </button>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={(el) => {
              fileInputRefs.current[activeColor] = el;
            }}
            onChange={handleImageUpload(activeColor)}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.isPremium}
              onCheckedChange={(c) => updateFormData("isPremium", Boolean(c))}
            />
            <span className="text-sm">Premium design</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.isNewArrival}
              onCheckedChange={(c) => updateFormData("isNewArrival", Boolean(c))}
            />
            <span className="text-sm">New arrival</span>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing…
            </>
          ) : (
            "Publish product"
          )}
        </Button>
      </form>
    </div>
  );
}
