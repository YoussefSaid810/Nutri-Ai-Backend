const { spawn } = require("child_process");
const expressAsyncHandler = require("express-async-handler");
const ErrorHandler = require("../util/ErrorHandler");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const {
    readFileAsync,
    prisma,
    SimplifyMealForAI,
    BeautifyMeals,
} = require("./AiService");

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
                const planName = `Plane-${Date.now()}-${uuidv4()}.txt`;
                const planMeals = dataBuffer
                    .replace("\r\n", "")
                    .split(",")
                    .map((meal) => ({
                        id: meal.split("_")[0],
                        quantity: meal.split("_")[1],
                    }));

                await fs.promises.writeFile(
                    `public/Users_Meals_Ranks/${user.id}/daily_plans/${planName}`,
                    JSON.stringify(planMeals.map((meal) => meal.id))
                );

                await prisma.user_Daily_Plans.create({
                    data: {
                        userID: user.id,
                        plan: `/Users_Meals_Ranks/${user.id}/daily_plans/${planName}`,
                    },
                });

                const generatedPlanMeals = await prisma.meal.findMany({
                    where: { id: { in: planMeals.map((meal) => meal.id) } },
                });

                const handledPlan = planMeals.map((planMeal, idx) => {
                    const newMeal = generatedPlanMeals.find(
                        (meal) => meal.id === planMeal.id
                    );

                    const sequence = ["breakfast", "lunch", "dinner", "snack"];
                    return {
                        [sequence[idx]]: {
                            ...BeautifyMeals(newMeal),
                            quantity: Math.round(Number(planMeal.quantity)),
                        },
                    };
                });

                res.status(200).json({ handledPlan });
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
