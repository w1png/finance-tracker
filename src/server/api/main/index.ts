import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { templateRouter } from "./routers/template";
import { receiptRouter } from "./routers/receipt";
import { fileRouter } from "./routers/file";
import { userRouter } from "./routers/user";
import { statRouter } from "./routers/stat";

export const router = createTRPCRouter({
  template: templateRouter,
  receipt: receiptRouter,
  file: fileRouter,
  user: userRouter,
  stat: statRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
