import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Order from "../models/orderModel";
import Cart from "../models/cartModel";
import { CustomError } from "../middlewares/error";
import checkPermission from "../helpers/authHelper";
import { Types } from "mongoose";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia"
});

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.products.map(product => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.productName
          },
          unit_amount: Math.round(product.totalPrice * 100)
        },
        quantity: product.quantity
      })),
      mode: "payment",
      success_url: `${process.env.LOCAL_DOMAIN}/success`,
      cancel_url: `${process.env.LOCAL_DOMAIN}/cancel`,
      metadata: { userId, couponId }
    });

    const newOrder = new Order({
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
      paymentMethod
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully.",
      data: newOrder,
      sessionId: session.id
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
            paymentDate: Date.now()
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
        userId: expiredSession.metadata.userId
      });
      if (cart && cart.products.length > 0) {
        const newSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: cart.products.map(product => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: product.productName
              },
              unit_amount: Math.round(product.totalPrice * 100)
            },
            quantity: product.quantity
          })),
          mode: "payment",
          success_url: `${process.env.LOCAL_DOMAIN}/success`,
          cancel_url: `${process.env.LOCAL_DOMAIN}/cancel`,
          metadata: {
            userId: expiredSession.metadata.userId,
            couponId: expiredSession.metadata.couponId
          }
        });

        await Order.findOneAndUpdate(
          { paymentId: expiredSession.id },
          {
            paymentUrl: newSession.url,
            paymentId: newSession.id
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
// ************ Retrieve All Orders for a User ************
// *********************************************************
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// *********************************************************
// ************ Retrieve a Single Order by ID **************
// *********************************************************
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
};

// *********************************************************
// ************ Update Order Status (e.g., Cancel) *********
// *********************************************************
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, paymentStatus },
      { new: true }
    );

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
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    next(error);
  }
};
