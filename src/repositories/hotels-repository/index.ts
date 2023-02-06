import { prisma } from "@/config";

export async function findAllHotels() {
  return prisma.hotel.findMany();
}

export async function findRoomByHotelId(hotellId: number) {
  return prisma.hotel.findUnique({
    where: { id: hotellId },
    include: {
      Rooms: true
    }
  });
}

const hotelsRepository = {
  findAllHotels,
  findRoomByHotelId
};

export default hotelsRepository;
