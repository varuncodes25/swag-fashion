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
  DialogDescription
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
  const { products } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // ✅ From API
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState(""); // price filter state as string

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);




  const getFilterProducts = async (page = 1) => {
    try {
      console.log("Fetching products with filters:", {
        category,
        searchTerm,
        price,
        page,
      });

      let queryParams = [];

      if (category && category !== "all")
        queryParams.push(`category=${category}`);
      if (searchTerm)
        queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
      if (price && !isNaN(price)) queryParams.push(`price=${price}`);

      queryParams.push(`page=${page}`);
      queryParams.push(`limit=9`);

      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      const res = await axios.get(
        import.meta.env.VITE_API_URL + `/get-products${queryString}`
      );

      console.log("API response:", res.data);

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

  // ✅ Call function inside a proper useEffect
  useEffect(() => {
    getFilterProducts(page);
  }, [category, searchTerm, price, page]);


  console.log("Current products from redux:", products);

  // Blacklist functions
  const removeFromBlacklist = async (id) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/remove-from-blacklist/${id}`,
        null,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
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
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
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

  // Edit modal handlers
  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };
  const confirmDelete = (productId) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await axios.delete(
        import.meta.env.VITE_API_URL + `/delete-product/${deleteProductId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
      category: formData.get("category"),
    };

    dispatch(
      setProducts(products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)))
    );

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/update-product/${editingProduct._id}`,
        {
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          category: updatedProduct.category,
        },
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
  };

  return (
    <div className="mx-auto px-4 sm:px-8 -z-10">
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
          {products.map((product) => (
            <Card key={product._id} className="flex flex-col">
              <div className="aspect-square relative">
                <img
                  src={product.image.url}
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
                {/* <Button
                  onClick={() =>
                    !product.blacklisted
                      ? blacklistProduct(product._id)
                      : removeFromBlacklist(product._id)
                  }
                >
                  {!product.blacklisted ? "Blacklist Product" : "Remove from Blacklist"}
                </Button> */}
                <Button variant="destructive" onClick={() => confirmDelete(product._id)}>
                  Delete
                </Button>

              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 items-center">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} />
              </div>
              <div className="grid gap-4 items-center">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProduct?.description}
                />
              </div>
              <div className="grid gap-4 items-center">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  defaultValue={editingProduct?.price}
                />
              </div>
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
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default AllProducts;
