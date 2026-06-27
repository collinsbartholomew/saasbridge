import { count, eq } from "drizzle-orm";

import { db } from "./client";
import { projects, user } from "./schema";

async function main() {
  const [{ value: userCount }] = await db.select({ value: count() }).from(user);

  if (userCount === 0) {
    console.info("No users found. Skipping seed.");
    return;
  }

  const [devUser] = await db.select({ id: user.id }).from(user).orderBy(user.createdAt).limit(1);
  if (!devUser) {
    console.info("No dev user available. Skipping sample projects.");
    return;
  }

  const [{ value: existingProjects }] = await db
    .select({ value: count() })
    .from(projects)
    .where(eq(projects.ownerUserId, devUser.id));

  if (existingProjects > 0) {
    console.info("Sample projects already exist. Skipping seed.");
    return;
  }

  await db.insert(projects).values([
    {
      ownerUserId: devUser.id,
      name: "Launch checklist",
      description: "Ship the first production-ready version of SaaSBridge.",
    },
    {
      ownerUserId: devUser.id,
      name: "Customer onboarding",
      description: "Map the first-run experience and support docs.",
      status: "active",
    },
  ]);

  console.info("Seeded sample projects.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
