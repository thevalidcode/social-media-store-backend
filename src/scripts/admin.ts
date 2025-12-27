import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.admin.update({
      where: { id: 1 },
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
