import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserOrders,
  fetchUserTickets,
  checkEventStatus,
  getEventTicket,
  getEventPendingOrder,
} from "@/store/slices/ordersSlice";
import type { RootState } from "@/store";

export function useOrdersRTK() {
  const dispatch = useAppDispatch();
  const { orders, tickets, isLoading, error } = useAppSelector(
    (state: RootState) => state.orders
  );

  const checkEvent = useCallback(
    async (eventId: string | number) => {
      return dispatch(checkEventStatus(eventId));
    },
    [dispatch]
  );

  const refreshOrders = useCallback(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const refreshTickets = useCallback(() => {
    dispatch(fetchUserTickets());
  }, [dispatch]);

  const getTicketForEvent = useCallback(
    (eventId: string | number) => {
      return tickets.find(
        (t) => t.event?.id?.toString() === eventId.toString()
      );
    },
    [tickets]
  );

  const getPendingOrderForEvent = useCallback(
    (eventId: string | number) => {
      return orders.find(
        (o) => {
          const status = o.status?.toUpperCase();
          return (
            o.event?.id?.toString() === eventId.toString() &&
            (status === "PENDING" || status === "FAILED")
          );
        }
      );
    },
    [orders]
  );

  return {
    orders,
    tickets,
    isLoading,
    error,
    checkEvent,
    refreshOrders,
    refreshTickets,
    getTicketForEvent,
    getPendingOrderForEvent,
  };
}

