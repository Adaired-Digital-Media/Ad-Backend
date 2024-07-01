import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";

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
    // Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

// Login Endpoint
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, rememberMe } = req.body;
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
      throw new CustomError(401, "Invalid Credentials");
    }
    // Generate Token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn:
          rememberMe === false ? "" : (process.env.JWT_EXPIRE as string),
      }
    );

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
    res.cookie("ad_access", token).status(200).json({
      message: "User logged in successfully!",
      ad_access: token,
      userData: userData[0],
    });
  } catch (error) {
    next(error);
  }
};

// Logout Endpoint
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res
      .clearCookie("ad_access", { sameSite: "none", secure: true })
      .status(200)
      .json("User logged out successfully!");
  } catch (error) {
    next(error);
  }
};

// Fetch Current User Details
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  const ad_access = req.cookies.ad_access;
  try {
    const decoded = jwt.verify(ad_access, process.env.JWT_SECRET as string);
    const id = (decoded as JwtPayload)._id;
    const user = await User.findOne({ _id: id });
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
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, currentUser };
