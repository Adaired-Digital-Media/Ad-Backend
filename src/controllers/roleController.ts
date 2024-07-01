import Role from "../models/roleModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";

// Create a new role
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

// Update Role

const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "roles", 1);
    if (!permissionCheck) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    const { roleId, roleName, rolePermissions, ...updateData } = req.body;

    // Check role name availability
    if (roleName) {
      const existingRole = await Role.findOne({
        roleName: { $regex: roleName, $options: "i" },
        _id: { $ne: roleId },
      });
      if (existingRole) {
        throw new CustomError(400, "Role with this name already exists");
      }
    }

    // Prepare update operations
    const updateOperations = [];
    if (Object.keys(updateData).length > 0) {
      updateOperations.push({
        updateOne: {
          filter: { _id: roleId },
          update: { $set: updateData },
        },
      });
    }

    if (rolePermissions) {
      updateOperations.push({
        updateOne: {
          filter: { _id: roleId },
          update: { $set: { rolePermissions } },
        },
      });
    }

    // Execute bulk write operation
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

// Find Roles
const findRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "roles", 2);
    if (!permissionCheck) return;
    const { roleId } = req.body;
    if (roleId) {
      const role = await Role.find({ _id: roleId });
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

// Delete Role

const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionCheck = await checkPermission(req.userId, "roles", 3);
    if (!permissionCheck) return;

    const { roleId } = req.body;
    if (!roleId) {
      throw new CustomError(400, "Invalid input");
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new CustomError(404, "Role not found");
    }

    await Role.deleteOne({ _id: roleId });
    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { newRole, updateRole, findRoles, deleteRole };
