import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    console.log(await prisma.admin.findMany());
    console.log(await prisma.store.findMany());
    const result = await prisma.admin.update({
      where: { id: 1, storeId: 11 },
      data: {
        onboardingCompleted: false,
        password:
          "$2a$12$lPZwvy1FFz87pdOWlpdlj.VEDuZ/FiyvDAUsako5iOlbt/rshjxCu",
      },
    });

    await prisma.store.update({
      where: { storeId: 11 },
      data: { status: "ACTIVE" },
    });

    await prisma.setting.update({
      where: { storeId: 11 },
      data: { onboardingCompleted: false },
    });

    console.log("Admin updated successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating store:", err);
    process.exit(1);
  });
}
