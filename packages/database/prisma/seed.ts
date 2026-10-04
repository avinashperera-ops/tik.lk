import { PrismaClient, GlobalRole, CommitteeRole, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Wiping database state...');

  await prisma.auditLog.deleteMany();
  await prisma.gateLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.ticketTier.deleteMany();
  await prisma.eventCustomization.deleteMany();
  await prisma.event.deleteMany();
  await prisma.committeeMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('⚡ Seeding Super Admin, Committee, and Users...');

  // 1. Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@openticket.io',
      fullName: 'System Super Admin',
      globalRole: GlobalRole.SUPER_ADMIN,
    },
  });

  // 2. Organizing Committee Leader
  const committeeUser = await prisma.user.create({
    data: {
      email: 'organizer@nexusops.com',
      fullName: 'Elena Rostova',
      globalRole: GlobalRole.USER,
    },
  });

  // 3. Ticket Buyer User
  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@gmail.com',
      fullName: 'Alex Vance',
      globalRole: GlobalRole.USER,
    },
  });

  // 4. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Nexus Events Group',
      slug: 'nexus-events',
      description: 'Premier producer of international music and technology festivals.',
    },
  });

  // Assign Committee Leader to Org
  await prisma.committeeMember.create({
    data: {
      userId: committeeUser.id,
      organizationId: org.id,
      role: CommitteeRole.OWNER,
    },
  });

  // 5. Customized Event
  const event = await prisma.event.create({
    data: {
      organizationId: org.id,
      title: 'Cyber Pulse World Tour 2026',
      slug: 'cyber-pulse-2026',
      description: 'An immersive audio-visual festival featuring world-renowned electronic artists.',
      venueName: 'Tokyo Dome Arena',
      venueAddress: '1-3-61 Koraku, Bunkyo City, Tokyo',
      startDate: new Date('2026-11-20T17:00:00Z'),
      endDate: new Date('2026-11-21T02:00:00Z'),
      isPublished: true,
      customization: {
        create: {
          primaryColor: '#0f172a',
          secondaryColor: '#38bdf8',
          accentColor: '#f43f5e',
          fontFamily: 'Inter',
          heroLayout: 'MODERN_FULL',
        },
      },
    },
  });

  // 6. Ticket Tiers
  const vipTier = await prisma.ticketTier.create({
    data: {
      eventId: event.id,
      name: 'VIP Ultra Pass',
      description: 'Backstage access, dedicated fast-track lane, and open bar lounge.',
      priceInCents: 35000, // $350.00
      totalCapacity: 50,
      availableCount: 50,
      maxPerUser: 2,
    },
  });

  const gaTier = await prisma.ticketTier.create({
    data: {
      eventId: event.id,
      name: 'General Admission',
      description: 'Full main floor access to the multi-stage concert area.',
      priceInCents: 12000, // $120.00
      totalCapacity: 200,
      availableCount: 200,
      maxPerUser: 6,
    },
  });

  // 7. Discount Code
  await prisma.discountRule.create({
    data: {
      eventId: event.id,
      code: 'EARLYVIP20',
      discountType: DiscountType.PERCENTAGE,
      value: 20, // 20% OFF
      maxUses: 100,
      ticketTiers: {
        connect: [{ id: vipTier.id }],
      },
    },
  });

  // 8. Generate Available Stock
  const availableTickets = [];
  for (let i = 0; i < 10; i++) {
    availableTickets.push({
      eventId: event.id,
      tierId: vipTier.id,
      status: 'AVAILABLE' as const,
    });
  }
  for (let i = 0; i < 20; i++) {
    availableTickets.push({
      eventId: event.id,
      tierId: gaTier.id,
      status: 'AVAILABLE' as const,
    });
  }

  await prisma.ticket.createMany({
    data: availableTickets,
  });

  console.log('✅ Seeding Completed Successfully.');
  console.log(`   - Super Admin: ${superAdmin.email}`);
  console.log(`   - Organizer:   ${committeeUser.email}`);
  console.log(`   - Buyer:       ${buyerUser.email}`);
  console.log(`   - Event Slug:  ${event.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });