import { prisma } from "@/config";

export async function findByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId },
  });
}

const paymentsRepository= {
  findByTicketId,
};

export default paymentsRepository;
