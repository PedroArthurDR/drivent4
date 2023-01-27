import { AuthenticatedRequest } from "@/middlewares";
import ticketService from "@/services/tickets-services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getTypeOfTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const TicketType = await ticketService.getTypeTicket();
    return res.status(httpStatus.OK).send(TicketType);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send({});
  }
}

export async function getTicketsById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const TicketsFromUser = await ticketService.getAllTicketsService(userId);
    return res.status(httpStatus.OK).send(TicketsFromUser);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createNewTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const ticket = await ticketService.createTicketService({
      ...req.body,
      userId: req.userId
    });
    
    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if(error.name === "BadRequest")
      return res.sendStatus(httpStatus.BAD_REQUEST).send(error.message);
  }
}
