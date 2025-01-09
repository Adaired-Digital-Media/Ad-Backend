import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";

// Function to generate access token
const generateAccessToken = (userId: string, expiresIn: string) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET as string, {
    expiresIn, // Short-lived token
  });
};

// Function to generate refresh token
const generateRefreshToken = (userId: string, expiresIn: string) => {
  return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn, // Long-lived token
  });
};

// Register Endpoint
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, contact, userStatus } = req.body;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new CustomError(400, "User already exists");
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      userName: email.split("@")[0].toLowerCase(),
      password: hashedPassword,
      contact,
      userStatus,
    });

    // Check if Admin
    const Users = await User.find();
    if (Users.length === 1) {
      user.isAdmin = true;
      user.role = null;
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), "30d");
    const refreshToken = generateRefreshToken(user._id.toString(), "30d");

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Login Endpoint
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError(400, "User not found");
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError(401, "Invalid password");
    }

    // Set token expiration based on rememberMe
    const accessTokenExpire = "30d";
    const refreshTokenExpire = "30d";

    // Generate access token
    let accessToken;
    let refreshToken = user.refreshToken;

    // If refresh token exists, verify it and use it to generate a new access token
    if (refreshToken) {
      try {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

        // If verification succeeds, generate a new access token
        accessToken = generateAccessToken(
          user._id.toString(),
          accessTokenExpire
        );
      } catch (error) {
        // If refresh token is invalid, generate new tokens
        accessToken = generateAccessToken(
          user._id.toString(),
          accessTokenExpire
        );
        refreshToken = generateRefreshToken(
          user._id.toString(),
          refreshTokenExpire
        );
        user.refreshToken = refreshToken;
        await user.save();
      }
    } else {
      // If no refresh token exists, generate new tokens
      accessToken = generateAccessToken(user._id.toString(), accessTokenExpire);
      refreshToken = generateRefreshToken(
        user._id.toString(),
        refreshTokenExpire
      );
      user.refreshToken = refreshToken;
      await user.save();
    }

    // Get User Data With Role and Permissions

    // Get User Data With Role, Permissions, and Cart
    const userData = await User.aggregate([
      {
        $match: {
          email: user.email,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          userName: 1,
          contact: 1,
          userStatus: 1,
          isAdmin: 1,
          role: {
            $cond: {
              if: { $isArray: "$role" },
              then: { $arrayElemAt: ["$role", 0] },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          role: {
            role: "$role.role",
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      userData: userData[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new CustomError(500, error.message));
    } else {
      next(new CustomError(500, "An unknown error occurred."));
    }
  }
};

// Refresh Token Endpoint
const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError(401, "No token provided");
    }

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new CustomError(401, "Invalid refresh token");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString(), "30d");
    const newRefreshToken = generateRefreshToken(user._id.toString(), "30d");

    // Update the refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// Logout Endpoint
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null; // Clear refresh token
      await user.save();
    }

    res.status(200).json("User logged out successfully!");
  } catch (error) {
    next(error);
  }
};

// Fetch Current User Details
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = await User.aggregate([
      {
        $match: {
          email: user.email,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          userName: 1,
          contact: 1,
          userStatus: 1,
          isAdmin: 1,
          role: {
            $cond: {
              if: { $isArray: "$role" },
              then: { $arrayElemAt: ["$role", 0] },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          role: {
            role: "$role.role",
          },
        },
      },
    ]);
    res.status(200).json(userData[0]);
  } catch (error) {
    next(error);
  }
};

// Reset Password Endpoint
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req; // Extract userId from the auth middleware
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Check if the current password is correct
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;

    // Clear the refresh token (optional: forces re-login on all devices)
    user.refreshToken = null;
    await user.save();

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id.toString(), "30d");
    
    // Send the new access token in the response
    res.status(200).json({
      message: "Password reset successfully!",
      accessToken: newAccessToken, // Return the new access token
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, currentUser, refreshToken, resetPassword };
