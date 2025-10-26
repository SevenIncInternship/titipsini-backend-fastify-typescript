import { FastifyInstance } from "fastify";
import { db } from "../db";
import { users, vendor } from "../db/schema";
import { eq } from "drizzle-orm";
import { vendorSchema } from "../validation/vendor";

export default async function vendorRoutes(fastify: FastifyInstance) {
  // CREATE vendor
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const parseResult = vendorSchema.safeParse(req.body);

      if (!parseResult.success) {
        return reply.code(400).send({ errors: parseResult.error.flatten() });
      }
      const { companyName, companyAddress } = parseResult.data;
      const userId = req.user.id;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      const result = await db
        .insert(vendor)
        .values({
          userId,
          companyName,
          companyAddress,
          email: user.email,
          phone: user.phone,
        })
        .returning();

      return reply.send({
        message: "Vendor created successfully",
        vendor: result[0],
      });
    }
  );

  // GET all vendors
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const result = await db.select().from(vendor);
      return reply.send(result);
    }
  );

  // GET vendor by ID
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const result = await db
        .select()
        .from(vendor)
        .where(eq(vendor.id, id))
        .limit(1);

      if (result.length === 0) {
        return reply.code(404).send({ message: "Vendor not found" });
      }

      return reply.send(result[0]);
    }
  );

  // DELETE vendor by ID
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const deleted = await db
        .delete(vendor)
        .where(eq(vendor.id, id))
        .returning();

      if (deleted.length === 0) {
        return reply
          .code(404)
          .send({ message: "Vendor not found or already deleted" });
      }

      return reply.send({ message: "Vendor deleted successfully", deleted });
    }
  );
}
