import { FastifyInstance } from "fastify";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export default async function userRoutes(fastify: FastifyInstance) {
  // GET all users
  fastify.get("/", { preHandler: [fastify.authenticate] }, async () => {
    return await db.select().from(users);
  });

  // GET user by id
  fastify.get("/:id", { preHandler: [fastify.authenticate] }, async (req) => {
    const { id } = req.params as any;
    return await db
      .select()
      .from(users)
      .where(eq(users.id, String(id)));
  });

  // UPDATE user
  fastify.put("/:id", { preHandler: [fastify.authenticate] }, async (req) => {
    const { id } = req.params as any;
    const { name, email } = req.body as any;
    return await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, String(id)))
      .returning();
  });

  // DELETE user
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const { id } = req.params as any;
      await db.delete(users).where(eq(users.id, String(id)));
      return { message: "User deleted" };
    }
  );
}
