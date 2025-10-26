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
  fastify.put(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { name, email, phone, address, role, password } = req.body as {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        role?: string;
        password?: string;
      };

      // pastikan user ada
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!existingUser) {
        return reply.code(404).send({ error: "User tidak ditemukan" });
      }

      // jika password dikirim, hash ulang
      let updatedData: any = { name, email, phone, address, role };
      if (password && password.trim() !== "") {
        const { hashPassword } = await import("../utils/hash.js"); // pastikan path sesuai
        updatedData.password = await hashPassword(password);
      }

      // hapus field undefined (biar tidak overwrite jadi null)
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === undefined) delete updatedData[key];
      });

      const updatedUser = await db
        .update(users)
        .set(updatedData)
        .where(eq(users.id, id))
        .returning();

      return { message: "User berhasil diperbarui", user: updatedUser[0] };
    }
  );

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
