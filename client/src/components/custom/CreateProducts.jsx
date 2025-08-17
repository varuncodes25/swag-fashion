import React, { useRef, useState } from "react";
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
import { Loader2, Upload, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";

const MAX_IMAGES = 15;
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const CreateProducts = () => {
  const [currentColor, setCurrentColor] = useState("#000000");
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerValidTill, setOfferValidTill] = useState("");
  const [offerValidFrom, setOfferValidFrom] = useState("");
  const fileInputRefs = useRef({});
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  const [variantImages, setVariantImages] = useState({}); // { color: [{ preview, file }] }

  

  const removeSize = (size) => {
    setSizes((prev) => prev.filter((s) => s !== size));
  };

  const handleImageUpload = (color) => (e) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setVariantImages((prev) => ({
      ...prev,
      [color]: prev[color] ? [...prev[color], ...newFiles] : newFiles,
    }));
  };

  const removeImage = (color, index) => {
    setVariantImages((prev) => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== index),
    }));
  };

  // COLORS OPTIONS
const COLOR_OPTIONS = [
  { name: "Black", code: "#000000" },
  { name: "Red", code: "#dd2c2c" },
  { name: "White", code: "#ffffff" },
  { name: "Blue", code: "#0000ff" },
];

// ---- Add color ----
const addColor = () => {
  if (!currentColor) return;
  if (!colors.includes(currentColor)) {
    setColors([...colors, currentColor]); // we store the NAME only
  }
};

// ---- Remove color ----
const removeColor = (color) => {
  setColors(colors.filter((c) => c !== color));
  const updated = { ...variantImages };
  delete updated[color];
  setVariantImages(updated);
};

// ---- Submit ----
const onSubmit = async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const description = e.target.description.value;
  const price = e.target.price.value;
  const stock = e.target.stock.value;
  const category = e.target.category.value;

  if (
    !name ||
    !description ||
    !price ||
    !stock ||
    !category ||
    colors.length === 0 ||
    sizes.length === 0
  ) {
    return toast({
      title: "Error",
      description: "Please fill out all fields",
    });
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("category", category);
  formData.append("sizes", JSON.stringify(sizes));
  formData.append("colors", JSON.stringify(colors)); // ["Black","Red"]

  // ---- Images grouped by color ----
  const colorImageMap = []; // keep colors in same order as files

  Object.entries(variantImages).forEach(([color, imgs]) => {
    imgs.forEach((imgObj) => {
      // attach image file
      formData.append("images", imgObj.file);

      // push the color for each file
      colorImageMap.push(color);
    });
  });

  // ✅ send array of colors for mapping
  formData.append("colorsForImages", JSON.stringify(colorImageMap));

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/create-product`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast({ title: "Success", description: res.data.message });
  } catch (error) {
    handleErrorLogout(error, "Error uploading product");
  }
};



  if (isLoading) {
    return (
      <div className="flex items-center justify-center absolute inset-0">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl -z-10">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Product</CardTitle>
        <CardDescription>
          Enter the details for the new product you want to add
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:w-[70vw]">
          {/* Left Column */}
          <CardContent className="w-full space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                placeholder="20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Category">All Category</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Kid">Kid</SelectItem>
                  <SelectItem value="Men & Women">Men & Women</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          {/* Right Column */}
          <CardContent className="w-full space-y-6">
            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex items-center space-x-2">
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!sizes.includes(selectedSize))
                      setSizes([...sizes, selectedSize]);
                  }}
                >
                  Add Size
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center bg-gray-100 rounded-full px-2 py-1"
                  >
                    <span className="text-sm mr-1 dark:text-slate-900">
                      {size}
                    </span>
                    <Button
                      variant="ghost"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => removeSize(size)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors & Images */}
            <div className="space-y-4 mt-6 bg-black p-4 rounded-lg">
              <Label htmlFor="color" className="text-white font-medium">
                Colors
              </Label>
              <div className="flex items-center space-x-3">
                <select
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="border border-gray-600 rounded-md px-3 py-2 bg-gray-900 text-white w-full"
                >
                  <option value="">Select color</option>
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.code} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  className="px-4 py-2 h-10 text-sm text-white border-white hover:bg-white hover:text-black"
                  onClick={addColor}
                >
                  Add Color
                </Button>
              </div>

              <div className="space-y-3">
                {colors.map((color) => {
                  const colorObj = COLOR_OPTIONS.find((c) => c.code === color);
                  const colorName = colorObj ? colorObj.name : color;
                  return (
                    <div
                      key={color}
                      className="border border-gray-700 rounded-lg p-3 bg-gray-900"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium text-white">
                            {colorName}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => removeColor(color)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {(variantImages[color] || []).map((imgObj, i) => (
                          <div
                            key={i}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700"
                          >
                            <img
                              src={imgObj.preview}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              className="absolute -top-1 -right-1 p-1 bg-gray-800 rounded-full shadow"
                              onClick={() => removeImage(color, i)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => fileInputRefs.current[color].click()}
                          className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition"
                        >
                          <Upload className="h-5 w-5" />
                        </Button>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[color] = el)}
                          onChange={handleImageUpload(color)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offer & Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="Enter discount %"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerTitle">Offer Title</Label>
              <Input
                id="offerTitle"
                placeholder="Enter offer title"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerDescription">Offer Description</Label>
              <Textarea
                id="offerDescription"
                rows={3}
                placeholder="Enter offer description"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerValidFrom">Offer Valid From</Label>
              <Input
                id="offerValidFrom"
                type="date"
                value={offerValidFrom}
                onChange={(e) => setOfferValidFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerValidTill">Offer Valid Till</Label>
              <Input
                id="offerValidTill"
                type="date"
                value={offerValidTill}
                onChange={(e) => setOfferValidTill(e.target.value)}
              />
            </div>
          </CardContent>
        </div>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Adding Product..." : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default CreateProducts;
