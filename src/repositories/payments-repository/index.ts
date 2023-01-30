import { prisma } from "@/config";

export async function findByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId },
  });
}

export async function createNewPaymentRepository(newpayment: createpayment) {
  return  prisma.payment.create({
    data: newpayment
  });
}

const paymentsRepository= {
  findByTicketId,
  createNewPaymentRepository
};

type createpayment = {
    ticketId: number,
    value: number,
    cardIssuer: string,
    cardLastDigits: string
}
export default paymentsRepository;
