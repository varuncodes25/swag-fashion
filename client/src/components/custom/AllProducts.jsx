import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  X,
  Package,
  Star,
  MoreHorizontal
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Card,
  CardContent,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import Pagination from "../Pagination";

// Import Redux actions
import {
  fetchProducts,
} from "@/redux/slices/admin/productSlice";

const AllProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Redux state
  const { 
    products:data = [], // ✅ 'data' use karo, 'products' nahi
    loading, 
    error,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0,
      pageSize: 9
    }
  } = useSelector((state) => state.adminProduct || state.products || {});

  // Local state
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    price: "",        // Max price filter
    minPrice: "",      // Min price filter (optional)
    maxPrice: "",      // Max price filter (optional)
    gender: "all",     // Gender filter
    inStock: "all",    // Stock filter
    sort: "createdAt",
    page: 1,
    limit: 9
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const params = {};
    
    // 🔍 Search filter
    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }
    
    // 📁 Category filter
    if (filters.category !== "all") {
      params.category = filters.category;
    }
    
    // 👤 Gender filter
    if (filters.gender !== "all") {
      params.gender = filters.gender;
    }
    
    // 📦 Stock filter
    if (filters.inStock !== "all") {
      params.inStock = filters.inStock;
    }
    
    // 💰 Price filter - Max price
    if (filters.price && filters.price !== "" && !isNaN(filters.price)) {
      params.price = Number(filters.price);
    }
    
    // 💰 Min price filter
    if (filters.minPrice && filters.minPrice !== "" && !isNaN(filters.minPrice)) {
      params.minPrice = Number(filters.minPrice);
    }
    
    // 💰 Max price filter
    if (filters.maxPrice && filters.maxPrice !== "" && !isNaN(filters.maxPrice)) {
      params.maxPrice = Number(filters.maxPrice);
    }
    
    // 🔄 Sort filter
    if (filters.sort !== "createdAt") {
      params.sort = filters.sort;
    }
    
    // 📄 Pagination
    params.page = Number(filters.page);
    params.limit = Number(filters.limit);
    
    console.log("Dispatching with params:", params);
    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    console.log(key, value, "Filter changed");
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle view product
  const handleViewProduct = (productId) => {
    navigate(`/admin/products/${productId}`);
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Handle delete click
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters({
      category: "all",
      search: "",
      price: "",
      minPrice: "",
      maxPrice: "",
      gender: "all",
      inStock: "all",
      sort: "createdAt",
      page: 1,
      limit: 9
    });
  };

  // Get status badge
  const getStatusBadge = (product) => {
    if (!product) return null;
    
    if (product.isBlacklisted) {
      return <Badge variant="destructive" className="text-xs">Blocked</Badge>;
    }
    if (!product.isInStock) {
      return <Badge variant="destructive" className="text-xs bg-orange-500">Out Stock</Badge>;
    }
    if (product.availableStock < 10) {
      return <Badge variant="warning" className="text-xs bg-yellow-500">Low Stock</Badge>;
    }
    return <Badge variant="success" className="text-xs bg-green-500">Active</Badge>;
  };

  // Get rating display
  const getRatingDisplay = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating?.toFixed(1) || "0.0"}</span>
      </div>
    );
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {pagination?.totalProducts || 0} products
          </p>
        </div>
        <Button 
          onClick={() => navigate("/admin/dashboard")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
          size="sm"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name..."
                className="pl-9 h-9 text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                  <SelectItem value="Collections">Collections</SelectItem>
                  <SelectItem value="Style">Style</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="priceLowToHigh">Price: Low to High</SelectItem>
                  <SelectItem value="priceHighToLow">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 px-3"
              >
                <Filter className="w-4 h-4" />
              </Button>

              {/* Reset Button */}
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="h-9">
                Reset
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
              {/* Min Price */}
              <div>
                <Label className="text-xs">Min Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min price"
                  className="h-8 text-sm mt-1"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>
              
              {/* Max Price */}
              <div>
                <Label className="text-xs">Max Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max price"
                  className="h-8 text-sm mt-1"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
              
              {/* Gender Filter */}
              <div>
                <Label className="text-xs">Gender</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange("gender", value)}
                >
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                    <SelectItem value="Kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Stock Filter */}
              <div>
                <Label className="text-xs">Stock Status</Label>
                <Select
                  value={filters.inStock}
                  onValueChange={(value) => handleFilterChange("inStock", value)}
                >
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">In Stock</SelectItem>
                    <SelectItem value="false">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Items per page */}
              <div>
                <Label className="text-xs">Items per page</Label>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => handleFilterChange("limit", parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9 per page</SelectItem>
                    <SelectItem value="18">18 per page</SelectItem>
                    <SelectItem value="27">27 per page</SelectItem>
                    <SelectItem value="36">36 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[60px] text-xs font-medium text-gray-500">Image</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Product</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Price</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Stock</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Rating</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Status</TableHead>
                <TableHead className="text-right text-xs font-medium text-gray-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="w-10 h-10 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No products found</p>
                    <Button variant="link" size="sm" onClick={handleResetFilters} className="mt-2">
                      Clear filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((product) => (
                  <TableRow 
                    key={product?._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewProduct(product?._id)}
                  >
                    {/* Image */}
                    <TableCell>
                      <Avatar className="w-10 h-10 rounded-lg border border-gray-200">
                        <AvatarImage 
                          src={product?.image?.url || "/placeholder.png"} 
                          alt={product?.name}
                        />
                        <AvatarFallback className="rounded-lg bg-gray-100 text-xs">
                          {product?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Product Details */}
                    <TableCell>
                      <div className="max-w-[250px]">
                        <p className="font-medium text-sm text-gray-900 line-clamp-2" title={product?.name}>
                          {product?.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {product?.brand || "No Brand"}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {product?.clothingType}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm text-gray-900">
                          ₹{product?.sellingPrice?.toFixed(0) || "0"}
                        </p>
                        {product?.discount > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product?.price?.toFixed(0)}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1">
                              -{product?.discount}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <p className={`text-sm font-medium ${
                        product?.availableStock === 0 ? "text-red-500" :
                        product?.availableStock < 10 ? "text-yellow-500" :
                        "text-green-500"
                      }`}>
                        {product?.availableStock || 0}
                      </p>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingDisplay(product?.rating)}
                        <span className="text-xs text-gray-400">
                          ({product?.reviewCount || 0})
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(product)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleViewProduct(product?._id)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleEditProduct(product?._id)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              title="More actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              <span className="text-xs">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={filters.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Product</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete "{selectedProduct?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // Add delete logic here
                setDeleteDialogOpen(false);
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProducts;