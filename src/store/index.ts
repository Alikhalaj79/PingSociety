import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import authReducer, { verifyOtp, initializeAuth, logout } from "./slices/authSlice";
import ordersReducer, { fetchUserOrders, fetchUserTickets, clearOrders } from "./slices/ordersSlice";

// Create listener middleware
const listenerMiddleware = createListenerMiddleware();

// Listen for successful login/auth initialization
listenerMiddleware.startListening({
  actionCreator: verifyOtp.fulfilled,
  effect: async (action, listenerApi) => {
    // Clear old orders/tickets first, then fetch new user's data
    listenerApi.dispatch(clearOrders());
    listenerApi.dispatch(fetchUserOrders());
    listenerApi.dispatch(fetchUserTickets());
  },
});

listenerMiddleware.startListening({
  actionCreator: initializeAuth.fulfilled,
  effect: async (action, listenerApi) => {
    // Clear old orders/tickets first, then fetch new user's data
    listenerApi.dispatch(clearOrders());
    listenerApi.dispatch(fetchUserOrders());
    listenerApi.dispatch(fetchUserTickets());
  },
});

// Listen for logout
listenerMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    // Clear orders when user logs out
    listenerApi.dispatch(clearOrders());
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;









