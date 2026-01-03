import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.admin.update({
      where: { id: 1, storeId: 1 },
      data: {
        onboardingCompleted: false,
        password:
          "$2a$12$lPZwvy1FFz87pdOWlpdlj.VEDuZ/FiyvDAUsako5iOlbt/rshjxCu",
      },
    });

    console.log("Admin updated successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating store:", err);
    process.exit(1);
  });
}
