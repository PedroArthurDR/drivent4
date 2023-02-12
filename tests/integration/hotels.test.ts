import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createTicket, createTicketType, createUser } from "../factories";
import { createEnrollmentWithAddress } from "../factories";
import { createHotel, createRoom } from "../factories/hotels-factory";
import { TicketStatus } from "@prisma/client";

const server = supertest(app);

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await cleanDb();
});

describe("get /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("should respond with status 404 if user has no enrollment", async () => {
      const token =await generateValidToken();
        
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toBe(404);
    });

    it("should respond with status 404 if user has no ticket", async () => {
      const user = await createUser();
      const token =await generateValidToken(user);
      await createEnrollmentWithAddress(user);
        
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toBe(404);
    });

    it("should respond with status 402 if ticket status isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
          
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toBe(402);
    });

    it("should respond with status 400 if ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(400);
    });

    it("Given a valid token should return all hotels and status 200", async () => {
      const user = await createUser();
      await createHotel();

      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toEqual(httpStatus.OK);
      expect(result.body).toMatchObject([{
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }]);
    });
  });
});

describe("get /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("When token is valid", () => {
    it("should respond with status 404 if hotelId isNaN", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await server.get("/hotels/isdjfios494$$").set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(400);
    });
          
    it("should respond with status 404 if hotelId dosent exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await server.get("/hotels/-1").set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(404);
    });

    it("should respond with status 400 if user has no enrollment", async () => {
      const token =await generateValidToken();
        
      const result = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
        
      expect(result.status).toBe(404);
    });

    it("should respond with status 400 if user has no ticket", async () => {
      const user = await createUser();
      const token =await generateValidToken(user);
      await createEnrollmentWithAddress(user);
        
      const result = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
        
      expect(result.status).toBe(404);
    });

    it("should respond with status 402 if ticket status isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
          
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const result = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
        
      expect(result.status).toBe(402);
    });
          
    it("should respond with status 400 if ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      console.log(ticketType);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(400);
    });
    it(" should return all hotels rooms and status 200", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment =  await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false);
      const hotel  =   await createHotel();

      await createRoom(hotel.id);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

      expect(result.body).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: [
          {
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }
        ]
      });
    });
  });
});
