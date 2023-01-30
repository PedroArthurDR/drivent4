import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";

import ticketRepository from "@/repositories/ticket-repository";
import { TicketType, Ticket } from "@prisma/client";
import httpStatus from "http-status";

async function getTypeTicket(): Promise<TicketType[]> {
  const result = await ticketRepository.getTicketByType();
  if (!result) {
    return [];
  }
  return result;
}

async function getAllTicketsService(id: number) {
  const result = await ticketRepository.getAllTickets(id);

  if (!result) {
    throw notFoundError();
  }
  return result;
}

type ticketBody = {
  ticketTypeId: number,
  userId: number
};

async function createTicketService(body: ticketBody) {
  if (!body.ticketTypeId) {
    return httpStatus.BAD_REQUEST;
  }
  const enrollment = await enrollmentRepository.findByUserId(body.userId);
  if(!enrollment) {
    return httpStatus.NOT_FOUND;
  }
  const TicketToCreate = {
    ticketTypeId: body.ticketTypeId,
    enrollmentId: enrollment.id
  };
  console.log("RODANDO CREATE");
  const result = await ticketRepository.createATicket(TicketToCreate);
  console.log(result);
  return result;
}

const ticketService = {
  getTypeTicket,
  getAllTicketsService,
  createTicketService
};

export default ticketService;
