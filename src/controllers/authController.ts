import { BASE_DOMAIN } from "../utils/globals";
import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../middlewares/error";
import Cart from "../models/cartModel";
import { sendEmail } from "../utils/mailer";
import { validateInput } from "../utils/validateInput";
import Role from "../models/roleModel";

// Token generation utilities
const generateAccessToken = (userId: string): string =>
  jwt.sign({ _id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

const generateRefreshToken = (userId: string): string =>
  jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });

// ***************************************
// ********** Register User **************
// ***************************************
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      image,
      name,
      email,
      password,
      role,
      contact,
      status,
      googleId,
    } = req.body;

    // Validate user input
    if (!validateInput(req, res)) return;

    // Check if required fields are present
    if (!name || !email) {
      throw new CustomError(400, "Name and Email are required");
    }

    // Check for existing user with lean for speed
    if (await User.findOne({ email }).lean()) {
      throw new CustomError(400, "User already exists");
    }

    // Hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Create user with all fields in one go
    const user = new User({
      name,
      email: email.toLowerCase(),
      userName: email.split("@")[0].toLowerCase(),
      ...(image && { image }),
      ...(role && { role }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(contact && { contact }),
      ...(status && { status }),
      ...(googleId && { googleId }),
    });

    // Set admin status for first user
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      user.isAdmin = true;
      user.role = null;
    }

    // Create cart and assign in one operation
    const cart = new Cart({
      userId: user._id,
      products: [],
      totalQuantity: 0,
      totalPrice: 0,
    });
    user.cart = cart._id;

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;

    if (role && userCount !== 0) {
      const roleDoc = await Role.findById(role);
      if (!roleDoc) {
        throw new CustomError(404, "Role not found");
      }
      roleDoc.users = roleDoc.users || [];
      roleDoc.users.push(user._id);
      await roleDoc.save();
    }

    // Save user and cart in parallel
    await Promise.all([user.save(), cart.save()]);

    // Send verification email asynchronously
    sendVerificationEmail(user._id.toString()).catch((err) =>
      console.error("Email sending failed:", err)
    );

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ************* Login User **************
// ***************************************
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!validateInput(req, res)) return;

    // Fetch user with password and lean for speed
    const user = await User.findOne({ email }).select("+password").lean();
    if (!user) {
      throw new CustomError(400, "User with this email does not exist.");
    }

    // Verify password
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new CustomError(401, "Incorrect Password!");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken =
      user.refreshToken &&
      jwt.verify(user.refreshToken, process.env.JWT_REFRESH_SECRET as string)
        ? user.refreshToken
        : generateRefreshToken(user._id.toString());

    // Update refresh token if necessary (minimal DB write)
    if (refreshToken !== user.refreshToken) {
      await User.updateOne({ _id: user._id }, { refreshToken });
    }

    // Fetch user data with role in one query
    const userData = await User.findById(user._id)
      .populate("role", "name permissions")
      .lean();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Login failed")
    );
  }
};

// ***************************************
// ********** Refresh Token **************
// ***************************************
const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError(401, "No token provided");
    }

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;
    const user = await User.findById(decoded._id).select("refreshToken").lean();
    if (!user || user.refreshToken !== refreshToken) {
      throw new CustomError(401, "Invalid refresh token");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Update refresh token in one operation
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Token refresh failed")
    );
  }
};

// ***************************************
// ************ Logout User **************
// ***************************************
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;

    // Clear refresh token in one update
    await User.updateOne({ _id: userId }, { refreshToken: null });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Logout failed")
    );
  }
};

// ***************************************
// ********** Forgot Password ************
// ***************************************
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("name email").lean();
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" } // Token expires in 10 minutes
    );
    const resetLink = `${BASE_DOMAIN}/auth/reset-password?token=${resetToken}`;

    // Send email asynchronously
    sendEmail(
      user.email,
      "Password Reset",
      `<p>Hi ${user.name},</p><p>Please click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    ).catch((err) => console.error("Email sending failed:", err));

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Password reset failed")
    );
  }
};

// ***************************************
// ********** Reset Password *************
// ***************************************
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { currentPassword, newPassword, resetToken } = req.body;
    let user;
    if (userId) {
      // Logged-in user resetting password
      user = await User.findById(userId).select("+password");
      if (!user) throw new CustomError(404, "User not found");

      if (
        !currentPassword ||
        !(await bcrypt.compare(currentPassword, user.password))
      ) {
        throw new CustomError(400, "Current password is incorrect");
      }

      // Check if newPassword is the same as currentPassword
      if (await bcrypt.compare(newPassword, user.password)) {
        throw new CustomError(400, "New password cannot be the same as the current password");
      }
    } else if (resetToken) {
      // Reset via token
      const decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      user = await User.findOne({ email: decoded.email });
      if (!user) throw new CustomError(404, "User not found");
    } else {
      throw new CustomError(400, "Missing userId or resetToken");
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshToken = null; // Invalidate refresh token
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Password reset failed")
    );
  }
};

// ***************************************
// ****** Send Verification Email ********
// ***************************************
const sendVerificationEmail = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
    .select("name email isVerifiedUser")
    .lean();
  if (!user) throw new CustomError(404, "User not found");
  if (user.isVerifiedUser) throw new CustomError(400, "User already verified");

  const verificationToken = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "10m",
    }
  );
  const verificationLink = `${BASE_DOMAIN}/auth/verify?token=${verificationToken}`;

  await sendEmail(
    user.email,
    "Verify Your Email",
    `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a><p>This link will expire in 10 minutes.</p>`
  );
};

// ***************************************
// *********** Verify Email **************
// ***************************************
const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token) throw new CustomError(400, "Verification token required");

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string };
    const user = await User.findOne({ email: decoded.email });

    if (!user) throw new CustomError(404, "User not found");
    if (user.isVerifiedUser)
      throw new CustomError(400, "User already verified");

    user.isVerifiedUser = true;
    await user.save();

    res.status(200).json({
      message: "User verified successfully. You can now close this tab.",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      next(new CustomError(400, "Verification token has expired."));
    } else if (error instanceof Error) {
      next(new CustomError(500, error.message));
    }
  }
};

export {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyUser,
};
