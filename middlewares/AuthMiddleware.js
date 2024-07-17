const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../util/ErrorHandler");
const AsyncHandler = require("express-async-handler");
const JWT = require("jsonwebtoken");
let prisma = new PrismaClient();

/**
 * @desc Route user AUTH protection
 * @access private
 */
const ProtectAuth = AsyncHandler(async (req, res, next) => {
    // 1) Check if token exist, if exist get
    let token;
    if (
        req.headers.authorization &&
        (req.headers.authorization.startsWith("Bearer") ||
            req.headers.authorization.startsWith("bearer"))
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new ErrorHandler(
                "You are not login, Please login to get access this process",
                401
            )
        );
    }

    // 2) Verify token (no change happens, expired token)
    let decoded = null;
    try {
        decoded = JWT.verify(token, process.env.SECRET);
    } catch (err) {
        return next(
            new ErrorHandler(
                "It seems that your session has expired, please login again",
                401
            )
        );
    }

    // 3) Check if user exists
    let currentUser;
    try {
        currentUser = await prisma.user.findUniqueOrThrow({
            where: {
                id: decoded.id,
            },
            include: {
                information: true,
            },
        });
    } catch (_) {
        next(
            new ErrorHandler(
                "The user that belong to this token does no longer exist",
                404
            )
        );
    }

    // 4) Check if user change his password after token created
    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000,
            10
        );
        // Password changed after token created (Error)
        if (passChangedTimestamp > decoded.iat) {
            return next(
                new ErrorHandler(
                    "User recently changed his password. please login again..",
                    401
                )
            );
        }
    }

    req.user = currentUser;
    next();
});

/**
 * @desc Route AUTH protection
 * @access private
 */
const ProtectAdminAuth = AsyncHandler(async (req, res, next) => {
    // 1) Check if token exist, if exist get
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new ErrorHandler(
                "You are not login, Please login to get access to this route",
                401
            )
        );
    }

    // 2) Verify token (no change happens, expired token)
    let decoded = null;
    try {
        decoded = JWT.verify(token, process.env.SECRET);
    } catch (_) {
        next(
            new ErrorHandler(
                "Something went wrong trying to authorize your account",
                401
            )
        );
    }

    // 3) Check if user exists
    let currentUser;
    try {
        currentUser = await prisma.user.findUniqueOrThrow({
            where: {
                id: decoded.id,
            },
        });
    } catch (_) {
        return next(
            new ErrorHandler(
                "The user that belong to this token does no longer exist",
                404
            )
        );
    }

    // 4) Check if user change his password after token created
    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000,
            10
        );
        // Password changed after token created (Error)
        if (passChangedTimestamp > decoded.iat) {
            return next(
                new ErrorHandler(
                    "User recently changed his password. please login again..",
                    401
                )
            );
        }
    }

    // 5) Check for Admin role
    if (currentUser.role !== "ADMIN") {
        return next(
            new ErrorHandler("Only admins can perform this request", 403)
        );
    }

    req.user = currentUser;
    next();
});

module.exports = { ProtectAuth, ProtectAdminAuth };
