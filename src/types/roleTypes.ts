export type RoleTypes = {
  roleName: string;
  roleDescription: string;
  roleStatus: boolean;
  rolePermissions: { entityName: string; entityValues: number[] }[];
};
