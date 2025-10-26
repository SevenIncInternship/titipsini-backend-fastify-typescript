import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors"; 
import jwtPlugin from "./plugins/jwt";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import vendorRoutes from "./routes/vendor";
import goodsRoutes from "./routes/goods";

dotenv.config();

const fastify = Fastify({ logger: true });

//  Register CORS
fastify.register(cors, {
  origin: "*", // izinkan semua origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

//  Plugins
fastify.register(jwtPlugin);

//  Routes
fastify.register(async (app) => {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
  app.register(vendorRoutes, { prefix: "/vendor" });
  app.register(goodsRoutes, { prefix: "/goods" });
}, { prefix: "/api/v1" });

const start = async () => {
  try {
    await fastify.listen({ port: 4001, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
