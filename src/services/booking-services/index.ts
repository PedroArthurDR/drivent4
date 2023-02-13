import { forbidenError, notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function listBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw forbidenError();
  }
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) {
    throw notFoundError();
  }
  const finalBooking ={
    id: booking.id,
    Room: {
      id: booking.Room.id,
      name: booking.Room.name,
      capacity: booking.Room.capacity,
      hotelId: booking.Room.hotelId,
      createdAt: booking.Room.createdAt,
      updatedAt: booking.Room.updatedAt
    }
  };
  console.log(booking);
  return finalBooking;
}

async function insertBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw forbidenError();
  }
  if(ticket.status !== "PAID") {
    throw forbidenError();
  }
  const ticketType = await ticketRepository.findTicketTypeBy(ticket.ticketTypeId);
  const room = await roomRepository.getRoomById(roomId);
  if(ticketType.isRemote || !ticketType.includesHotel) {
    throw forbidenError();
  }
  if(!room) {
    throw notFoundError();
  }
  if(room.Booking.length === room.capacity) {
    throw forbidenError();
  }
  const book =  await bookingRepository.insertBooking(userId, roomId);
  return book;
}

async function changeBooking(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
    
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw forbidenError();
  }
  if(ticket.status !== "PAID") {
    throw forbidenError();
  }
  const ticketType = await ticketRepository.findTicketTypeBy(ticket.ticketTypeId);
  const room = await roomRepository.getRoomById(roomId);
  if(!ticketType.includesHotel) {
    throw forbidenError();
  }
  if(!room) {
    throw notFoundError();
  }
  if(room.Booking.length === room.capacity) {
    throw forbidenError();
  }
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) {
    throw forbidenError();
  }
  const bookByUser = await bookingRepository.bookBelongToUser(userId, bookingId);
  if(!bookByUser) {
    throw forbidenError();
  }
  const book = await bookingRepository.updateBookingById(bookingId, roomId);
  return book;
}

const bookingService = {
  listBooking,
  insertBooking,
  changeBooking
};

export default bookingService;
