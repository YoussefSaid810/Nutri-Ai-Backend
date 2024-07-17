const bcrypt = require("bcrypt");
const ErrorHandler = require("../util/ErrorHandler");
const AsyncHandler = require("express-async-handler");
const Schedule = require("node-schedule");
const JWT = require("jsonwebtoken");
const { userVerification } = require("../config/Email/EmailService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const CombineObjects = require("../util/CombineObjects");
const { BeautifyMeal } = require("./mealService");
const cloudinary = require("../util/Cloudinary");
const fs = require("fs");

const Hour = 1000 * 60 * 60;
const HashSalt = Number(process.env.SALT);
const includes = {
    information: true,
    preferences: {
        select: {
            meal: {
                select: {
                    id: true,
                },
            },
        },
    },
};
/**
 * @description Generate random number to generate a verification code
 */
const generate_Code = (length = 8) => {
    const constants =
        "NaBbAc0IdeOfU1EghViD2jMkl3GJZmTnRo4pFqYSr5stHuK6vWPxy7LzQ8X9C";
    let retValue = "";

    for (let i = 0; i < length; i++) {
        retValue +=
            constants[Math.floor(Math.trunc(Math.random() * constants.length))];
    }

    return retValue;
};

/**
 * @param {Response} res
 * @param {Function} next
 * @param {{_id, name, email, verification_email}} User User information
 * @param {Boolean} Force
 * @description Helper function that checks for every user before sending email to him
 */
const verify_account = async (user, next, Force = false) => {
    let { id, name, email, verify_Email } = user;
    // Check for email
    if (verify_Email.length !== 0) verify_Email = verify_Email[0];
    // Create new verification email
    else {
        const code = generate_Code();
        let verification_email = await prisma.verification_Emails
            .create({
                data: {
                    userID: id,
                    code,
                },
            })
            .catch((_) => {
                throw new ErrorHandler(
                    "Something went wrong trying to generate email verification please try again later",
                    500
                );
            });
        verify_Email = verification_email;
    }

    // Check for how many mails has been sent per 12 hours
    if (verify_Email.count >= process.env.MAX_SENT_EMAIL) {
        throw new ErrorHandler("Maximum limit reached", 429);
    }

    // Check for the last email sent date
    const sent_duration = Math.round(
        (new Date() - verify_Email.sent_at) * Hour
    );

    // Sending email to user
    try {
        if (sent_duration >= 23 || Force) {
            await userVerification({
                name,
                email,
                code: verify_Email.code,
            });
        }
    } catch (err) {
        console.log(err);
        throw new ErrorHandler(
            "Something wrong with our email service, please try again later",
            500
        );
    }

    // Updating email counts
    try {
        await prisma.verification_Emails.update({
            where: {
                id: verify_Email.id,
            },
            data: {
                count: verify_Email.count + 1,
            },
        });
    } catch (err) {
        throw new ErrorHandler("Couldn't update email count", 500);
    }
};

/**
 * @param {{user}} User user object
 * @param {Response} res
 */
const GET_TOKEN = (user) => {
    return JWT.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: process.env.SESSION_TIME + "d",
    });
};

const Beautify_User = (user) => {
    delete user.password;
    delete user.passwordChangedAt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.verify_Email;

    if (user.information) user.information = user.information[0];

    if (user.preferences)
        user.preferences = user.preferences.map((pref) =>
            BeautifyMeal(pref.meal)
        );
    return user;
};

/**
 * @desc Register new user
 * @route /api/auth/signup
 * @access public
 * @method POST
 */
