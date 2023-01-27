import paymentsRepository from "@/repositories/payments-repository";
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
