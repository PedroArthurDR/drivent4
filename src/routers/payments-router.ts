import { Router } from "express";
import { getPaymentByTicketId, postNewPayment } from "@/controllers/payments-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { paymentSchema } from "@/schemas/postpayment-schemas";
const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPaymentByTicketId)
  .post("/process", validateBody(paymentSchema), postNewPayment);

export { paymentsRouter };
