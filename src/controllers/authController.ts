import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, contact, userStatus } = req.body;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
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

    res.status(201).json({
      ad_access: token,
      user,
    });
  } catch (error) {
    console.error("Error during registration:", error);
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
      throw new CustomError(401, "Invalid Credentials");
    }

    // Determine token expiry based on rememberMe
    const jwtExpire = rememberMe
      ? process.env.JWT_EXPIRE_REMEMBER_ME
      : process.env.JWT_EXPIRE_DEFAULT;

    // Generate Token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: jwtExpire,
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

    // Set token in a cookie
    const cookieMaxAge = rememberMe
      ? parseInt(process.env.COOKIE_MAX_AGE_REMEMBER_ME || "0", 10)
      : parseInt(process.env.COOKIE_MAX_AGE_DEFAULT || "0", 10);

    // Determine environment
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("ad_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: cookieMaxAge,
      sameSite: isProduction? "none" : "lax", // Use 'None' for production
    });

    // Respond with success
    res.status(200).json({
      message: "Login successful",
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
      .clearCookie("ad_access", { secure: true })
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
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, currentUser };
