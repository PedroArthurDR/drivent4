import { getPaymentById } from "@/services/payments-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: Request, res: Response) {
  const { ticketId } = req.body;
  const { userId } = req.body;
  if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);
  try{
    const paymentById = await getPaymentById(ticketId, userId);
    return res.status(httpStatus.OK).send(paymentById);
  }
  catch(error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}