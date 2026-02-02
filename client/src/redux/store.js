import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from "./slices/authSlice";
import cartSlice from "./slices/cartSlice";
import productSlice from "./slices/admin/productSlice";
import categorySlice from "./slices/admin/categorySlice";
import wishlistReducer from "./slices/wishlistSlice"
const persistConfig = {
  key: "root",
  storage,
  whitelist: [ "auth","wishlist"], // persist cart and auth
  // Don't persist products to avoid stale data
};

const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
  products: productSlice,  // Changed from product to products (plural)
  categories: categorySlice,
   wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'products/createProduct/fulfilled'
        ],
        ignoredPaths: ['products.currentProduct.variants'],
      },
    }),
});

export const persistor = persistStore(store);