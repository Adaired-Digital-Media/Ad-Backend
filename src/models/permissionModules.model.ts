import mongoose, { Schema } from "mongoose";
import { PermissionModuleType } from "../types/permissionModule.types";
const permissionModuleSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

const PermissionModule = mongoose.model<PermissionModuleType & Document>(
  "PermissionModule",
  permissionModuleSchema
);

export default PermissionModule;
