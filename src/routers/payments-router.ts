import { Router } from "express";
import { getPaymentByTicketId } from "@/controllers/payments-controller";
import { authenticateToken } from "@/middlewares";
const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPaymentByTicketId)
  .post("/payments/process");

export { paymentsRouter };
