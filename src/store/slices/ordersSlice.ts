import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Order {
  id: number | string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  quantity?: number;
  ticketPrice?: number;
  createdAt?: string;
  discountAmount?: number;
  cancelledReason?: string;
  event?: {
    id?: number | string;
    title?: string;
    description?: string;
    startDate?: string;
    image?: string;
  };
  ticket?: {
    price?: number;
  };
  payments?: Array<{ id: number; status: string; amount: number }>;
}

export interface Ticket {
  id: number | string;
  ticketNumber?: string;
  status?: string;
  price?: number;
  type?: string;
  qrCode?: string;
  usedAt?: string | null;
  event?: {
    id?: number | string;
    title?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    vicinity?: string;
    status?: string;
    image?: string;
  };
  user?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface OrdersState {
  orders: Order[];
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  tickets: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("خطا در دریافت سفارش‌ها");
      }

      const data = await res.json();
      return data.orders || [];
    } catch {
      return rejectWithValue("خطا در ارتباط با سرور");
    }
  }
);

export const fetchUserTickets = createAsyncThunk(
  "orders/fetchUserTickets",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user/tickets", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("خطا در دریافت تیکت‌ها");
      }

      const data = await res.json();
      return data.tickets || [];
    } catch {
      return rejectWithValue("خطا در ارتباط با سرور");
    }
  }
);

export const checkEventStatus = createAsyncThunk(
  "orders/checkEventStatus",
  async (eventId: string | number, { rejectWithValue }) => {
    try {
      const [ordersRes, ticketsRes] = await Promise.all([
        fetch("/api/user/orders", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch("/api/user/tickets", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);

      let orders: Order[] = [];
      let tickets: Ticket[] = [];

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        orders = ordersData.orders || [];
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        tickets = ticketsData.tickets || [];
      }

      // Find ticket for this event
      const ticket = tickets.find(
        (t) => t.event?.id?.toString() === eventId.toString()
      );

      // Find an order for this event that user can continue / retry payment for.
     
      const matchingOrders = orders.filter(
        (o) => o.event?.id?.toString() === eventId.toString()
      );

      let pendingOrder: Order | null = null;

      // First, try to find PENDING or FAILED
      pendingOrder =
        matchingOrders.find((o) => {
          const status = o.status?.toUpperCase();
          return status === "PENDING" || status === "FAILED";
        }) || null;

      // If none, fallback to CANCELLED that has payment attempts (gateway cancelled)
      if (!pendingOrder) {
        pendingOrder =
          matchingOrders.find((o) => {
            const status = o.status?.toUpperCase();
            const hasPayments = o.payments && o.payments.length > 0;
            return status === "CANCELLED" && hasPayments;
          }) || null;
      }

      return {
        eventId: eventId.toString(),
        ticket: ticket || null,
        pendingOrder: pendingOrder || null,
        orders,
        tickets,
      };
    } catch {
      return rejectWithValue("خطا در بررسی وضعیت رویداد");
    }
  }
);

// Orders slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.tickets = [];
      state.error = null;
      state.isLoading = false;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User Tickets
    builder
      .addCase(fetchUserTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Event Status
    builder
      .addCase(checkEventStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEventStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.tickets = action.payload.tickets;
        state.error = null;
      })
      .addCase(checkEventStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrders, setOrders, setTickets } = ordersSlice.actions;

// Selectors
export const getEventTicket = (state: { orders: OrdersState }, eventId: string | number) => {
  return state.orders.tickets.find(
    (t) => t.event?.id?.toString() === eventId.toString()
  );
};

export const getEventPendingOrder = (state: { orders: OrdersState }, eventId: string | number) => {
  const matchingOrders = state.orders.orders.filter(
    (o) => o.event?.id?.toString() === eventId.toString()
  );


  const pendingOrFailed =
    matchingOrders.find((o) => {
      const status = o.status?.toUpperCase();
      return status === "PENDING" || status === "FAILED";
    }) || null;

  if (pendingOrFailed) return pendingOrFailed;

  const cancelledWithPayments =
    matchingOrders.find((o) => {
      const status = o.status?.toUpperCase();
      const hasPayments = o.payments && o.payments.length > 0;
      return status === "CANCELLED" && hasPayments;
    }) || null;

  return cancelledWithPayments;
};

export default ordersSlice.reducer;




