export type UserTypes = {
  name: string;
  userName: string;
  email: string;
  password: string;
  contact: string;
  isAdmin: boolean;
  role: string;
  cart: { product: string; quantity: number }[];
  orders: string[];
  userStatus: boolean;
};
