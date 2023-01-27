import { Router } from "express";
import { getPaymentByTicketId } from "@/controllers/payments-controller";
import { authenticateToken } from "@/middlewares";
const paymentsRouter = Router();

paymentsRouter
  .get("/", authenticateToken, getPaymentByTicketId)
  .post("/payments/process");

export { paymentsRouter };
