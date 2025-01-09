import Cart from "../models/cartModel";
import Product from "../models/productModel";
import Order from "../models/orderModel";
import checkPermission from "../helpers/authHelper";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { CustomError } from "../middlewares/error";
import { Types } from "mongoose";

// *********************************************************
// ***** Add Product to Cart / Sync Cart with Frontend *****
// *********************************************************
export const syncOrAddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return next(new CustomError(400, "Cart items cannot be empty."));
    }

    // Find the user's cart or create one if it doesn't exist
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new Cart({
        userId: body.userId || userId,
        products: [],
        totalQuantity: 0,
        totalPrice: 0,
      });

      // Find the user and set their cart reference
      const user = await User.findById(userId);
      if (user) {
        user.cart = cart._id;
        await user.save();
      }
    }

    // Check for free products and prevent a user from adding it more than once
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return next(
          new CustomError(404, `Product with ID ${item.productId} not found.`)
        );
      }

      // Handle free products
      if (product.isFreeProduct) {
        // Check if the product is already in the cart
        const alreadyInCart = cart.products.some(
          (cartItem: any) => cartItem.productId.toString() === item.productId
        );

        if (alreadyInCart) {
          return next(
            new CustomError(
              400,
              `You cannot add the free product (${product.name}) to the cart more than once.`
            )
          );
        }

        // Check if the user has already purchased this product
        const existingOrder = await Order.findOne({
          userId,
          "products.productId": item.productId,
          paymentStatus: "Paid",
        });

        if (existingOrder) {
          return next(
            new CustomError(
              400,
              `You have already purchased the free product (${product.name}).`
            )
          );
        }
      }

      // Add the item to the cart
      cart.products.push(item);
    }

    // Recalculate total quantity and price
    cart.totalQuantity = cart.products.length;
    cart.totalPrice = cart.products.reduce(
      (acc: number, product: any) => acc + product.totalPrice,
      0
    );

    // Save the cart
    await cart.save();
    res.status(200).json({
      message: "Cart Updated successfully",
      data: cart,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********* Get Cart for a User *********
// ***************************************
export const getUserCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { customerId } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "carts", 1);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (customerId) {
      const cart = await Cart.findOne({
        userId: customerId,
      }).populate({
        path: "products.productId",
        populate: {
          path: "subCategory",
          select: "name",
        },
      });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      return res.status(200).json({
        message: "Cart data fetched successfully",
        data: cart,
      });
    } else {
      const cart = await Cart.find().populate({
        path: "products.productId",
        populate: {
          path: "subCategory",
          select: "name",
        },
      });
      return res.status(200).json({
        message: "Cart data fetched successfully",
        data: cart,
      });
    }
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********* Update Cart Product *********
// ***************************************
export const updateCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { ...updateFields } = req.body;

  try {
    // Check if the cart exists
    const cart = await Cart.findOne({
      userId: userId,
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the specific product entry by its unique ID
    const product = cart.products.find(
      (p) => p._id.toString() === updateFields.productEntryId
    );
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product entry not found in cart" });
    }

    // Dynamically update the product fields from the request body
    Object.keys(updateFields).forEach((key) => {
      if (key in product) {
        (product as any)[key] = updateFields[key];
      }
    });

    // Recalculate total quantity and total price
    cart.totalQuantity = cart.products.length;
    cart.totalPrice = cart.products.reduce((acc, p) => acc + p.totalPrice, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// ***************************************
// ***** Remove Product from Cart ********
// ***************************************
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { productEntryId } = req.query;

  try {
    // Check if the cart exists
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product to remove
    const productIndex = cart.products.findIndex((p) =>
      p._id.equals(new Types.ObjectId(productEntryId as string))
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate total quantity and total price
    cart.totalQuantity = cart.products.length;
    cart.totalPrice = cart.products.reduce((acc, p) => acc + p.totalPrice, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      message: "Product removed from cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// ***************************************
// ************ Clear Cart ***************
// ***************************************
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { customerId } = req.query;

  // Check Permission
  const permissionCheck = await checkPermission(userId, "carts", 3);
  if (!permissionCheck) {
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
    const cart = await Cart.findOne({ userId: customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();

    // Find the user and clear the cart reference
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = null;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    next(error);
  }
};
