import { createNewPayment, getPaymentById } from "@/services/payments-service";
import { AuthenticatedRequest } from "@/middlewares";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.query;
  if(!ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  const { userId } = req.body;
  try{
    const paymentById = await getPaymentById(+ticketId, userId);
    return res.send(paymentById);
  }
  catch(error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function postNewPayment(req: AuthenticatedRequest, res: Response) {
  try{
    const newPayment = await createNewPayment(req.body, req.userId);
    return res.send(newPayment).status(200);
  }
  catch(error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
