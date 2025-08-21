import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Edit, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "@/redux/slices/productSlice";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import { ToastAction } from "../ui/toast";
import Pagination from "../Pagination";

const AllProducts = () => {
  const [currentColor, setCurrentColor] = useState("#000000");
  const [colors, setColors] = useState([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [sizes, setSizes] = useState([]);

  const { products } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Color handlers
  const addColor = () => {
    if (!colors.includes(currentColor)) {
      setColors([...colors, currentColor]);
    }
  };
  const removeColor = (color) => {
    setColors(colors.filter((c) => c !== color));
  };

  // Size handlers
  const addSelectedSize = () => {
    const size = selectedSize.trim().toUpperCase();
    if (size && !sizes.includes(size)) {
      setSizes([...sizes, size]);
      setSelectedSize("");
    }
  };
  const removeSize = (sizeToRemove) => {
    setSizes(sizes.filter((size) => size !== sizeToRemove));
  };

  // Fetch filtered products
  const getFilterProducts = async (page = 1) => {
    try {
      let queryParams = [];
      if (category && category !== "all") queryParams.push(`category=${category}`);
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
      if (price && !isNaN(price)) queryParams.push(`price=${price}`);

      queryParams.push(`page=${page}`);
      queryParams.push(`limit=9`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      const res = await axios.get(import.meta.env.VITE_API_URL + `/get-products-admin${queryString}`);

      if (res.data.success) {
        dispatch(setProducts(res.data.data));
        setTotalPages(res.data.pagination.totalPages);
      } else {
        dispatch(setProducts([]));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        dispatch(setProducts([]));
      } else {
        dispatch(setProducts([]));
        console.error("Error fetching products", error);
      }
    }
  };

  useEffect(() => {
    getFilterProducts(page);
  }, [category, searchTerm, price, page]);

  const removeFromBlacklist = async (id) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/remove-from-blacklist/${id}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast({ title: "Success", description: res.data.message });
    } catch (error) {
      handleErrorLogout(error, "Error occurred while reverting changes");
    }
  };

  const blacklistProduct = async (id) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/blacklist-product/${id}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast({
        title: "Success",
        description: res.data.message,
        action: (
          <ToastAction altText="Undo changes" onClick={() => removeFromBlacklist(res.data.data._id)}>
            Undo Changes
          </ToastAction>
        ),
      });
    } catch (error) {
      handleErrorLogout(error, "Error occurred while blacklisting product");
    }
  };

  // Open edit modal and set editing product data including colors and sizes
  const handleEdit = (product) => {
    setEditingProduct(product);
    setColors(product.colors || []);
    setSizes(product.sizes || []);
    setIsEditModalOpen(true);
  };

  const confirmDelete = (productId) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await axios.delete(import.meta.env.VITE_API_URL + `/delete-product/${deleteProductId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      dispatch(setProducts(products.filter((p) => p._id !== deleteProductId)));
      toast({ title: res.data.message || "Product deleted successfully" });
    } catch (error) {
      return handleErrorLogout(error, "Error occurred while deleting product");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updatedProduct = {
      ...editingProduct,
      name: formData.get("name"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")),
      stock: parseInt(formData.get("stock")),
      category: formData.get("category"),
      colors: colors,
      sizes: sizes,
      discount: formData.get("discount"),
      offerTitle: formData.get("offerTitle"),
      offerDescription: formData.get("offerDescription"),
      offerValidTill: formData.get("offerValidTill"),
      offerValidFrom: formData.get("offerValidFrom"),
    };

    dispatch(setProducts(products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))));

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/update-product/${editingProduct._id}`,
        updatedProduct,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast({ title: res.data.message });
    } catch (error) {
      return handleErrorLogout(error, "Error occurred while updating product");
    }

    setIsEditModalOpen(false);
    setEditingProduct(null);
    setColors([]);
    setSizes([]);
  };

  return (
    <div className="mx-auto px-4 sm:px-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      <div className="mb-8">
        <form className="flex flex-wrap gap-4 items-end sm:w-[80vw]">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Search Products</Label>
            <div className="relative">
              <Input
                type="text"
                id="search"
                placeholder="Search by name or description"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="w-48 min-w-[150px]">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Kid">Kid</SelectItem>
                <SelectItem value="Men & Women">Men & Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48 min-w-[150px]">
            <Label htmlFor="price">Max Price (₹)</Label>
            <Input
              type="number"
              id="price"
              min="0"
              placeholder="No max"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </form>
      </div>

      {products?.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No products found, try adjusting your search or filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-2 sm:mx-0">
          {products?.map((product) => (
            <Card key={product._id} className="flex flex-col">
              <div className="aspect-square relative">
                <img
                  src={
                    Array.isArray(product.variants) &&
                      product.variants.length > 0 &&
                      Array.isArray(product.variants[0].images) &&
                      product.variants[0].images.length > 0
                      ? product.variants[0].images[0].url
                      : "/placeholder.png"
                  }
                  alt={product.name}
                  className="rounded-t-lg object-cover w-full h-full"
                />

              </div>

              <CardContent className="flex-grow p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <p className="text-lg font-bold">₹{product.price.toFixed(2)}</p>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => confirmDelete(product._id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] h-[80vh] overflow-y-auto flex flex-col justify-between">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="w-full">
            <div className="grid gap-4 py-4 w-full">
              {/* Name */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} />
              </div>

              {/* Description */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProduct?.description}
                />
              </div>

              {/* Price */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  defaultValue={editingProduct?.price}
                />
              </div>

              {/* Category */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingProduct?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Kid">Kid</SelectItem>
                    <SelectItem value="Men & Women">Men & Women</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Picker with dropdown + add button */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="sizes">Sizes</Label>
                <div className="flex items-center space-x-2">
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addSelectedSize}>
                    Add Size
                  </Button>
                </div>

                {/* Show Added Sizes */}
                <div className="flex gap-2 flex-wrap mt-2">
                  {sizes.map((size, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 border rounded px-2 py-1"
                    >
                      <span className="text-sm font-medium">{size}</span>
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  type="number"
                  id="discount"
                  name="discount"
                  defaultValue={editingProduct?.discount}
                />
              </div>

              {/* Colors Picker */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="color">Colors</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-12 h-12 p-1 rounded-md"
                  />
                  <Button type="button" variant="outline" onClick={addColor}>
                    Add Color
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 border rounded px-2 py-1"
                    >
                      <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: color }}
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offer Title */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="offerTitle">Offer Title</Label>
                <Input
                  id="offerTitle"
                  name="offerTitle"
                  placeholder="Enter offer title"
                  defaultValue={editingProduct?.offerTitle}
                />
              </div>

              {/* Offer Description */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="offerDescription">Offer Description</Label>
                <Textarea
                  id="offerDescription"
                  name="offerDescription"
                  placeholder="Enter offer description"
                  defaultValue={editingProduct?.offerDescription}
                />
              </div>

              {/* Offer Valid From */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="offerValidFrom">Offer Valid From</Label>
                <Input
                  type="date"
                  id="offerValidFrom"
                  name="offerValidFrom"
                  defaultValue={editingProduct?.offerValidFrom}
                />
              </div>

              {/* Offer Valid Till */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="offerValidTill">Offer Valid Till</Label>
                <Input
                  type="date"
                  id="offerValidTill"
                  name="offerValidTill"
                  defaultValue={editingProduct?.offerValidTill}
                />
              </div>

              {/* Stock */}
              <div className="grid gap-4 items-center">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  defaultValue={editingProduct?.stock}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will permanently delete the product.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AllProducts;
