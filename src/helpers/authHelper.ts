import { CustomError } from "../middlewares/error";
import User from "../models/userModel";
import Role from "../models/roleModel";
import { Types } from "mongoose";
import { RoleTypes } from "../types/roleTypes";

interface rolePermission {
  module: string;
  permissions: number[];
}

const rolePermissionsCache = new Map<Types.ObjectId, rolePermission[]>();

export const checkPermission = async (
  userId: string,
  entity: string,
  action: number
): Promise<boolean> => {
  try {
    const user = await User.findById(userId).populate<{role:RoleTypes}>("role");
    if (!user) throw new CustomError(404, "User not found");

    // Admin has all permissions
    if (user.isAdmin) return true;

    // Check if user has customer role
    const isCustomer = user?.role?.name === "customer";
    
    // Customers can only create tickets (action 0) by default
    if (isCustomer && entity === "tickets" && action === 0) return true;

    // For non-customers, check role permissions
    if (!user.role || !Types.ObjectId.isValid(user.role._id)) {
      throw new CustomError(403, "Invalid role configuration");
    }

    const rolePermissions = await getRolePermissions(user.role._id);
    return rolePermissions.some((role: rolePermission) => 
      role.module === entity && role.permissions.includes(action)
    );
  } catch (error) {
    console.error("Permission check failed:", error);
    throw new CustomError(403, "Access denied");
  }
};

const getRolePermissions = async (roleId: Types.ObjectId) => {
  if (rolePermissionsCache.has(roleId)) {
    return rolePermissionsCache.get(roleId)!;
  }

  const roleInfo = await Role.findById(roleId);
  if (!roleInfo) throw new CustomError(404, "Role not found");

  rolePermissionsCache.set(roleId, roleInfo.permissions);
  return roleInfo.permissions;
};

export const getUserRoleType = async (userId: string) => {
  const user = await User.findById(userId).populate<{ role: RoleTypes }>("role");
  if (!user) throw new CustomError(404, "User not found");

  if (user.isAdmin) return "admin";
  if (user.role?.name === "customer" || user.role === null) return "customer";
  return "support";
};


// import { CustomError } from "../middlewares/error";
// import User from "../models/userModel";
// import Role from "../models/roleModel";
// import { Types } from "mongoose";

// interface rolePermission {
//   module: string;
//   permissions: number[];
// }

// // Cache for role permissions
// const rolePermissionsCache = new Map<Types.ObjectId, rolePermission[]>();

// const checkPermission = async (
//   userId: string,
//   entity: string,
//   action: number
// ): Promise<boolean> => {
//   try {
//     // Check if user is admin
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new CustomError(404, "User not found");
//     }
//     if (user.isAdmin) {
//       console.log("Admin is currently accessing.");
//       return true;
//     }

//     // Fetch role permissions from cache or database
//     let rolePermissions = rolePermissionsCache.get(user.role);
//     if (!rolePermissions) {
//       const roleInfo = await Role.findById(user.role);
//       if (!roleInfo) {
//         throw new CustomError(404, "Role not found");
//       }
//       rolePermissions = roleInfo.permissions;
//       rolePermissionsCache.set(user.role, rolePermissions);
//     }

//     // Check if user has permission
//     const hasPermission = rolePermissions.some((role: rolePermission) => {
//       return role.module === entity && role.permissions.includes(action);
//     });

    
//     // Return true if user has permission
//     if (hasPermission) {
//       return true;
//     } else {
//       throw new CustomError(403, "Access denied!");
//     }
//   } catch (error) {
//     console.error("Permission check failed:", error);
//     throw new CustomError(403, "Access denied!");
//   }
// };

// export default checkPermission;
