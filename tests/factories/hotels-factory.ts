import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: "teste",
      image: "https://http.cat/101"
    }
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "teste",
      capacity: 3,
      hotelId
    }
  });
}
