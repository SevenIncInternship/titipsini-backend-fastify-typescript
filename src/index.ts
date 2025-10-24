import Fastify from "fastify";
import dotenv from "dotenv";
import jwtPlugin from "./plugins/jwt";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

dotenv.config();

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(jwtPlugin);


fastify.register(async (app) => {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
}, { prefix: "/api/v1" });

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Server running at http://localhost:3000/api/v1");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
