import { FastifyInstance } from "fastify";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { goods, goodsCategory } from "../db/schema";
import { goodsSchema } from "../validation/goods";

export default async function goodsRoutes(fastify: FastifyInstance) {
  // ✅ CREATE Category
  fastify.post(
    "/category",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { title, price, description } = req.body as any;

      const result = await db
        .insert(goodsCategory)
        .values({ title, price, description })
        .returning();

      reply.code(201).send({
        message: "Category created successfully",
        data: result[0],
      });
    }
  );

  fastify.get(
    "/category",
    { preHandler: [fastify.authenticate] },
    async () => {
      return await db.select().from(goodsCategory);
    }
  )

  fastify.delete(
    "/category/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as any;
      const result = await db
        .delete(goodsCategory)
        .where(eq(goodsCategory.id, id))
        .returning();
      reply.code(200).send({
        message: "Category deleted successfully",
        data: result[0],
      });
    }
  );

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      // Validasi body dengan Zod
      const parseResult = goodsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.code(400).send({ errors: parseResult.error.flatten() });
      }

      const {
        vendorBranchId,
        categoryId,
        name,
        quantity,
        dateIn,
        dateOut,
        paymentMethod,
        bank,
      } = parseResult.data;

      const userId = req.user.id;

      const startDate = new Date(dateIn);
      const endDate = new Date(dateOut);

      const formattedDateIn = startDate.toISOString().split("T")[0];
      const formattedDateOut = endDate.toISOString().split("T")[0];

      // Perhitungan jumlah hari
      const dayTotal = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayTotal <= 0) {
        return reply.code(400).send({
          message: "dateOut must be after dateIn",
        });
      }

      // Ambil harga dari kategori barang
      const category = await db.query.goodsCategory.findFirst({
        where: eq(goodsCategory.id, categoryId),
      });

      if (!category) {
        return reply.code(404).send({ message: "Category not found" });
      }

      // Pastikan harga numerik
      const price = Number(category.price);
      if (isNaN(price)) {
        return reply.code(500).send({ message: "Invalid category price" });
      }

      // Hitung total harga
      const totalPrice = price * dayTotal * quantity;

      // ✅ Validasi tambahan: kalau cash, bank boleh kosong
      if (paymentMethod === "cash" && bank) {
        return reply.code(400).send({
          message: "Bank should not be provided when payment method is cash",
        });
      }

      if (paymentMethod === "transfer" && !bank) {
        return reply.code(400).send({
          message: "Bank must be provided when payment method is transfer",
        });
      }

      // Simpan data barang
      const result = await db
        .insert(goods)
        .values({
          vendorBranchId,
          userId,
          categoryId,
          name,
          quantity,
          dateIn: formattedDateIn, // ✅ gunakan format string
          dateOut: formattedDateOut, // ✅ gunakan format string
          dayTotal,
          paymentMethod,
          bank,
          totalPrice,
        })
        .returning();

      return reply.code(201).send({
        message: "Goods created successfully",
        goods: result[0],
      });
    }
  );

  // ✅ READ All Goods
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { status, vendorBranchId, userId } = req.query as {
        status?: boolean;
        vendorBranchId?: string;
        userId?: string;
      };

      let conditions = [];

      if (status) conditions.push(eq(goods.status, status));
      if (vendorBranchId)
        conditions.push(eq(goods.vendorBranchId, vendorBranchId));
      if (userId) conditions.push(eq(goods.userId, userId));

      const query =
        conditions.length > 0
          ? db
              .select()
              .from(goods)
              .where(and(...conditions))
          : db.select().from(goods);

      const result = await query;

      reply.code(200).send({
        count: result.length,
        data: result,
      });
    }
  );
  // ✅ DELETE Goods
  fastify.delete(
    "/:id/delete",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const existing = await db.query.goods.findFirst({
        where: eq(goods.id, id),
      });

      if (!existing) {
        return reply.code(404).send({ message: "Goods not found" });
      }

      await db.delete(goods).where(eq(goods.id, id));

      reply.code(200).send({ message: "Goods deleted successfully" });
    }
  );

  // ✅ UPDATE STATUS Goods
  fastify.patch(
    "/:id/status",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { status } = req.body as { status: boolean };

      // Cek apakah goods ada
      const existing = await db.query.goods.findFirst({
        where: eq(goods.id, id),
      });

      if (!existing) {
        return reply.code(404).send({ message: "Goods not found" });
      }

      // Update status
      const result = await db
        .update(goods)
        .set({ status })
        .where(eq(goods.id, id))
        .returning();

      reply.code(200).send({
        message: "Goods status updated successfully",
        goods: result[0],
      });
    }
  );
}
