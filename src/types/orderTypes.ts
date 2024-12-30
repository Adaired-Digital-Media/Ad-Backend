import { Types } from "mongoose";
// Define a type for each product in the order
interface OrderProduct {
  productId: Types.ObjectId;
  formData: Record<string, any>;
  quantity: number;
  totalPrice: number;
  discountedPrice: number;
  orderType: "OneTime" | "Monthly";
}

// Define the main Order type
export interface OrderTypes extends Document {
  userId: Types.ObjectId;
  orderNumber?: string;
  products: OrderProduct[];
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
    | "Failed";
  paymentStatus: "Unpaid" | "Paid" | "Refunded" | "Failed";
  paymentMethod: "Razorpay" | "Stripe";
  paymentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
