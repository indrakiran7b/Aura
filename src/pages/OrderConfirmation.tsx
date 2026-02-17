import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber || "")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderNumber,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", order?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  if (isLoading) {
    return (
      <div className="container py-20 max-w-2xl">
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Button className="mt-4" asChild><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-display font-bold mt-4">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">Thank you for your purchase</p>
        <p className="mt-2 font-mono text-sm bg-muted px-4 py-2 rounded-lg inline-block">
          Order #{order.order_number}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Shipping Info */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Package className="h-5 w-5" /> Shipping Details
          </h2>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p className="text-foreground font-medium">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_zip}</p>
            <p>{order.email}</p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="font-display font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {orderItems?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image && (
                  <img src={item.product_image} alt="" className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cost === 0 ? "Free" : `$${order.shipping_cost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
