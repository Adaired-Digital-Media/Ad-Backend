import { CustomError } from "../middlewares/error";
import User from "../models/userModel";
import Role from "../models/roleModel";
import { Types } from "mongoose";

interface rolePermission {
  module: string;
  permissions: number[];
}

// Cache for role permissions
const rolePermissionsCache = new Map<Types.ObjectId, rolePermission[]>();

const checkPermission = async (
  userId: string,
  entity: string,
  action: number
): Promise<boolean> => {
  try {
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (user.isAdmin) {
      console.log("Admin is currently accessing.");
      return true;
    }

    // Fetch role permissions from cache or database
    let rolePermissions = rolePermissionsCache.get(user.role);
    if (!rolePermissions) {
      const roleInfo = await Role.findById(user.role);
      if (!roleInfo) {
        throw new CustomError(404, "Role not found");
      }
      rolePermissions = roleInfo.permissions;
      rolePermissionsCache.set(user.role, rolePermissions);
    }

    // Check if user has permission
    const hasPermission = rolePermissions.some((role: rolePermission) => {
      return role.module === entity && role.permissions.includes(action);
    });

    // Return true if user has permission
    if (hasPermission) {
      return true;
    } else {
      throw new CustomError(403, "Access denied!");
    }
  } catch (error) {
    console.error("Permission check failed:", error);
    throw new CustomError(403, "Access denied!");
  }
};

export default checkPermission;
