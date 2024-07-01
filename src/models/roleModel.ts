import mongoose, { Schema } from "mongoose";
import { RoleTypes } from "../types/roleTypes";

const roleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },
    roleDescription: {
      type: String,
      required: true,
    },
    roleStatus: {
      type: Boolean,
      required: true,
    },
    rolePermissions: [
      {
        entityName: String,
        entityValues: [Number],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model<RoleTypes>("Role", roleSchema);

export default Role;
