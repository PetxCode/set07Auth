import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../utils/cloudinary";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/email";

const prisma = new PrismaClient();
export const createUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.authModel.create({
      data: {
        userName,
        email,
        password: hashed,
        token,
      },
    });

    sendMail(user).then(() => {
      console.log("mail sent");
    });

    return res.status(201).json({
      message: "user created",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};

export const readUsers = async (req: Request, res: Response) => {
  try {
    const user = await prisma.authModel.findMany({});

    return res.status(200).json({
      message: "users found",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error finding user",
    });
  }
};

export const readUserOne = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await prisma.authModel.findUnique({
      where: { id: userID },
    });

    return res.status(200).json({
      message: "user found",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error finding user",
    });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { userName } = req.body;

    const user = await prisma.authModel.update({
      where: { id: userID },
      data: { userName },
    });

    return res.status(201).json({
      message: "user info updated",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error updating user",
    });
  }
};

export const updateUserAvatar = async (req: any, res: Response) => {
  try {
    const { userID } = req.params;

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path
    );

    const user = await prisma.authModel.update({
      where: { id: userID },
      data: { avatar: secure_url, avatarID: public_id },
    });

    return res.status(201).json({
      message: "user avatar updated",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error updating user",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await prisma.authModel.delete({
      where: { id: userID },
    });

    return res.status(201).json({
      message: "user deleted",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error deleting user",
    });
  }
};

export const signUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.authModel.findUnique({
      where: { email },
    });

    if (user) {
      const check = await bcrypt.compare(password, user.password);
      if (check) {
        if (user.verified && user.token === "") {
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
            },
            "secret",
            {
              expiresIn: "3d",
            }
          );

          req.headers.authorization = `Bearer ${token}`;

          return res.status(201).json({
            message: `welcome back ${user.userName}`,
            data: token,
          });
        } else {
          return res.status(404).json({
            message: "Please check your email for verification",
          });
        }
      } else {
        return res.status(404).json({
          message: "Password isn't correct",
        });
      }
    } else {
      return res.status(404).json({
        message: "User does not exist",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error with your EndPoint",
    });
  }
};

export const verifiedUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const user = await prisma.authModel.update({
      where: { id: userID },
      data: {
        verified: true,
        token: "",
      },
    });

    return res.status(200).json({
      message: "user has now been verify",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying user",
    });
  }
};

export const resetUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const token = crypto.randomBytes(36).toString("hex");

    const user = await prisma.authModel.update({
      where: { email },
      data: {
        token,
      },
    });

    return res.status(201).json({
      message: "user reset request has been made",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error resetting user password",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { password } = req.body;

    const user = await prisma.authModel.findUnique({
      where: { id: userID },
    });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    if (user?.verified && user.token !== "") {
      await prisma.authModel.update({
        data: { password: hashed, token: "" },
        where: { id: userID },
      });
    }
    return res.status(201).json({
      message: "user password has been changed",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error changing user password",
    });
  }
};
