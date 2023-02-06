import hotelsServices from "@/services/hotels-service";
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const userId: number = req.userId;
  try {
    const event = await  hotelsServices.getAllHotelsServices(userId);
    return res.status(httpStatus.OK).send(event);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "PaymentRequiredError") return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getRoomByHotelId(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const hotellId  = Number(req.params.hotelId);
  try {
    const event = await  hotelsServices.getByHotelIdServices(userId, hotellId);
    return res.status(httpStatus.OK).send(event);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "PaymentRequiredError") return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
