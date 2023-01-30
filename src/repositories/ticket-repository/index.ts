import { prisma } from "@/config";

async function getTicketByType() {
  return prisma.ticketType.findMany();
}

async function getTicketTypeById(id: number) {
  return await prisma.ticketType.findFirst({
    where: { id }
  });
}

async function getTicketById(id: number) {
  return await prisma.ticket.findFirst({
    where: { id }
  });
}

async function updateTicketById(id: number) {
  return await prisma.ticket.update({
    where: {
      id
    },
    data: {
      status: "PAID",
    },
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

async function createATicket(TicketToCreate: TicketCreate) {
  const { ticketTypeId, enrollmentId } = TicketToCreate;
  
  return prisma.ticket.create({
    data: {
      TicketType: {
        connect: { id: ticketTypeId },
      },
      Enrollment: {
        connect: { id: enrollmentId },
      },
      status: "RESERVED",
    },
    include: {
      TicketType: true,
    },
  });
}
export type TicketCreate = {
  ticketTypeId: number;
  enrollmentId: number;
};

const ticketRepository = {
  getTicketByType,
  getAllTickets,
  createATicket,
  getTicketById,
  getTicketTypeById,
  updateTicketById
};

export default ticketRepository;
