import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.user.update({
      where: { id: 1 },
      data: { uid: "071366a3-4c87-4355-a26a-669d7791cc26" },
    });

    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating user:", err);
    process.exit(1);
  });
}
