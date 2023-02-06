import { notFoundError, unauthorizedError, requestError, paymentRequiredError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";
import  { BAD_REQUEST } from "http-status";

async function getAllHotelsServices(userId: number) {
  const allHotels = await hotelsRepository.findAllHotels();
  if (!allHotels) {
    throw notFoundError();
  }
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw notFoundError();
  }
  if(ticket.status!==TicketStatus.PAID)   throw paymentRequiredError();

  const ticketType = await ticketRepository.findTicketTypeBy(ticket.ticketTypeId);

  if(ticketType.isRemote === true) {
    throw BAD_REQUEST;
  }
  return allHotels;
}

async function getByHotelIdServices(userId: number, hotellId: number) {
  if(isNaN(hotellId)) {
    throw BAD_REQUEST;
  }
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw notFoundError();
  }
  if(ticket.status!==TicketStatus.PAID)   throw paymentRequiredError();
  const ticketType = await ticketRepository.findTicketTypeBy(ticket.ticketTypeId);
  if(ticketType.isRemote === true) {
    console.log(ticketType.isRemote, "CAIU NO TRUE");
    throw BAD_REQUEST;
  }
  const hotels = await hotelsRepository.findRoomByHotelId(hotellId);
  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

const hotelsServices = {
  getAllHotelsServices,
  getByHotelIdServices
};

export default hotelsServices;
