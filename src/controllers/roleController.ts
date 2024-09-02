import Role from "../models/roleModel";
import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";

// ********** Create role **********
const newRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "roles", 0);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    const { roleName, roleDescription, roleStatus, rolePermissions } = req.body;
    // check if roleName is already in use
    const existingRole = await Role.findOne({
      roleName: {
        $regex: roleName,
        $options: "i",
      },
    });
    if (existingRole) {
      throw new CustomError(400, "Role with this name already exists");
    }
    // Create new role
    const newRole = new Role({
      roleName,
      roleDescription,
      roleStatus,
      rolePermissions,
    });
    await newRole.save();
    res.status(201).json({
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Read Roles **********
const findRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    if (roleId) {
      const role = await Role.findById(roleId).lean();
      res.status(200).json({
        message: "Role fetched successfully",
        data: role,
      });
    } else {
      const roles = await Role.find();
      res.status(200).json({
        message: "Roles fetched successfully",
        data: roles,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ********** Update Role **********

const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    const { roleName, rolePermissions, ...updateData } = req.body;

    // Check if the user has the required permission to update the role
    const permissionCheck = await checkPermission(req.userId, "roles", 2);
    if (!permissionCheck) return res.status(403).json({ message: "Access denied" });

    // Validate the request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if the role name is available (ignore the current role's name)
    if (roleName) {
      const existingRole = await Role.findOne({
        roleName: { $regex: new RegExp(`^${roleName}$`, "i") }, // Case-insensitive exact match
        _id: { $ne: roleId }, // Exclude the current role
      });

      if (existingRole) {
        throw new CustomError(400, "Role with this name already exists");
      }
    }

    // Prepare update operations
    const updateOperations = [];

    // Update role data if any fields other than rolePermissions are provided
    if (Object.keys(updateData).length > 0) {
      updateOperations.push({
        updateOne: {
          filter: { _id: roleId },
          update: { $set: updateData },
        },
      });
    }

    // Update rolePermissions if provided
    if (rolePermissions) {
      updateOperations.push({
        updateOne: {
          filter: { _id: roleId },
          update: { $set: { rolePermissions } },
        },
      });
    }

    // Update roleName if provided
    if (roleName) {
      updateOperations.push({
        updateOne: {
          filter: { _id: roleId },
          update: { $set: { roleName } },
        },
      });
    }

    // Execute bulk write operation if there are updates to be made
    if (updateOperations.length > 0) {
      await Role.bulkWrite(updateOperations);
    }

    // Fetch updated role details
    const updatedRole = await Role.findById(roleId);

    res.status(200).json({
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Delete Role ***********

const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;

    const permissionCheck = await checkPermission(req.userId, "roles", 3);
    if (!permissionCheck) return;

    if (!roleId) {
      throw new CustomError(400, "Invalid input");
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new CustomError(404, "Role not found");
    }

    await Role.deleteOne({ _id: roleId });

    // After Deleting the role assign (user) role to user
    await User.updateMany({ role: roleId }, { $set: { role: null } });
    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { newRole, updateRole, findRoles, deleteRole };
