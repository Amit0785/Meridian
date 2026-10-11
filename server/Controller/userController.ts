import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { userModel } from "../schema/userschema";
import {
  AuthService,
  registerUser as registerUserService,
  loginUser as loginUserService,
  refreshUserTokens,
  socialLoginUser,
} from "../Services/authService";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/auth";
import { notificationCenter } from "../notificationEvents";
import { catchAsync } from "../utils/catchAsync";
import { status } from "../utils/status";

/**
 * Register a new user
 */
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const result = await AuthService.register({
    name,
    email,
    password,
    userRole: role,
  });

  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  notificationCenter.broadcast({
    type: "system",
    title: "New Member Joined",
    message: `${result.user.name} registered a new account on Meridian.`,
  });

  res.status(status.CREATED).json({
    success: true,
    statusCode: status.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

/**
 * Sign in user and issue JWT access + refresh token
 */
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password, userRole } = req.body;
  const query: Record<string, any> = { email: email?.toLowerCase() };
  if (userRole) {
    query.userRole = userRole;
  }

  const user = await userModel.findOne(query);
  if (!user) {
    res.status(status.NOT_FOUND).json({ message: "User does not exist" });
    return;
  }

  // Hash the password comparison
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password || (user as any).passwordHash || "",
  );
  if (!isPasswordValid) {
    res.status(status.UNAUTHORIZED).json({ message: "Invalid credentials" });
    return;
  }

  const userObj = typeof user.toObject === "function" ? user.toObject() : user;
  const {
    password: _,

    ...UserWithoutPassword
  } = userObj;

  const accessToken = generateToken({
    _id: user._id.toString(),
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    _id: user._id.toString(),
    email: user.email,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const responseData = {
    user: UserWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: "15m",
    },
  };

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "User login successfully",
    data: responseData,
    user: UserWithoutPassword,
    accessToken,
    refreshToken,
  });
});

/**
 * Logout user and clear authentication cookies
 */
export const logoutUser = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "User logged out successfully",
    data: null,
  });
});

/**
 * Refresh JWT access token using valid refresh token
 */
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token =
    req.body?.refreshToken ||
    req.body?.token ||
    (typeof req.headers["x-refresh-token"] === "string"
      ? req.headers["x-refresh-token"]
      : undefined) ||
    req.cookies?.refreshToken;

  if (!token) {
    res.status(status.BAD_REQUEST).json({
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Refresh token is required",
      error: { code: "REFRESH_TOKEN_REQUIRED" },
    });
    return;
  }

  const result = await AuthService.refresh(token);

  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "Session refreshed successfully",
    data: result,
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

/**
 * Get current authenticated user profile
 */
export const getMe = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      data: {
        user: req.user,
      },
    });
  },
);

/**
 * Single Sign-On via Google or Facebook OAuth
 */
export const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const { provider, name, email, avatar, token } = req.body;
  const result = await AuthService.socialLogin({
    provider,
    name,
    email,
    avatar,
    token,
  });

  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: `Authenticated via ${provider.toUpperCase()}`,
    data: result,
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

// Backward-compatible named aliases
export const register = registerUser;
export const login = loginUser;
export const logout = logoutUser;
export const me = getMe;

// Compatibility controller object
export const UserController = {
  registerUser,
  register: registerUser,
  loginUser,
  login: loginUser,
  logoutUser,
  logout: logoutUser,
  refreshToken,
  getMe,
  me: getMe,
  socialLogin,
};

export const AuthController = UserController;
export default UserController;
