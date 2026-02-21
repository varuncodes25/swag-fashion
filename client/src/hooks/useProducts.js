import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  fetchProductById,
  clearCurrentProduct,
  setFilters,
  clearError,
  // updateVariantStock,
} from '../redux/slices/admin/productSlice';

// Import admin-specific actions from admin slice
import {
  blacklistProduct,
  removeFromBlacklist,
} from '../redux/slices/admin/productSlice'; // Make sure this path is correct

export const useProducts = () => {
  const dispatch = useDispatch();
  const productState = useSelector((state) => state.products);

  const getProducts = (page = 1, customFilters = {}) => {
    dispatch(fetchProducts({ 
      page, 
      limit: productState.pagination.pageSize, 
      filters: { ...productState.filters, ...customFilters } 
    }));
  };

  const addProduct = (formData) => {
    return dispatch(createProduct(formData));
  };

  const editProduct = (id, data) => {
    return dispatch(updateProduct({ id, data }));
  };

  const removeProduct = (id) => {
    return dispatch(deleteProduct(id));
  };

  const getProduct = (id) => {
    return dispatch(fetchProductById(id));
  };

  const clearProduct = () => {
    dispatch(clearCurrentProduct());
  };

  const setProductFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const clearProductError = () => {
    dispatch(clearError());
  };

  // const updateStock = (productId, variantId, stock) => {
  //   return dispatch(updateVariantStock({ productId, variantId, stock }));
  // };

  // Admin-specific functions
  const blacklist = (id) => {
    return dispatch(blacklistProduct(id));
  };

  const unblacklist = (id) => {
    return dispatch(removeFromBlacklist(id));
  };

  return {
    ...productState,
    getProducts,
    addProduct,
    editProduct,
    removeProduct,
    getProduct,
    clearProduct,
    setProductFilters,
    clearProductError,
    // updateStock,
    // Add admin functions
    blacklist,
    unblacklist,
  };
};