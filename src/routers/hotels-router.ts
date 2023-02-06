import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getAllHotels, getRoomByHotelId } from "@/controllers/hotels-controller";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getAllHotels)
  .get("/:hotelId",  getRoomByHotelId);

export { hotelsRouter };
