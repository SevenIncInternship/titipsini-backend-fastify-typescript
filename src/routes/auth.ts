import { FastifyInstance } from "fastify";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  registerSchema,
  loginSchema,

} from "../validation/auth";

export default async function authRoutes(fastify: FastifyInstance) {
  // --- REGISTER ---
  fastify.post("/register", async (req, reply) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.code(400).send({ errors: parseResult.error.flatten() });
    }

    const { name, email, address, phone, password, role } =
      parseResult.data

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return reply.code(400).send({ message: "Email already exists" });
    }

    const hashed = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashed,
        address,
        phone,
        role: role ?? "customer",
      })
      .returning();

    reply.send({ message: "User registered successfully", user: newUser[0] });
  });

  // --- LOGIN ---
  fastify.post("/login", async (req, reply) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.code(400).send({ errors: parseResult.error.flatten() });
    }

    const { email, password } = parseResult.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    reply.send({ message: "Login successful", token, user });
  });
}
