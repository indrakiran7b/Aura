import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export default function Checkout() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: "", email: "", address: "", city: "", zip: "", phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const updateField = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const isShippingValid = shipping.name && shipping.email && shipping.address && shipping.city && shipping.zip;

  const placeOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderNumber = `LUXE-${Date.now().toString(36).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        email: shipping.email,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_zip: shipping.zip,
        shipping_phone: shipping.phone || null,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: "confirmed",
      }).select().single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || null,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {["Shipping", "Review & Pay"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > i + 1 ? "bg-accent text-accent-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < 1 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-display font-semibold text-lg">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={shipping.name} onChange={(e) => updateField("name", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={shipping.email} onChange={(e) => updateField("email", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" value={shipping.address} onChange={(e) => updateField("address", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={shipping.city} onChange={(e) => updateField("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input id="zip" value={shipping.zip} onChange={(e) => updateField("zip", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={shipping.phone} onChange={(e) => updateField("phone", e.target.value)} />
                </div>
              </div>
              <Button className="mt-4" disabled={!isShippingValid} onClick={() => setStep(2)}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-display font-semibold text-lg">Review Your Order</h2>
              <div className="border border-border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">Shipping to:</p>
                <p>{shipping.name}</p>
                <p>{shipping.address}</p>
                <p>{shipping.city}, {shipping.zip}</p>
                <p>{shipping.email}</p>
                {shipping.phone && <p>{shipping.phone}</p>}
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={placeOrder} disabled={isSubmitting}>
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:sticky lg:top-24">
            <h3 className="font-display font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{items.length} item(s)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
