import JunkCartLeads from "../models/junkCartLeadsModel";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { generateUserId } from "../helpers/generateGuestId";

// *********************************************************
// ***** Add Product to Cart / Sync Cart with Frontend *****
// *********************************************************
export const syncOrAddToJunkCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { userId, cartItems } = body;
    let user = userId || generateUserId();

    // Find the user's cart or create one if it doesn't exist
    let cart = await JunkCartLeads.findOne({ userId: user });

    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new JunkCartLeads({
        userId: user,
        products: [],
      });

      // Optionally link the cart to a User document, if applicable
      if (userId) {
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
          existingUser.cart = cart._id; // Link the cart to the user
          await existingUser.save();
        }
      }
    }

    // Add or update cart items
    cartItems.forEach((newItem: any) => {
      const existingItem = cart.products.find(
        (product: any) => product.productId === newItem.productId
      );
      if (existingItem) {
        // Update quantity and price for existing items
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice += newItem.totalPrice;
      } else {
        // Add new item
        cart.products.push(newItem);
      }
    });

    // Recalculate total quantity and price
    cart.totalQuantity = cart.products.reduce(
      (acc: number, product: any) => acc + product.quantity,
      0
    );
    cart.totalPrice = cart.products.reduce(
      (acc: number, product: any) => acc + product.totalPrice,
      0
    );

    // Save the cart
    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      guestId: userId, // Returning the guest ID for tracking
      data: cart,
    });
  } catch (error) {
    console.error(error);
    next(error);
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
  const { userId } = req.query;
  const { productId, ...updateFields } = req.body;

  try {
    // Check if the cart exists
    const cart = await JunkCartLeads.findOne({
      userId: userId,
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product to update
    const product = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Dynamically update the product fields from the request body
    Object.keys(updateFields).forEach((key) => {
      if (key in product) {
        (product as any)[key] = updateFields[key];
      }
    });

    // Recalculate total quantity and total price
    cart.totalQuantity = cart.products.reduce((acc, p) => acc + p.quantity, 0);
    cart.totalPrice = cart.products.reduce(
      (acc, p) => acc + p.totalPrice * p.quantity,
      0
    );

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
  const { userId } = req.query;
  const { customerId, productId } = req.query;

  try {
    // Check if the cart exists
    const cart = await JunkCartLeads.findOne({ userId: customerId || userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product to remove
    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate total quantity and total price
    cart.totalQuantity = cart.products.reduce((acc, p) => acc + p.quantity, 0);
    cart.totalPrice = cart.products.reduce(
      (acc, p) => acc + p.totalPrice * p.quantity,
      0
    );

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
  const { userId } = req.query;

  try {
    const cart = await JunkCartLeads.findOne({ userId: userId });
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

// // ***************************************
// // ********* Get Cart for a User *********
// // ***************************************
// export const getUserCart = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { userId } = req;
//     const { customerId } = req.query;

//     // Check Permission
//     const permissionCheck = await checkPermission(userId, "carts", 1);
//     if (!permissionCheck) {
//       return res.status(403).json({ message: "Permission denied" });
//     }

//     const cart = await JunkCartLeads.findOne({
//       userId: customerId,
//     }).populate("products.productId");
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }
//     res.status(200).json({
//       message: "Cart data fetched successfully",
//       data: cart,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
