import { Types } from "mongoose";
import { CartProduct } from "./cartTypes";

// Define the main Order type
export interface OrderTypes extends Document {
  userId: Types.ObjectId;
  orderNumber?: string;
  products: CartProduct[];
  totalQuantity: number;
  totalPrice: number;
  discountedPrice: number;
  couponId?: Types.ObjectId | null;
  couponDiscount?: number;
  paymentId: string;
  invoiceId: string;
  zohoInvoiceId: string;
  paymentUrl: string;
  status:
    | "Pending"
    | "Processing"
    | "Confirmed"
    | "Cancelled"
    | "Completed"
  paymentStatus: "Unpaid" | "Paid" | "Refunded" | "Failed";
  paymentMethod: "Razorpay" | "Stripe";
  paymentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
