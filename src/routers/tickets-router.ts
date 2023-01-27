import { Router } from "express";
import { createNewTicket, getTicketsById, getTypeOfTicket } from "@/controllers";
import { authenticateToken } from "@/middlewares";

const ticketsRouter = Router();
ticketsRouter
  .use(authenticateToken)
  .get("/", getTicketsById)
  .get("/types", getTypeOfTicket)
  .post("/", createNewTicket);

export { ticketsRouter };
