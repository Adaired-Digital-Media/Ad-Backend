import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";

// Update user
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "users", 2);
    if (!permissionCheck) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }
    const { userId } = req.params;
    const { ...updateData } = req.body;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "users", 1);
    if (!permissionCheck) return;

    const users = await User.aggregate([
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

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

//Get user by id
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const permissionCheck = await checkPermission(req.userId, "users", 1);
    if (!permissionCheck) return;

    // Validating if given Id is valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(404, "User not found!");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const LoggedInUser = req.userId;
  const { userId } = req.params;
  try {
    const permissionCheck = await checkPermission(req.userId, "users", 1);
    if (!permissionCheck) return;

    // Validating if given Id is valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }
    // Find user
    const userToDelete = await User.findById(userId);

    // Validating if the user exists
    if (!userToDelete) {
      throw new CustomError(404, "User not found!");
    }

    // Validating if the user is trying to delete an admin or themselves
    if (userToDelete.isAdmin || userId === LoggedInUser) {
      throw new CustomError(403, "You are not allowed to delete this user!");
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export { updateUser, getAllUsers, getUserById, deleteUser };
