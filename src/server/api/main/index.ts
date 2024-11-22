import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { receiptRouter } from "./routers/receipt";
import { fileRouter } from "./routers/file";
import { statRouter } from "./routers/stat";

export const router = createTRPCRouter({
  receipt: receiptRouter,
  file: fileRouter,
  stat: statRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
