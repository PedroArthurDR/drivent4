import { prisma } from "@/config";

async function getTicketByType() {
  return prisma.ticketType.findMany();
}
async function getTicketById(id: number) {
  return await prisma.ticket.findFirst({
    where: { id }
  });
}

async function getAllTickets(id: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: id
      }
    },
    include: {
      TicketType: true
    }
  });
}

async function createATicket( ticketTypeId: number, userId: number ) {
  return prisma.ticket.create({
    data: {
      status: "RESERVED",
      TicketType: {
        connect: { id: ticketTypeId },
      },
      Enrollment: {
        connect: { id: userId },
      },
    },
    include: {
      TicketType: true,
    }
  });
}

const ticketRepository = {
  getTicketByType,
  getAllTickets,
  createATicket,
  getTicketById
};

export default ticketRepository;
