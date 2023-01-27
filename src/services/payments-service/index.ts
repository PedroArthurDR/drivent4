import paymentsRepository from "@/repositories/payments-repository";
import { notFoundError, requestError, invalidDataError } from "@/errors";
import { exclude } from "@/utils/prisma-utils";
import httpStatus from "http-status";
export async function getPaymentById(ticketId: number, userId: number) {
  const paymentWithTicketId = await paymentsRepository.findByTicketId(ticketId);

  if (!paymentWithTicketId ) {
    return httpStatus.NOT_FOUND;
  }
  if(!ticketId) {
    return httpStatus.BAD_REQUEST;
  }

  return paymentWithTicketId;
}
