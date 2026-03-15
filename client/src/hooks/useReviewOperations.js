// hooks/useReviewOperations.js - REDUX VERSION
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  addReply,
  clearError
} from '../redux/slices/reviewsSlice';

export const useReviewOperations = (productId) => {
  const dispatch = useDispatch();
  
  // Selectors
  const reviews = useSelector((state) => 
    state.reviews.data[productId]?.reviews || []
  );
  
  const loading = useSelector((state) => ({
    fetch: state.reviews.loading.fetch[productId] || false,
    create: state.reviews.loading.create.global || false,
    update: state.reviews.loading.update.global || false,
    delete: state.reviews.loading.delete.global || false,
    reply: state.reviews.loading.reply.global || false
  }));
  
  const error = useSelector((state) => state.reviews.error);
  
  // Actions
  const fetchReviewsAction = async () => {
   
    return dispatch(fetchReviews(productId)).unwrap();
  };
  
  const createReviewAction = async (reviewData) => {
    
    return dispatch(createReview(reviewData)).unwrap();
  };
  
  const updateReviewAction = async (reviewId, updateData) => {
  
    return dispatch(updateReview({ reviewId, updateData })).unwrap();
  };
  
  const deleteReviewAction = async (reviewId) => {
 
    return dispatch(deleteReview(reviewId)).unwrap();
  };
  
  const addReplyAction = async (reviewId, replyData) => {
   
    return dispatch(addReply({ reviewId, replyData })).unwrap();
  };
  
  const clearErrorAction = () => {
    dispatch(clearError());
  };
  
  return {
    // Data
    reviews,
    
    // Loading states
    loading,
    
    // Error
    error,
    clearError: clearErrorAction,
    
    // Actions
    fetchReviews: fetchReviewsAction,
    createReview: createReviewAction,
    updateReview: updateReviewAction,
    deleteReview: deleteReviewAction,
    addReply: addReplyAction,
    
    // Manual update (if needed)
    setReviews: null // Not needed in Redux
  };
};