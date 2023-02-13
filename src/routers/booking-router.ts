import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getBooking, postBooking, updateBooking } from "@/controllers/booking-controller";
import { bookingSchema } from "@/schemas";
const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken )
  .get("/", getBooking )
  .post("/", validateBody(bookingSchema), postBooking)
  .put("/:bookingId", validateBody(bookingSchema), updateBooking);

export { bookingRouter };
