require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const DB_Connection = require("./config/database");
const ErrorHandler = require("./util/ErrorHandler");
const cors = require("cors");
const { AdminSeeder } = require("./service/userService");

require("dotenv").config();

// Routers
const Router = require("./routes/Router");

// Error handler
const globalError = require("./middlewares/errMiddlewares");

// Starting server
const app = express();

DB_Connection();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://nutri-ai.onrender.com"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "*",
            "3.75.158.163",
            "3.125.183.140",
            "35.157.117.28",
        ],
        preflightContinue: true,
        credentials: true,
    })
);

// Check for admin data
AdminSeeder();

// Main Routes
app.use("/api", Router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(new ErrorHandler("Route not found", 404));
});

// Global Error Handler
app.use(globalError);

module.exports = app;
