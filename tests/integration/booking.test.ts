import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import supertest = require("supertest");
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { createUser, createEnrollmentWithAddress, createTicketTypeRemote, createTicket, createBooking, createTicketType, createRoomWithHotelId, createHotel, createTicketTypeWithHotel, createRoomWithCapacity } from "../factories";
beforeAll(async () => {
  await init();
});
  
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("get /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  describe("when token is valid", () => {
    it("should respond with status 404 when user dosent have enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when user dosent have a ticket ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("shoul respond with status 404 if user dosent have a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 and bookings", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const createdBooking = await createBooking(user.id, room.id);
        
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.OK);
  
      expect(response.body).toEqual(
        {
          id: createdBooking.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString()
          }
        }
      );
    });
  });
});

describe("post /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user dosent have enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: 0 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when user dosent have a ticket ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const body = { roomId: 0 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 0 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user ticketType dosent includeHotel ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 0 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user ticketType is not paid ", async () => {
      const body = { roomId: 0 };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 404 when room dosent exists ", async () => {
      const body = { roomId: 0 };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when room is full ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 1);
      const body = { roomId: room.id };
      const booking = await createBooking(user.id, room.id);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and BookingId ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 3);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});

describe("put /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/0");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user dosent have enrollment ", async () => {
      const user = await createUser();
      const body = { roomId: 0 };
      const token = await generateValidToken(user);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when user dosent have a ticket ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const body = { roomId: 0 };
    
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user ticketType dosent includeHotel ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 0 };

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user ticketType is not paid ", async () => {
      const body = { roomId: 0 };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 404 when room dosent exists ", async () => {
      const body = { roomId: 0 };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when room is full ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 1);
      const body = { roomId: room.id };
      const booking = await createBooking(user.id, room.id);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when user dosent have a booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 3);
      const body = { roomId: room.id };
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 when booking dosent belongs to user ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 3);
      const body = { roomId: room.id };

      const booking = await createBooking(user.id, room.id);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and roomId ", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id, 3);
      const body = { roomId: room.id };

      const booking = await createBooking(user.id, room.id);
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        roomId: expect.any(Number)
      });
    });
  });
});
