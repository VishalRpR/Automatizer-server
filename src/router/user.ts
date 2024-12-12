import Router, { RequestHandler } from "express";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { authMiddleware } from "../middleware";

const router = Router();
const signupHandler: RequestHandler = async (req, res) => {
  console.log(req.body);

  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });

    return;
  }

  const userExist = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (userExist) {
    res.status(403).json({ message: "User already exists" });
    return;
  }

  await prismaClient.user.create({
    data: {
      name: parsedData.data.name,
      email: parsedData.data.email,
      password: parsedData.data.password,
    },
  });

  res.json({ message: "Please Verify your email" });
};

router.post("/signup", signupHandler);

const signinHandler: RequestHandler = async (req, res) => {
  console.log(req.body);

  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    res.status(403).json({
      message: "Incorrect credentials",
    });

    return;
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  console.log("signed in");
  res.json({ token });
};

router.post("/signin", signinHandler);

router.get("/", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id: id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  res.json({
    user:user,
  });
});

export const userRouter = router;
