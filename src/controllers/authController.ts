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
    const accessToken = generateAccessToken(user._id.toString(), "1h");
    const refreshToken = generateRefreshToken(user._id.toString(), "1d");

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
    const accessTokenExpire = "1h"; // Access token expiration time
    const refreshTokenExpire = rememberMe ? "30d" : "1d"; // Refresh token expiration

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
    next(error);
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
    const newAccessToken = generateAccessToken(user._id.toString(), "1h");
    const newRefreshToken = generateRefreshToken(user._id.toString(), "7d");

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

export { register, login, logout, currentUser, refreshToken };
