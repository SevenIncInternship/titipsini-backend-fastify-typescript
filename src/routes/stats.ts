import { FastifyInstance } from "fastify";
import { db } from "../db";
import { eq, and, gte, lte, count, sum, sql } from "drizzle-orm";
import { vendor, vendorBranch, goods, goodsCategory } from "../db/schema";
import dayjs from "dayjs";

export default async function statsRoutes(fastify: FastifyInstance) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, async (req) => {
    // --- Total Mitra ---
    const totalMitraRes = await db.select({ count: count() }).from(vendor);
    const totalMitra = totalMitraRes[0]?.count || 0;

    // --- Mitra aktif / suspended / pending ---
    const [mitraAktif, mitraSuspended, mitraPending] = await Promise.all([
      db.select({ count: count() }).from(vendor),
      db.select({ count: count() }).from(vendor),
      db.select({ count: count() }).from(vendor),
    ]).then((res) => res.map((r) => r[0]?.count || 0));

    // --- Total Cabang + cabang baru 24 jam terakhir ---
    const [totalCabangRes, newBranches24hRes] = await Promise.all([
      db.select({ count: count() }).from(vendorBranch),
      db
        .select({ count: count() })
        .from(vendorBranch)
        .where(gte(vendorBranch.createdAt, dayjs().subtract(1, "day").toDate())),
    ]);
    const totalCabang = totalCabangRes[0]?.count || 0;
    const newBranches24h = newBranches24hRes[0]?.count || 0;

    // --- Transaksi Harian ---
    const transaksiHarianRes = await db
      .select({ count: count() })
      .from(goods)
      .where(
        and(
          gte(goods.createdAt, dayjs().startOf("day").toDate()),
          lte(goods.createdAt, dayjs().endOf("day").toDate())
        )
      );
    const transaksiHarian = transaksiHarianRes[0]?.count || 0;

    // --- Pendapatan Bulanan, Invoice Bulan Ini, Sudah Dibayar, Outstanding ---
    const [pendapatanBulananRes, invoiceBulanIniRes, sudahDibayarRes, outstandingRes] = await Promise.all([
      db
        .select({ total: sum(goods.totalPrice) })
        .from(goods)
        .where(
          and(
            gte(goods.createdAt, dayjs().startOf("month").toDate()),
            lte(goods.createdAt, dayjs().endOf("month").toDate())
          )
        ),
      db
        .select({ total: sum(goods.totalPrice) })
        .from(goods)
        .where(
          and(
            gte(goods.createdAt, dayjs().startOf("month").toDate()),
            lte(goods.createdAt, dayjs().endOf("month").toDate())
          )
        ),
      db.select({ total: sum(goods.totalPrice) }).from(goods).where(eq(goods.status, true)),
      db.select({ total: sum(goods.totalPrice) }).from(goods).where(eq(goods.status, true)),
    ]);

    const pendapatanBulanan = pendapatanBulananRes[0]?.total || 0;
    const invoiceBulanIni = invoiceBulanIniRes[0]?.total || 0;
    const sudahDibayar = sudahDibayarRes[0]?.total || 0;
    const outstanding = outstandingRes[0]?.total || 0;

    // --- Tren Mingguan ---
    const startThisWeek = dayjs().startOf("week").toDate();
    const startLastWeek = dayjs().subtract(1, "week").startOf("week").toDate();
    const endLastWeek = dayjs().subtract(1, "week").endOf("week").toDate();

    const [thisWeekCount, lastWeekCount] = await Promise.all([
      db.select({ count: count() }).from(goods).where(gte(goods.createdAt, startThisWeek)),
      db
        .select({ count: count() })
        .from(goods)
        .where(and(gte(goods.createdAt, startLastWeek), lte(goods.createdAt, endLastWeek))),
    ]);

    const trenMingguan =
      lastWeekCount[0]?.count === 0
        ? 0
        : Math.round(((thisWeekCount[0]?.count - lastWeekCount[0]?.count) / lastWeekCount[0]?.count) * 100);

    // --- Kategori Terpopuler ---
    const kategoriTerpopuler = await db
      .select({
        name: goodsCategory.title,
        count: sql<number>`COUNT(${goods.id})`,
      })
      .from(goods)
      .leftJoin(goodsCategory, eq(goods.categoryId, goodsCategory.id))
      .groupBy(goodsCategory.title)
      .orderBy(sql`COUNT(${goods.id}) DESC`)
      .limit(5);

    // --- Weekly Trend (7 hari terakhir) ---
    const today = dayjs();
    const weeklyTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, "day");
      const res = await db
        .select({ count: count() })
        .from(goods)
        .where(
          and(
            gte(goods.createdAt, date.startOf("day").toDate()),
            lte(goods.createdAt, date.endOf("day").toDate())
          )
        );
      weeklyTrend.push(res[0]?.count || 0);
    }

    // --- Gabungkan semua hasil ---
    return {
      totalMitra,
      mitraAktif,
      mitraSuspended,
      mitraPending,
      totalCabang,
      newBranches24h,
      transaksiHarian,
      pendapatanBulanan,
      invoiceBulanIni,
      sudahDibayar,
      outstanding,
      trenMingguan,
      kategoriTerpopuler,
      weeklyTrend,
    };
  });
}