const signup = AsyncHandler(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check for unique email
        let Email_Existence = await prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (Email_Existence != null)
            throw new ErrorHandler("This email is already in use", 400);

        // Create new user
        const hashPass = await bcrypt.hash(password, HashSalt);
        let newUser = await prisma.user
            .create({
                data: {
                    email,
                    name,
                    password: hashPass,
                },
            })
            .catch((_) => {
                throw new ErrorHandler(
                    "Something went wrong trying signup you",
                    503
                );
            });

        // Init user verification email
        const code = generate_Code();
        let verification_email = await prisma.verification_Emails
            .create({
                data: {
                    userID: newUser.id,
                    code,
                },
            })
            .catch((_) => {
                throw new ErrorHandler(
                    "Something went wrong trying to generate email verification please try again later",
                    500
                );
            });
        newUser.verify_Email = [verification_email];

        // Init user information
        await prisma.user_Infos
            .create({
                data: {
                    userID: newUser.id,
                },
            })
            .catch((_) => {
                throw new ErrorHandler(
                    "Something went wrong trying to generate user information",
                    500
                );
            });

        // Send email verification
        if (newUser) verify_account(newUser, next);

        // Sending response
        const { id } = newUser;
        res.status(201).json({
            data: { id, name: newUser.name, email: newUser.email },
            message:
                "Verification email has been sent to you, please verify your account",
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc User login to system
 * @route /api/auth/login
 * @access public
 * @method POST
 */
const login = AsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Get user with the email
        let user = await prisma.user.findUniqueOrThrow({
            where: {
                email,
            },
            include: {
                ...includes,
                verify_Email: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        // Check for user password
        const Check = await bcrypt.compare(password, user.password);
        if (Check) {
            if (!user.blocked) {
                if (user.activated) {
                    // Sending response to user
                    let TOKEN = GET_TOKEN(user);
                    res.status(200).json({ ...Beautify_User(user), TOKEN });
                } else {
                    // Return user with hidden information
                    res.status(203).json({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        message:
                            "Verification email has been sent to you, please verify your account",
                    });
                }
            } else
                throw new ErrorHandler(
                    "This user is blocked please contact us for more information",
                    403
                );
        } else {
            throw new ErrorHandler("wrong password");
        }
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this email",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Activate user account
 * @route /api/auth/user/verifyUser/{:id}
 * @access public USER
 * @method POST
 */
const verifyUser = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { code } = req.body;

    try {
        // Get user's data
        let user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
            },
            include: {
                verify_Email: true,
            },
        });

        // Check for user's code
        if (user.verify_Email[0].code !== ("" + code).trim()) {
            throw new ErrorHandler("Wrong code please check it again", 401);
        }

        // Activate user
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                activated: true,
            },
            include: includes,
        });

        // Set token to cookies
        let TOKEN = GET_TOKEN(user);

        // return response to user
        res.status(200).json({
            ...Beautify_User(user),
            TOKEN,
        });
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Activate user account
 * @route /api/auth/user/activate/{:id}
 * @access public ADMIN
 * @method POST
 */
const activateUser = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        // Get user's data
        let user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
            },
            include: {
                verify_Email: true,
            },
        });

        // Activate user
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                activated: !user.activated,
            },
        });

        // return response to user
        res.status(200).json({
            message: `User has been ${user.activated ? "activated" : "deactivated"} successfully`,
        });
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Email verification resend
 * @route /api/auth/user/verify/{:id}
 * @access public USER
 * @method options
 */
const emailResend = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
            },
            include: {
                verify_Email: true,
            },
        });

        await verify_account(user, next, true);
        res.status(200).json({ message: "Email has been sent successfully" });
    } catch (err) {
        console.log("err:", err);
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "It seams that currently there is a problem with our email servers, please try again later",
                    500
                )
            );
        else next(err);
    }
});

/**
 * @desc Get all users in system
 * @route /api/auth/user
 * @access private
 * @method GET
 */
