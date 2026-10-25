[33m88b7594[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m)[m Fix Prisma user fields, NextAuth v5 setup, checkout race conditions
 .gitignore                                       |  17 [32m+[m[31m-[m
 apps/web/src/app/actions/buyer-register.ts       |  41 [32m++++[m[31m-[m
 apps/web/src/app/actions/checkout.ts             | 142 [32m++++++++[m[31m-------[m
 apps/web/src/app/actions/checkoutEngine.ts       | 219 [32m+++++++++++++++++[m[31m------[m
 apps/web/src/app/actions/scanner.ts              |  74 [32m+++++[m[31m---[m
 apps/web/src/app/actions/ticket.ts               |  26 [32m++[m[31m-[m
 apps/web/src/app/api/auth/[...nextauth]/route.ts |  29 [32m+[m[31m--[m
 apps/web/src/app/layout.tsx                      |   2 [32m+[m[31m-[m
 apps/web/src/auth.ts                             |  70 [32m++++++++[m
 apps/web/src/types/next-auth.d.ts                |  17 [32m++[m
 apps/web/tsconfig.json                           |   4 [32m+[m
 package.json                                     |  12 [32m+[m[31m-[m
 packages/database/package.json                   |   7 [32m+[m[31m-[m
 packages/database/prisma/schema.prisma           |   1 [32m+[m
 packages/database/prisma/seed.ts                 |  17 [32m+[m[31m-[m
 pnpm-lock.yaml                                   |  73 [32m+++++++[m[31m-[m
 turbo.json                                       |   2 [32m+[m
 17 files changed, 548 insertions(+), 205 deletions(-)
[33m4efa4fc[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m feat: add user profile page and header dropdown menu navigation
 apps/web/package.json                            |   3 [32m+[m
 apps/web/src/app/actions/auth.ts                 |  27 [32m+++[m
 apps/web/src/app/actions/buyer-auth.ts           |  48 [32m+++++[m
 apps/web/src/app/actions/buyer-register.ts       |  70 [32m+++++++[m
 apps/web/src/app/api/auth/[...nextauth]/route.ts |  28 [32m+++[m
 apps/web/src/app/layout.tsx                      |  72 [32m+[m[31m------[m
 apps/web/src/app/login/gate/page.tsx             |  54 [32m+++++[m
 apps/web/src/app/login/organizer/page.tsx        |  54 [32m+++++[m
 apps/web/src/app/login/page.tsx                  | 139 [32m+++++++++++++[m
 apps/web/src/app/profile/page.tsx                | 252 [32m+++++++++++++++++++++++[m
 apps/web/src/app/signup/page.tsx                 | 201 [32m++++++++++++++++++[m
 apps/web/src/components/Header.tsx               | 160 [32m++++++++++++++[m
 apps/web/src/components/Navbar.tsx               | 104 [32m+++++++++[m[31m-[m
 apps/web/src/components/providers.tsx            |  12 [32m++[m
 packages/database/prisma/schema.prisma           |  54 [32m+++[m[31m--[m
 pnpm-lock.yaml                                   |  96 [32m+++++++++[m
 16 files changed, 1291 insertions(+), 83 deletions(-)
[33md6b8e8d[m feat(organizer): add event creation portal, multi-tier pricing, and update global layout navigation
 apps/web/.eslintrc.json                            |    6 [32m+[m
 apps/web/package.json                              |    2 [32m+[m
 apps/web/src/app/(buyer)/dashboard/page.tsx        |  123 [32m+[m[31m-[m
 apps/web/src/app/(buyer)/events/[slug]/page.tsx    |   68 [32m+[m[31m-[m
 apps/web/src/app/actions/checkout.ts               |   14 [32m+[m[31m-[m
 apps/web/src/app/actions/checkoutEngine.ts         |   87 [32m+[m
 apps/web/src/app/actions/event.ts                  |   47 [32m+[m
 apps/web/src/app/actions/pricingEngine.ts          |   41 [32m+[m
 apps/web/src/app/actions/tier.ts                   |   31 [32m+[m
 apps/web/src/app/actions/turnstileScanner.ts       |   54 [32m+[m
 apps/web/src/app/committee/page.tsx                |  139 [32m+[m[31m-[m
 apps/web/src/app/globals.css                       |   23 [32m+[m[31m-[m
 apps/web/src/app/layout.tsx                        |   82 [32m+[m[31m-[m
 apps/web/src/app/organizer/events/new/page.tsx     |  273 [32m++[m
 apps/web/src/app/page.tsx                          |  154 [32m+[m[31m-[m
 apps/web/src/components/GateScanner.tsx            |  148 [32m+[m[31m-[m
 apps/web/src/components/GlassTicket.tsx            |   84 [32m+[m
 apps/web/src/components/OperationsDashboard.tsx    |   39 [32m+[m
 apps/web/src/components/ThemeProvider.tsx          |   17 [32m+[m
 apps/web/src/components/ThemeToggle.tsx            |   53 [32m+[m
 package.json                                       |    3 [32m+[m
 packages/database/package.json                     |    2 [32m+[m[31m-[m
 .../migration.sql                                  |  400 [32m+++[m
 .../database/prisma/migrations/migration_lock.toml |    3 [32m+[m
 packages/database/prisma/schema.prisma             |  304 [32m+[m[31m-[m
 packages/database/src/index.ts                     |   16 [32m+[m[31m-[m
 pnpm-lock.yaml                                     | 3353 [32m+++++++++++++++++++[m[31m-[m
 tailwind.config.js                                 |   14 [32m+[m
 28 files changed, 5076 insertions(+), 504 deletions(-)
