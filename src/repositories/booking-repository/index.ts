import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    },
    include: {
      Room: true
    }
  });
}
async function findById(bookingId: number) {
  return prisma.booking.findUnique({
    where: { id: bookingId }
  });
}
async function insertBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function updateBookingById(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      roomId
    }
  });
}

async function bookBelongToUser(userId: number, bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId
    }
  });
}

const bookingRepository = {
  findBooking,
  insertBooking,
  updateBookingById,
  bookBelongToUser,
  findById
};

export default bookingRepository;
