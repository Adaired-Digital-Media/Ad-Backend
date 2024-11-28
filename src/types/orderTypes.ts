import { Types } from "mongoose";
// Define a type for each product in the order
interface OrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  discountedPrice: number;
  productType: "OneTime" | "Monthly";
}

// Define the main Order type
export interface OrderTypes extends Document {
  userId: Types.ObjectId;
  products: OrderProduct[];
  totalQuantity: number;
  totalPrice: number;
  couponId?: Types.ObjectId | null;
  couponDiscount?: number;
  paymentId: string;
  invoiceId: string;
  zohoInvoiceId: string;
  paymentUrl: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  paymentMethod: "Razorpay" | "Stripe";
  paymentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
