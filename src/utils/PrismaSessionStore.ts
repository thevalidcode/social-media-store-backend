import { Store } from "express-session";
import { prisma } from "../config/db.config";

class PrismaSessionStore extends Store {
  async get(sid: string, callback: (err?: any, session?: any) => void) {
    try {
      const session = await prisma.internalApiSession.findUnique({
        where: { id: sid },
      });
      if (!session || new Date() > session.expiresAt) {
        return callback(null, null);
      }
      return callback(null, session.data);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, session: any, callback?: (err?: any) => void) {
    try {
      const expiresAt = new Date(
        session.cookie.expires || Date.now() + 7 * 24 * 60 * 60 * 1000
      );
      await prisma.internalApiSession.upsert({
        where: { id: sid },
        update: { data: session, expiresAt },
        create: { id: sid, data: session, expiresAt },
      });
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await prisma.internalApiSession.delete({ where: { id: sid } });
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

export default PrismaSessionStore;
