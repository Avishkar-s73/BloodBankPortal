/* eslint-disable no-console */
/**
 * Database Seed Script
 *
 * This script populates the database with initial data for testing
 * Run: npm run prisma:seed
 */

import { PrismaClient, UserRole, BloodGroup, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bloodbank.com" },
    update: {},
    create: {
      email: "admin@bloodbank.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      firstName: "System",
      lastName: "Administrator",
      phone: "+919876543210",
      city: "Mumbai",
      state: "Maharashtra",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create Blood Banks
  const bloodBank1 = await prisma.bloodBank.upsert({
    where: { email: "contact@centralbloodbank.com" },
    update: {},
    create: {
      name: "Central Blood Bank",
      registrationNo: "BB-MH-001-2024",
      email: "contact@centralbloodbank.com",
      phone: "+912226789012",
      address: "123 Main Street, Andheri",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      latitude: 19.1136,
      longitude: 72.8697,
      operatingHours: "24/7",
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Blood Bank created:", bloodBank1.name);

  const bloodBank2 = await prisma.bloodBank.upsert({
    where: { email: "info@lifesaverbloodbank.com" },
    update: {},
    create: {
      name: "Lifesaver Blood Bank",
      registrationNo: "BB-DL-002-2024",
      email: "info@lifesaverbloodbank.com",
      phone: "+911126543210",
      address: "456 MG Road, Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      latitude: 28.6304,
      longitude: 77.2177,
      operatingHours: "8 AM - 8 PM",
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Blood Bank created:", bloodBank2.name);

  // Create Blood Inventory for Blood Bank 1
  const bloodGroups = [
    BloodGroup.A_POSITIVE,
    BloodGroup.A_NEGATIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.B_NEGATIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.AB_NEGATIVE,
    BloodGroup.O_POSITIVE,
    BloodGroup.O_NEGATIVE,
  ];

  for (const bloodGroup of bloodGroups) {
    await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId: bloodBank1.id,
          bloodGroup: bloodGroup,
        },
      },
      update: {},
      create: {
        bloodBankId: bloodBank1.id,
        bloodGroup: bloodGroup,
        quantity: Math.floor(Math.random() * 50) + 20, // Random quantity between 20-70
        minimumQuantity: 10,
        maximumQuantity: 100,
      },
    });
  }
  console.log("✅ Blood inventory created for:", bloodBank1.name);

  // Create Blood Inventory for Blood Bank 2
  for (const bloodGroup of bloodGroups) {
    await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId: bloodBank2.id,
          bloodGroup: bloodGroup,
        },
      },
      update: {},
      create: {
        bloodBankId: bloodBank2.id,
        bloodGroup: bloodGroup,
        quantity: Math.floor(Math.random() * 50) + 15, // Random quantity between 15-65
        minimumQuantity: 10,
        maximumQuantity: 100,
      },
    });
  }
  console.log("✅ Blood inventory created for:", bloodBank2.name);

  // Create Hospitals
  const hospital1 = await prisma.hospital.upsert({
    where: { email: "contact@cityhospital.com" },
    update: {},
    create: {
      name: "City General Hospital",
      registrationNo: "HOSP-MH-001-2024",
      email: "contact@cityhospital.com",
      phone: "+912227890123",
      emergencyPhone: "+912227890100",
      address: "789 Hospital Road, Bandra",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      latitude: 19.0596,
      longitude: 72.8295,
      totalBeds: 500,
      hasBloodBank: false,
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Hospital created:", hospital1.name);

  // Create Additional Hospitals for Alternative Sources Feature
  const hospital2 = await prisma.hospital.upsert({
    where: { email: "info@apollohospital.com" },
    update: {},
    create: {
      name: "Apollo Hospital",
      registrationNo: "HOSP-MH-002-2024",
      email: "info@apollohospital.com",
      phone: "+912227654321",
      emergencyPhone: "+912227654322",
      address: "Plot No. 23, Juhu",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400049",
      latitude: 19.1075,
      longitude: 72.8263,
      totalBeds: 300,
      hasBloodBank: true,
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Hospital created:", hospital2.name);

  const hospital3 = await prisma.hospital.upsert({
    where: { email: "contact@lilavatihospital.com" },
    update: {},
    create: {
      name: "Lilavati Hospital",
      registrationNo: "HOSP-MH-003-2024",
      email: "contact@lilavatihospital.com",
      phone: "+912226567890",
      emergencyPhone: "+912226567891",
      address: "A-791, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      latitude: 19.0544,
      longitude: 72.828,
      totalBeds: 400,
      hasBloodBank: true,
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Hospital created:", hospital3.name);

  const hospital4 = await prisma.hospital.upsert({
    where: { email: "info@fortishospital.com" },
    update: {},
    create: {
      name: "Fortis Hospital",
      registrationNo: "HOSP-DL-004-2024",
      email: "info@fortishospital.com",
      phone: "+911145678901",
      emergencyPhone: "+911145678902",
      address: "Sector 62, Noida",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      latitude: 28.6139,
      longitude: 77.209,
      totalBeds: 600,
      hasBloodBank: true,
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Hospital created:", hospital4.name);

  const hospital5 = await prisma.hospital.upsert({
    where: { email: "contact@maxhospital.com" },
    update: {},
    create: {
      name: "Max Super Speciality Hospital",
      registrationNo: "HOSP-DL-005-2024",
      email: "contact@maxhospital.com",
      phone: "+911156789012",
      emergencyPhone: "+911156789013",
      address: "Saket, Press Enclave Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110017",
      latitude: 28.5244,
      longitude: 77.2066,
      totalBeds: 550,
      hasBloodBank: true,
      isActive: true,
      isVerified: true,
    },
  });
  console.log("✅ Hospital created:", hospital5.name);

  // Create Donor Users
  const donorPassword = await bcrypt.hash("donor123", 10);
  const donor1 = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      password: donorPassword,
      role: UserRole.DONOR,
      firstName: "John",
      lastName: "Doe",
      phone: "+919876543211",
      dateOfBirth: new Date("1995-05-15"),
      gender: Gender.MALE,
      bloodGroup: BloodGroup.O_POSITIVE,
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      weight: 75.5,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log("✅ Donor created:", donor1.email);

  const donor2 = await prisma.user.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
      email: "jane.smith@example.com",
      password: donorPassword,
      role: UserRole.DONOR,
      firstName: "Jane",
      lastName: "Smith",
      phone: "+919876543212",
      dateOfBirth: new Date("1992-08-22"),
      gender: Gender.FEMALE,
      bloodGroup: BloodGroup.A_POSITIVE,
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      weight: 60.0,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log("✅ Donor created:", donor2.email);

  // Create Sample Donations
  await prisma.donation.create({
    data: {
      donorId: donor1.id,
      bloodBankId: bloodBank1.id,
      bloodGroup: BloodGroup.O_POSITIVE,
      quantity: 1,
      scheduledDate: new Date("2025-01-10"),
      donationDate: new Date("2025-01-10"),
      status: "COMPLETED",
      hemoglobinLevel: 14.5,
      bloodPressure: "120/80",
      weight: 75.5,
      temperature: 36.8,
      isEligible: true,
      unitSerialNumber: "UNIT-2025-001",
      expiryDate: new Date("2025-02-20"),
      collectedBy: "Staff-001",
    },
  });
  console.log("✅ Sample donation created");

  // Create Sample Campaign
  await prisma.campaign.create({
    data: {
      name: "World Blood Donor Day Drive 2025",
      description:
        "Annual blood donation camp organized on World Blood Donor Day",
      startDate: new Date("2025-06-14"),
      endDate: new Date("2025-06-14"),
      location: "Community Center, Andheri West",
      city: "Mumbai",
      organizer: "Red Cross Society Mumbai",
      contactPerson: "Dr. Rajesh Kumar",
      contactPhone: "+919876543213",
      targetUnits: 200,
      collectedUnits: 0,
      isActive: true,
    },
  });
  console.log("✅ Sample campaign created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
