import paymentsRepository, { createNewPaymentRepository } from "@/repositories/payments-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import httpStatus from "http-status";
export async function getPaymentById(ticketId: number, userId: number) {
  const paymentWithTicketId = await paymentsRepository.findByTicketId(ticketId);

  const ticket = await  ticketRepository.getTicketById(ticketId);
  if (!ticket) return httpStatus.NOT_FOUND;

  const enrollment = await enrollmentRepository.findByUserId(userId);
  if(ticket.enrollmentId !== enrollment.id) {
    return httpStatus.UNAUTHORIZED;
  }
  return paymentWithTicketId;
}

export async function createNewPayment(body: newPayment, userId: number) {
  const { ticketId, cardData } = body;

  const ticket = await  ticketRepository.getTicketById(ticketId);
  if (!ticket) return httpStatus.NOT_FOUND;

  const enrollment = await enrollmentRepository.findByUserId(userId);
  if(ticket.enrollmentId !== enrollment.id) {
    return httpStatus.UNAUTHORIZED;
  }
  const tickettype = await ticketRepository.getTicketTypeById(ticket.ticketTypeId);
  const newpayment = {
    ticketId,
    value: tickettype.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.slice(-4)
  };
  const updateStatus = await ticketRepository.updateTicketById(ticketId);
  return await createNewPaymentRepository(newpayment);
}

type newPayment = {
  ticketId: number,
  cardData: {
		issuer: string,
    number: string,
    name: string,
    expirationDate: string,
    cvv: string
	}
}