const listUsers = AsyncHandler(async (req, res, next) => {
    const countPerPage = req.query.usersPerPage || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * countPerPage;

    try {
        let Users = await prisma.user.findMany({
            where: {
                NOT: {
                    role: "ADMIN",
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                activated: true,
                blocked: true,
            },
            skip,
            take: countPerPage,
        });
        res.status(200).json(Users);
    } catch (err) {
        next(
            new ErrorHandler("Something went wrong please try again later", 500)
        );
    }
});

/**
 * @desc Get all users in system
 * @route /api/auth/user
 * @access private
 * @method GET
 */
const listAdmins = AsyncHandler(async (req, res, next) => {
    const countPerPage = req.query.usersPerPage || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * countPerPage;

    try {
        let Users = await prisma.user.findMany({
            where: {
                role: "ADMIN",
            },
            select: {
                id: true,
                name: true,
                email: true,
                activated: true,
                blocked: true,
            },
            skip,
            take: countPerPage,
        });
        res.status(200).json(Users);
    } catch (err) {
        next(
            new ErrorHandler("Something went wrong please try again later", 500)
        );
    }
});

/**
 * @desc Get user information
 * @route /api/auth/user/{:id}
 * @access private
 * @method GET
 */
const viewOneUser = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                id,
            },
            include: includes,
        });

        res.status(200).json(Beautify_User(user));
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong trying to get you data; please try again later",
                    500
                )
            );
    }
});

/**
 * @desc Update user's name
 * @route /api/auth/user/{:id}
 * @access private
 * @method PUT
 */
const updateAccountData = AsyncHandler(async (req, res, next) => {
    let { id, image } = req.user;
    let { name, image: imageURL } = req.body;

    if (imageURL) {
        let public_id = image.split("/");
        cloudinary.v2.uploader
            .destroy(public_id[public_id.length - 1], {})
            .then((error, result) => {
                if (error) {
                    console.error("Error removing file to Cloudinary:", error);
                }

                console.log(result);
            });
    } else {
        imageURL = image;
    }

    try {
        const user = await prisma.user.update({
            where: {
                id,
            },
            data: {
                name,
                image: imageURL,
            },
            include: includes,
        });

        res.status(200).json(Beautify_User(user));
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong trying to update your data; please try again later",
                    500
                )
            );
    }
});

/**
 * @desc Update user's information
 * @route /api/auth/user/info/{:id}
 * @access private USER
 * @method PUT
 */
const updateUserInfo = AsyncHandler(async (req, res, next) => {
    const id = req.user.id;
    const { gender, height, weight, age, activity, goal } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                id,
            },
            include: includes,
        });

        // Merge user old infos with new infos and merge
        let user_infos = CombineObjects(user.information[0], {
            height: height,
            weight: weight,
            age: age,
            goal,
            gender,
            activity,
        });

        user_infos = {
            ...user_infos,
            height: Number(user_infos.height),
            weight: Number(user_infos.weight),
            age: Number(user_infos.age),
        };

        user.information = user_infos;

        await prisma.user_Infos.updateMany({
            where: {
                userID: id,
            },
            data: user_infos,
        });

        res.status(200).json(user_infos);
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong trying to update your data; please try again later",
                    500
                )
            );
    }
});

/**
 * @desc Update user Password
 * @route /api/auth/user/password/{:id}
 * @access private USER
 * @method PUT
 */
const updateUserPassword = AsyncHandler(async (req, res, next) => {
    const id = req.user.id;
    const { old_password, new_Password } = req.body;

    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
            },
        });

        // Check for user old password
        const Check = await bcrypt.compare(old_password, user.password);
        if (!Check)
            throw new ErrorHandler(
                "Old password is wrong please try again",
                400
            );

        // Update user password
        let newPassword = await bcrypt.hash(new_Password, HashSalt);
        const updatedUser = await prisma.user.update({
            where: {
                id,
            },
            data: {
                password: newPassword,
                passwordChangedAt: new Date(),
            },
            include: includes,
        });

        res.status(200).json(Beautify_User(updatedUser));
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Update user Password
 * @route /api/auth/user/preference
 * @access private USER
 * @method PUT
 */
