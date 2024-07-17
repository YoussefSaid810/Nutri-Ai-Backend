const { spawn } = require("child_process");
const expressAsyncHandler = require("express-async-handler");
const ErrorHandler = require("../util/ErrorHandler");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const { v4: uuidv4 } = require("uuid");

const SimplifyMealForAI = (meal) => {
    if (meal.ingredients)
        meal.ingredients = meal.ingredients.map((i) => i.ingredient.name);

    let newMeal = {
        ...meal,
        weightPerServing: meal.quantity,
        ingredients: meal.ingredients.join(","),
    };
    const Types = [
        "VEGETARIAN",
        "VEGAN",
        "GLUTENFREE",
        "DAIRYFREE",
        "LOWFODMAP",
        "KETOGENIC",
        "WHOLE30",
    ];
    Types.forEach((t) => {
        newMeal[t] = false;
    });
    newMeal.dietType.forEach(({ type }) => {
        newMeal[type] = true;
    });
    delete newMeal.dietType;
    delete newMeal.MealRates;
    newMeal.dishType = meal.dishType
        .map((d) => d.type)
        .join(",")
        .toLowerCase();
    return newMeal;
};

const BeautifyMeals = (meal) => {
    if (meal.ingredients)
        meal.ingredients = meal.ingredients.map((i) => ({
            id: i.ingredient.id,
            name: i.ingredient.name,
        }));
    if (meal.dietType) meal.dietType = meal.dietType.map((i) => i.type);
    if (meal.dishType) meal.dishType = meal.dishType.map((i) => i.type);

    return meal;
};

/**
 * @desc rank meals for a given preferences
 * @route /api/AI/rank_meals_DB
 * @access private
 * @method PUT
 */
