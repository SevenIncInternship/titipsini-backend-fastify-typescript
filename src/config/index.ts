import dotenv from "dotenv";
dotenv.config();

const config = {
    env: {
        databaseUrl: process.env.DATABASE_URL || '',
        jwtSecret: process.env.JWT_SECRET || '',

    }
}

export default config;