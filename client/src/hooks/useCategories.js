import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, clearCategories, clearCategoryError } from '../redux/slices/admin/categorySlice';

export const useCategories = () => {
  const dispatch = useDispatch();
  const categoryState = useSelector((state) => state.categories);

  const getCategories = () => {
    dispatch(fetchCategories());
  };

  const clearAllCategories = () => {
    dispatch(clearCategories());
  };

  const clearCatError = () => {
    dispatch(clearCategoryError());
  };

  return {
    ...categoryState,
    getCategories,
    clearAllCategories,
    clearCatError,
  };
};