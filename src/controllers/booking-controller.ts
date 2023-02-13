import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try{
    const booking = await bookingService.listBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  }
  catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try{
    const booking = await bookingService.insertBooking(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  }
  catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const{ roomId } = req.body;
  const { bookingId } = req.params;
  const { userId } = req;
  try{
    const booking = await bookingService.changeBooking(userId, roomId, Number(bookingId));
    return res.status(httpStatus.OK).send({ roomId: booking.id });
  }
  catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