const Rank_My_Meals = expressAsyncHandler(async (req, res, next) => {
    const user = req.user;
    let { preferences, excludes, dietType } = req.body;

    if (!excludes || excludes.length === 0) {
        excludes = ["qddcz#@!#%$"];
    }

    if (dietType === "") {
        dietType = "None";
    }

    let meals = null;

    // Get meals from Database
    try {
        meals = await prisma.meal.findMany({
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
        });
        meals = meals.map((meal) => SimplifyMealForAI(meal));
    } catch (err) {
        console.log(err);
        next(new ErrorHandler("Something went wrong trying to get meals"));
    }

    if (!meals || meals.length === 0) {
        next(new ErrorHandler("No meals found"));
    }

    // Call the Python script to generate the meal plan
    // Start Script
    const pythonProcess = spawn("python", [
        path.join(__dirname, "../AI/main.py"),
        "rank_meals",
        preferences,
        excludes,
        dietType,
    ]);

    pythonProcess.stdin.write(JSON.stringify(meals));
    pythonProcess.stdin.end();

    let dataBuffer = "";

    // Collect outputs
    pythonProcess.stdout.on("data", (data) => {
        dataBuffer += data.toString();
    });

    // handle errors
    pythonProcess.stderr.on("data", (data) => {
        pythonProcess.stderr.on("data", (data) => {
            const message = data.toString();
            // Check if the message contains warnings or deprecations
            if (
                !message.includes("WARNING:") &&
                !message.includes("DeprecationWarning") &&
                !message.includes("Depre") &&
                !message.includes("warn") &&
                !message.includes("TensorFlow binary is optimized")
            ) {
                console.log("--------------err:", message);
                pythonProcess.kill();
            }
        });
    });

    pythonProcess.on("close", async (code) => {
        if (code === 0) {
            // Save results & Generating user plans directory structure
            fs.mkdir(
                `public/Users_Meals_Ranks/${user.id}`, // Generate parent's folder with user.ID
                async function (err) {
                    if (err && err.errno !== -4075) {
                        console.log("--err:", err);
                    } else {
                        fs.mkdir(
                            `public/Users_Meals_Ranks/${user.id}/daily_plans`, // Generate daily plans folder
                            async function (err) {
                                if (err && err.errno !== -4075) {
                                    console.log(err);
                                    next(
                                        new ErrorHandler(
                                            "Something went wrong trying to save your data",
                                            code
                                        )
                                    );
                                } else {
                                    fs.writeFile(
                                        `public/Users_Meals_Ranks/${user.id}/rankedMeals.txt`,
                                        dataBuffer,
                                        async (err) => {
                                            if (err) {
                                                console.error(
                                                    "Error writing data to file:",
                                                    err
                                                );
                                                // Send an error response if writing to file fails
                                                next(
                                                    new ErrorHandler(
                                                        "Something went wrong while saving data to file",
                                                        500
                                                    )
                                                );
                                            } else {
                                                const ids = dataBuffer
                                                    .toString()
                                                    .split("\r\n");
                                                const generatedPlanMeals =
                                                    await prisma.meal.findMany({
                                                        where: {
                                                            id: {
                                                                in: ids,
                                                            },
                                                        },
                                                        include: {
                                                            ingredients: {
                                                                select: {
                                                                    ingredient:
                                                                        {
                                                                            select: {
                                                                                id: true,
                                                                                name: true,
                                                                            },
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
                                                    });
                                                res.status(200).json({
                                                    data: generatedPlanMeals.map(
                                                        (meal) =>
                                                            BeautifyMeals(meal)
                                                    ),
                                                });
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );
        } else
            next(
                new ErrorHandler(
                    "Something went wrong with Nutri-AI please try again later",
                    500
                )
            );
    });
});

/**
 * @desc get plan per day
 * @route /api/AI/one_meal
 * @access private
 * @method GET
 */
const Generate_Plan = expressAsyncHandler(async (req, res, next) => {
    const user = req.user;

    try {
        const data = await readFileAsync(
            `public/Users_Meals_Ranks/${user.id}/rankedMeals.txt`
        );
        const indices = data.toString().split("\r\n").filter(Boolean);

        const meals = await prisma.meal.findMany({
            where: { id: { in: indices } },
            include: {
                ingredients: {
                    select: {
                        ingredient: { select: { id: true, name: true } },
                    },
                },
                dietType: true,
                dishType: true,
                MealRates: {
                    select: {
                        User: { select: { id: true, name: true } },
                        rate: true,
                        rateMessage: true,
                    },
                },
            },
        });

        const simplifiedMeals = meals.map(SimplifyMealForAI);

        const pythonProcess = spawn("python", [
            path.join(__dirname, "../AI/main.py"),
            "generate_one_plan",
        ]);

        pythonProcess.stdin.write(JSON.stringify(simplifiedMeals) + "\n");
        pythonProcess.stdin.write(JSON.stringify(user.information[0]) + "\n");
        pythonProcess.stdin.end();

        let dataBuffer = "";

        pythonProcess.stdout.on("data", (data) => {
            dataBuffer += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            const message = data.toString();
            if (
                !message.includes("WARNING:") &&
                !message.includes("DeprecationWarning") &&
                !message.includes("Depre") &&
                !message.includes("warn") &&
                !message.includes("TensorFlow binary is optimized")
            ) {
                console.log("--------------err:", message);
                pythonProcess.kill();
            }
        });

        pythonProcess.on("close", async (code) => {
            if (code === 0) {
                const currentDate = Date.now();
                const planName = `Plane-${currentDate}-${uuidv4()}.txt`;
                const planMeals = dataBuffer
                    .replace("\r\n", "")
                    .split(",")
                    .map((meal) => ({
                        id: meal.split("_")[0],
                        quantity: meal.split("_")[1],
                    }));

                await fs.promises.writeFile(
                    `public/Users_Meals_Ranks/${user.id}/daily_plans/${planName}`,
                    JSON.stringify(planMeals)
                );

                let data = await prisma.user_Daily_Plans.create({
                    data: {
                        userID: user.id,
                        plan: `/Users_Meals_Ranks/${user.id}/daily_plans/${planName}`,
                    },
                });

                const generatedPlanMeals = await prisma.meal.findMany({
                    where: { id: { in: planMeals.map((meal) => meal.id) } },
                });

                let handledPlan = {};
                planMeals.forEach((planMeal, idx) => {
                    const newMeal = generatedPlanMeals.find(
                        (meal) => meal.id === planMeal.id
                    );

                    const sequence = ["breakfast", "lunch", "dinner", "snack"];
                    handledPlan[sequence[idx]] = {
                        ...BeautifyMeals(newMeal),
                        quantity: Math.round(Number(planMeal.quantity)),
                    };
                });

                res.status(200).json({
                    planDate: data.createdAt,
                    plan: handledPlan,
                });
            } else {
                next(
                    new ErrorHandler(
                        "Something went wrong with Nutri-AI, please try again later",
                        500
                    )
                );
            }
        });
    } catch (err) {
        if (err.code === "ENOENT") {
            next(new ErrorHandler("Please rank your meals first", 404));
        } else {
            console.error(err);
            next(
                new ErrorHandler(
                    "Something went wrong with Nutri-AI, please try again later",
                    500
                )
            );
        }
    }
});

/**
 * @desc get plan per day
 * @route /api/AI/ranked_meals
 * @access private
 * @method GET
 */
const Get_Current_Rank = expressAsyncHandler(async (req, res, next) => {
    const user = req.user;

    try {
        const data = await readFileAsync(
            `public/Users_Meals_Ranks/${user.id}/rankedMeals.txt`
        );

        const ids = data.toString().split("\r\n");

        const generatedPlanMeals = await prisma.meal.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: {
                ingredients: {
                    select: {
                        ingredient: {
                            select: {
                                id: true,
                                name: true,
                            },
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
        });

        res.status(200).json({
            data: generatedPlanMeals.map((meal) => BeautifyMeals(meal)),
        });
    } catch (err) {
        if (err.code === "ENOENT") {
            next(new ErrorHandler("Please Rank your meals first", 404));
        } else {
            next(
                new ErrorHandler(
                    "Something went wrong with Nutri-AI; please try again later",
                    500
                )
            );
        }
    }
});

/**
 * @desc get plan per day
 * @route /api/AI/daily_plans
 * @access private
 * @method GET
 */
const Get_Current_Daily_Plans = expressAsyncHandler(async (req, res, next) => {
    const user = req.user;

    try {
        let dailyPlans = await prisma.user_Daily_Plans.findMany({
            where: {
                userID: user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        let userPlans = [];

        await Promise.all(
            dailyPlans.map(async ({ plan, createdAt }) => {
                try {
                    let data = await fs.promises.readFile(`public/${plan}`);
                    let planedMeals = JSON.parse(data.toString());

                    let meals = await prisma.meal.findMany({
                        where: {
                            id: {
                                in: planedMeals.map((plan) => plan.id),
                            },
                        },
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
                    });

                    let handledPlan = {};
                    planedMeals.forEach((planMeal, idx) => {
                        const newMeal = meals.find(
                            (meal) => meal.id === planMeal.id
                        );

                        const sequence = [
                            "breakfast",
                            "lunch",
                            "dinner",
                            "snack",
                        ];

                        handledPlan[sequence[idx]] = {
                            ...BeautifyMeals(newMeal),
                            quantity: Math.round(Number(planMeal.quantity)),
                        };
                    });

                    userPlans.push({ planDate: createdAt, plan: handledPlan });
                } catch (err) {
                    console.error("Error while processing plan:", err);
                    // Handle errors if needed
                }
            })
        );

        res.status(200).json(userPlans);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "something went wrong while trying to get your data",
        });
    }
});

module.exports = {
    Rank_My_Meals,
    Generate_Plan,
    Get_Current_Rank,
    Get_Current_Daily_Plans,
};
