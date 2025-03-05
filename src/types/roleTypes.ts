import { Types } from "mongoose";

export interface RoleTypes {
  name: string;
  description?: string;
  status: boolean;
  permissions: Array<{
    module: string;
    permissions: number[];
  }>;
  users: Array<Types.ObjectId>;
}
