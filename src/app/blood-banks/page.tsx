import { prisma } from "@/lib/prisma";
import BloodBanksClient from "./BloodBanksClient";

export const revalidate = 10;

export default async function BloodBanksPage() {
  const banks = await prisma.bloodBank.findMany({
    include: {
      _count: { select: { inventory: true, bloodRequests: true } },
    },
    orderBy: { name: "asc" },
  });

  return <BloodBanksClient banks={banks} />;
}
