import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.user.findMany();

    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating store:", err);
    process.exit(1);
  });
}
