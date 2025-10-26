import { FastifyInstance } from "fastify";
import { db } from "../db";
import { users, vendor, vendorBranch } from "../db/schema";
import { eq } from "drizzle-orm";
import { vendorBranchSchema, vendorSchema } from "../validation/vendor";

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

  // ADD vendor branch
  fastify.post(
    "/:vendorId/branch",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { vendorId } = req.params as { vendorId: string };
      const parseResult = vendorBranchSchema.safeParse(req.body);

      if (!parseResult.success) {
        return reply.code(400).send({ errors: parseResult.error.flatten() });
      }

      const { name, address, phone } = parseResult.data;
      const userId = req.user.id;

      // Pastikan vendor milik user ini
      const vendorData = await db.query.vendor.findFirst({
        where: eq(vendor.id, vendorId),
      });

      if (!vendorData) {
        return reply.code(404).send({ message: "Vendor not found" });
      }

      // (Opsional) jika kamu ingin membatasi hanya pemilik vendor yang boleh menambah cabang:
      if (vendorData.userId !== userId) {
        return reply.code(403).send({
          message: "You are not authorized to add a branch for this vendor",
        });
      }

      const result = await db
        .insert(vendorBranch)
        .values({
          vendorId,
          name,
          address,
          phone,
        })
        .returning();

      return reply.code(201).send({
        message: "Vendor branch added successfully",
        branch: result[0],
      });
    }
  );

  fastify.get(
    "/:vendorId/branch",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { vendorId } = req.params as { vendorId: string };
      const result = await db
        .select()
        .from(vendorBranch)
        .where(eq(vendorBranch.vendorId, vendorId));
      return reply.send(result);
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

  // GET vendor by userId
  fastify.get(
    "/by-user",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id; // ambil dari token/authenticated user

      const result = await db
        .select()
        .from(vendor)
        .where(eq(vendor.userId, userId))
        .limit(1);

      if (result.length === 0) {
        return reply
          .code(404)
          .send({ message: "Vendor not found for this user" });
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