const addToPreferences = AsyncHandler(async (req, res, next) => {
    const id = req.user.id;
    const { meal } = req.body;

    try {
        const preference = await prisma.user_Preferences.findUnique({
            where: {
                userID_mealID: {
                    userID: id,
                    mealID: meal,
                },
            },
        });

        if (preference) {
            await prisma.user_Preferences.delete({
                where: {
                    userID_mealID: {
                        userID: id,
                        mealID: meal,
                    },
                },
            });
        } else {
            await prisma.user_Preferences.create({
                data: {
                    userID: id,
                    mealID: meal,
                },
            });
        }

        const userPreferences = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                preferences: {
                    select: {
                        meal: {
                            include: {
                                ingredients: {
                                    select: {
                                        ingredient: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(Beautify_User(userPreferences));
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Update user Password
 * @route /api/auth/user/preference
 * @access private USER
 * @method GET
 */
const getPreferences = AsyncHandler(async (req, res, next) => {
    const id = req.user.id;

    try {
        const preference = await prisma.user_Preferences.findMany({
            where: {
                userID: id,
            },
            select: {
                meal: {
                    include: {
                        ingredients: {
                            select: {
                                ingredient: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                        dietType: true,
                        dishType: true,
                        MealRates: {
                            select: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                rate: true,
                                rateMessage: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(
            preference.map((p) => ({ ...BeautifyMeal(p.meal) }))[0]
        );
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else next(err);
    }
});

/**
 * @desc Block user
 * @route /api/auth/user/block/{:id}
 * @access private ADMIN
 * @method PUT
 */
const blockUser = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        // Check user existence
        let user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
            },
        });

        // Block user
        user = await prisma.user.update({
            where: {
                id,
            },
            data: {
                blocked: !user.blocked,
            },
        });

        // return response to user
        res.status(200).json({
            message: `User has been ${user.blocked ? "blocked" : "unblocked"} successfully`,
        });
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong; please try again later",
                    500
                )
            );
    }
});

/**
 * @desc Delete user
 * @route /api/auth/user/{:id}
 * @access private ADMIN
 * @method DELETE
 */
const deleteUser = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findFirst({
            where: {
                id,
            },
        });

        console.log(user)

       try{
           // Delete User Image
           await fs.promises.unlink(`public/uploads/users/${user.image}`, () => {});

           // Delete User Plans Folder
           await fs.promises.rmdir(`public/Users_Meals_Ranks/${user.id}`, () => {});
       }catch (err){
           console.log(err)
       }

        console.log("deleting")
        // Delete user
        await prisma.user.delete({
            where: {
                id,
            },
        });

        res.status(200).json({
            message: "User has been removed successfully",
        });
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "There is no user associated with this id",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong; please try again later",
                    500
                )
            );
    }
});

/**
 * @desc System {time} schedule that fires every 12-HOURS
 * @access private
 */
Schedule.scheduleJob("0 * * * *", async () => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { count } = await prisma.verification_Emails.deleteMany({
        where: {
            createdAt: {
                lt: twentyFourHoursAgo,
            },
        },
    });

    console.log(`Schedule: Remove (${count} Emails) at ${new Date()}`);
});

/**
 * @desc Seed Admin data
 * @access private NONE
 */
const AdminSeeder = async () => {
    const HashPassword = await bcrypt.hash("123456@Admin", HashSalt);

    const Admin = {
        name: "Super Admin",
        email: "admin@nutriai.com",
        password: HashPassword,
        role: "ADMIN",
        activated: true,
    };

    try {
        let admin = await prisma.user.upsert({
            where: {
                email: Admin.email,
            },
            create: {
                ...Admin,
            },
            update: {},
        });

        // Init user information
        const hasInfo = await prisma.user_Infos.findFirst({
            where: {
                userID: admin.id,
            },
        });

        if (!hasInfo)
            await prisma.user_Infos
                .create({
                    data: {
                        userID: admin.id,
                    },
                })
                .catch((err) => {
                    throw new ErrorHandler(
                        "Something went wrong trying to generate user information",
                        500
                    );
                });
        console.log("Admin created/Exists");
    } catch (err) {
        console.error("Failed to create 'Admin'");
        console.error(err);
    }
};

module.exports = {
    signup,
    login,
    verifyUser,
    activateUser,
    emailResend,
    listUsers,
    viewOneUser,
    updateAccountData,
    updateUserInfo,
    updateUserPassword,
    blockUser,
    deleteUser,
    AdminSeeder,
    listAdmins,
    addToPreferences,
    getPreferences,
};
