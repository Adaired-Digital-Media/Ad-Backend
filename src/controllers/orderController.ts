import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Order from "../models/orderModel";
import Cart from "../models/cartModel";
import { CustomError } from "../middlewares/error";
import checkPermission from "../helpers/authHelper";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

// *********************** ADMIN ***************************

// *********************************************************
// ************ Create an Order and Initiate Payment *******
// *********************************************************
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { couponId, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let totalPrice = cart.totalPrice;
    let couponDiscount = 0;
    if (couponId) {
      // Apply coupon logic here
    }
    const discountedPrice = totalPrice - couponDiscount;

    // Generate order number based on current date and time
    const now = new Date();
    const orderNumber = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.products.map((product) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.productName,
          },
          unit_amount: Math.round(product.pricePerUnit * 100),
        },
        quantity: product.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.LOCAL_DOMAIN}/success`,
      cancel_url: `${process.env.LOCAL_DOMAIN}/cancel`,
      metadata: { userId, couponId },
    });

    const newOrder = new Order({
      orderNumber: orderNumber,
      userId,
      products: cart.products,
      totalQuantity: cart.totalQuantity,
      totalPrice,
      discountedPrice,
      couponId: couponId || null,
      couponDiscount,
      paymentId: session.id,
      invoiceId: "Invoice_" + Date.now(),
      paymentUrl: session.url,
      status: "Pending",
      paymentStatus: "Unpaid",
      paymentMethod,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully.",
      data: newOrder,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new CustomError(500, error.message));
    } else {
      next(new CustomError(500, "An unknown error occurred."));
    }
  }
};

// *********************************************************
// ************** Handle Stripe Webhook Events *************
// *********************************************************
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  if (!sig) {
    return res.status(400).send("Missing Stripe signature header");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    } else {
      return res.status(400).send(`Webhook Error: ${err}`);
    }
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        await Order.findOneAndUpdate(
          { paymentId: session.id },
          {
            status: "Confirmed",
            paymentStatus: "Paid",
            paymentDate: Date.now(),
          },
          { new: true }
        );
      }
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      await Order.findOneAndUpdate(
        { paymentId: expiredSession.id },
        { status: "Cancelled", paymentStatus: "Unpaid" },
        { new: true }
      );

      // Create a new checkout session if expired
      const cart = await Cart.findOne({
        userId: expiredSession.metadata.userId,
      });
      if (cart && cart.products.length > 0) {
        const newSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: cart.products.map((product) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: product.productName,
              },
              unit_amount: Math.round(product.totalPrice * 100),
            },
            quantity: product.quantity,
          })),
          mode: "payment",
          success_url: `${process.env.LOCAL_DOMAIN}/success`,
          cancel_url: `${process.env.LOCAL_DOMAIN}/cancel`,
          metadata: {
            userId: expiredSession.metadata.userId,
            couponId: expiredSession.metadata.couponId,
          },
        });

        await Order.findOneAndUpdate(
          { paymentId: expiredSession.id },
          {
            paymentUrl: newSession.url,
            paymentId: newSession.id,
          },
          { new: true }
        );
      }
      break;

    default:
  }

  res.status(200).json({ received: true });
};

// *********************************************************
// ************ Retrieve All Orders for Admin **************
// *********************************************************
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { orderId } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "orders", 2);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    let orders;
    if (orderId) {
      orders = await Order.findById(orderId);
      if (!orders) {
        return res.status(404).json({ message: "Order not found." });
      }
    } else {
      orders = await Order.find().sort({ createdAt: -1 }).populate("userId");
    }

    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// *********************************************************
// ************ Update Order (Admin) ***********************
// *********************************************************
export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { orderId } = req.query;
    const updateData = req.body;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "orders", 3);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res
      .status(200)
      .json({ message: "Order updated successfully.", data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// *********************************************************
// ************** Delete an Order by ID ********************
// *********************************************************
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { orderId } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "orders", 4);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// *********************** USER ****************************

// *********************************************************
// ************ Retrieve Orders by User ID *****************
// *********************************************************
export const getOrdersByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { orderId } = req.query;

    let orders;
    if (orderId) {
      orders = await Order.findOne({ userId, _id: orderId });
      if (!orders) {
        return res.status(404).json({ message: "Order not found." });
      }
    } else {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};
