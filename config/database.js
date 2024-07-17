const ErrorHandler = require("../util/ErrorHandler");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connect = () => {
    const connectionString = `${process.env.DATABASE_URL}`;
    const pool = new Pool({
        connectionString,
        connect_timeout: 0,
        pool_timeout: 0,
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    prisma
        .$connect()
        .then(() => {
            console.log("db connected successfully");
        })
        .catch((err) => {
            throw new ErrorHandler("Failed to connect to Database", 500);
        });
};

module.exports = connect;
