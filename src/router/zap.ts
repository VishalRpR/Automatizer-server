import Router from "express";
import { authMiddleware } from "../middleware";
import { ZapSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  const body = req.body;
  const parsedData = ZapSchema.safeParse(body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "incorrect inputs",
    });
    return;
  }

  await prismaClient.$transaction(async (tx) => {
    const zap = await tx.zap.create({
      data: {
        //@ts-ignore
        userId: req.id,
        triggerId: "",
        actions: {
          create: parsedData.data.actions.map((x, index) => ({
            actionId: x.availableactionId,
            sortingOrder: index,
          })),
        },
      },
    });

    const trigger = await tx.trigger.create({
      data: {
        triggerId: parsedData.data.availabletriggerId,
        zapId: zap.id,
      },
    });

    await prismaClient.zap.update({
      where: {
        id: zap.id,
      },
      data: {
        triggerId: trigger.id,
      },
    });
  });
});
router.get("/", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
    },
    include:{
        actions:{
            include:{
             type:true   
            }
        },
         trigger:{
            include:{
             type:true   
            }
        }
    }
  });

  res.json({
    zaps,
  });
});
router.post("/:zapId", authMiddleware, (req, res) => {});

export const zapRouter = router;
