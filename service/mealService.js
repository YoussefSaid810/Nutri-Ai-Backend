const AsyncHandler = require("express-async-handler");
const ErrorHandler = require("../util/ErrorHandler");
const JWT = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const CombineObjects = require("../util/CombineObjects");
const fs = require("fs");
const { parse } = require("csv-parse");

// Shared include values for Prisma queries
const IncludeValues = {
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
};
// Utility function to beautify meal data
const BeautifyMeal = (meal) => {
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
 * @desc Create new meal
 * @route /api/meal
 * @access private
 * @method POST
 */
const addMeal = AsyncHandler(async (req, res, next) => {
    let {
        name,
        image,
        measure,
        quantity,
        ingredients,
        dietTypes,
        dishTypes,
        calories,
        fats,
        carbs,
        protein,
    } = req.body;

    quantity = Number(quantity);
    calories = Number(calories);
    fats = Number(fats);
    carbs = Number(carbs);
    protein = Number(protein);

    // Remove spaces and update ingredients type case
    const ingredsValues = ingredients.map((value) =>
        value.trim().toLowerCase()
    );

    try {
        // Create new added ingredients
        await prisma.ingredients.createMany({
            data: ingredsValues.map((i) => {
                return {
                    name: i,
                };
            }),
            skipDuplicates: true,
        });

        // Retrieve meal's ingredient records from the database
        const MealIngredients = await prisma.ingredients.findMany({
            where: {
                name: {
                    in: ingredsValues,
                },
            },
        });

        // Create new meal with included ingredients
        const meal = await prisma.meal.create({
            data: {
                name: name.trim().toLowerCase(),
                image: `/${image}`,
                measure: measure.trim().toLowerCase(),
                quantity,
                calories,
                fats,
                carbs,
                protein,
                ingredients: {
                    create: MealIngredients.map((ingredient) => ({
                        ingredient: {
                            connect: { id: ingredient.id },
                        },
                    })),
                },
                dietType: {
                    create: dietTypes.map((diet) => {
                        return {
                            type: diet,
                        };
                    }),
                },
                dishType: {
                    create: dishTypes.map((dish) => {
                        return {
                            type: dish,
                        };
                    }),
                },
            },
            include: IncludeValues,
        });

        res.status(200).json(BeautifyMeal(meal));
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to create a new meal",
                400
            )
        );
    }
});

/**
 * @desc List all meals
 * @route /api/meal/admin
 * @access public
 * @method GET
 */
const listMealsAdmin = AsyncHandler(async (req, res, next) => {
    const countPerPage = Number(req.query.mealsPerPage) || 9;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * countPerPage;

    let meals = [];
    try {
        // Fetch meals with included ingredients
        meals = await prisma.meal.findMany({
            include: IncludeValues,
            skip,
            take: countPerPage,
            orderBy: {
                popularity: "desc",
            },
        });
        let count = await prisma.meal.count();
        res.status(200).json({ data: meals.map(BeautifyMeal), total: count });
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to fetch the data",
                400
            )
        );
    }
});

/**
 * @desc List all meals
 * @route /api/meal
 * @access public
 * @method GET
 */
const listMeals = AsyncHandler(async (req, res, next) => {
    const countPerPage = Number(req.query.mealsPerPage) || 9;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * countPerPage;

    let meals = [];
    try {
        // Fetch meals with included ingredients
        meals = await prisma.meal.findMany({
            where: {
                hidden: false,
            },
            include: IncludeValues,
            skip,
            take: countPerPage,
            orderBy: {
                popularity: "desc",
            },
        });
        let count = await prisma.meal.count();
        res.status(200).json({ data: meals.map(BeautifyMeal), total: count });
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to fetch you the data",
                400
            )
        );
    }
});

/**
 * @desc Get List of meals with id
 * @route /api/meal/list
 * @access public
 * @method GET
 */
const listOfMeals = AsyncHandler(async (req, res, next) => {
    const { meals_id } = req.body;

    let mealsIDs = meals_id.map((meal) => meal.id);
    try {
        // Fetch meals with included ingredients
        let meals = await prisma.meal.findMany({
            where: {
                id: {
                    in: mealsIDs,
                },
            },
            include: IncludeValues,
        });

        res.status(200).json({ preferences: meals.map(BeautifyMeal) });
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to get you the data",
                400
            )
        );
    }
});

/**
 * @desc Create new meal
 * @route /api/meal/{:id}
 * @access public
 * @method GET
 */
const viewOneMeal = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        // Fetch a single meal with included ingredients
        const meal = await prisma.meal.findFirst({
            where: { id },
            include: IncludeValues,
        });

        res.status(200).json(BeautifyMeal(meal));
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to retrieve the meal",
                400
            )
        );
    }
});

/**
 * @desc Update meal data
 * @route /api/meal/{:id}
 * @access private
 * @method PUT
 */
const updateMeal = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        image,
        measure,
        quantity,
        ingredients,
        dishTypes,
        dietTypes,
        calories,
        fats,
        carbs,
        protein,
        percentFat,
        percentCarbs,
        percentProtein,
        cuisines,
        sourceURL,
        popularity,
        hidden,
    } = req.body;

    try {
        // Fetch the meal you want to update with included ingredients
        const mealToUpdate = await prisma.meal.findUnique({
            where: { id },
        });

        if (!mealToUpdate) {
            throw new ErrorHandler("NF1", 404); // Not found 1
        }

        // Create a new object with the updated meal properties
        let updatedMealData = {
            name: (name + "").trim().toLowerCase(),
            image,
            measure: (measure + "").trim().toLowerCase(),
            quantity,
            calories,
            fats,
            carbs,
            protein,
            percentFat,
            percentCarbs,
            percentProtein,
            cuisines,
            sourceURL,
            popularity,
            hidden,
        };

        // Remove all old ingredients if provided
        if (ingredients) {
            // Remove all old meal's ingredients
            await prisma.mealIngredients.deleteMany({
                where: {
                    mealID: id,
                },
            });

            // Validate ingredient values
            const ingredsValues = ingredients.map((value) =>
                value.trim().toLowerCase()
            );

            // Create new added ingredients
            await prisma.ingredients.createMany({
                data: ingredsValues.map((i) => {
                    return {
                        name: i,
                    };
                }),
                skipDuplicates: true,
            });

            // Retrieve meal's ingredient records from the database
            const MealIngredients = await prisma.ingredients.findMany({
                where: {
                    name: {
                        in: ingredsValues,
                    },
                },
            });

            updatedMealData.ingredients = {
                create: MealIngredients.map((ingredient) => ({
                    ingredient: {
                        connect: { id: ingredient.id },
                    },
                })),
            };
        }

        // Remove all old dish types if provided
        if (dishTypes) {
            await prisma.dishType.deleteMany({
                where: {
                    mealID: id,
                },
            });

            updatedMealData.dishType = {
                create: dishTypes.map((dish) => {
                    return {
                        type: dish,
                    };
                }),
            };
        }

        // Remove all old diet types if provided
        if (dietTypes) {
            await prisma.dietType.deleteMany({
                where: {
                    mealID: id,
                },
            });

            updatedMealData.dietType = {
                create: dietTypes.map((diet) => {
                    return {
                        type: diet,
                    };
                }),
            };
        }

        // Combine update data and remove undefined
        updatedMealData = CombineObjects(mealToUpdate, updatedMealData);

        // Update meal data
        let updatedMeal = await prisma.meal.update({
            where: { id },
            data: updatedMealData,
            include: IncludeValues,
        });

        // Return response to user
        res.status(200).json(BeautifyMeal(updatedMeal));
    } catch (err) {
        console.log(err);
        if (err.message === "NF1") {
            next(
                new ErrorHandler("No meal found associated with this ID", 400)
            );
        } else {
            next(err);
        }
    }
});

/**
 * @desc Delete an existing meal
 * @route /api/meal/{:id}
 * @access private
 * @method Delete
 */
const deleteMeal = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Delete a Meal
    try {
        await prisma.meal.delete({ where: { id } });
        res.status(200).json({
            message: "Meal has been removed successfully",
        });
    } catch (err) {
        next(new ErrorHandler("No meal found with this ID", 404));
    }
});

/**
 * @desc add rate to meal data
 * @route /api/meal/rate/{:id}
 * @access private
 * @method POST
 */
const rateMeal = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { rate, rateMessage } = req.body;
    const user = req.user;

    // add or update meal rate
    try {
        const newRate = {
            rate: rate && Number(rate),
            rateMessage,
            mealId: id,
            userId: user.id,
        };
        let UserRate = await prisma.mealRates.upsert({
            where: {
                userId_mealId: {
                    mealId: id,
                    userId: user.id,
                },
            },
            create: newRate,
            update: newRate,
        });

        res.status(200).json(UserRate);
    } catch (err) {
        console.log(err);
        next(new ErrorHandler("No meal found with this ID", 404));
    }
});

module.exports = {
    rateMeal,
    BeautifyMeal,
    addMeal,
    listMeals,
    listOfMeals,
    viewOneMeal,
    updateMeal,
    deleteMeal,
    listMealsAdmin,
};

const readCSV = async () => {
    let start = false;
    const results = [];
    fs.createReadStream("newfood.csv")
        .pipe(parse())
        .on("data", (data) => {
            if (!start) start = true;
            else results.push(data);
        })
        .on("end", async () => {
            for (const record of results) {
                let [
                    id,
                    title,
                    pricePerServing,
                    weightPerServing,
                    vegetarian,
                    vegan,
                    glutenFree,
                    dairyFree,
                    sustainable,
                    veryHealthy,
                    veryPopular,
                    gaps,
                    lowFodmap,
                    ketogenic,
                    whole30,
                    readyInMinutes,
                    spoonacularSourceUrl,
                    image,
                    aggregateLikes,
                    spoonacularScore,
                    healthScore,
                    percentProtein,
                    percentFat,
                    percentCarbs,
                    dishTypes,
                    ingredients,
                    cuisines,
                    calories,
                    Fat,
                    SaturatedFat,
                    Carbohydrates,
                    Sugar,
                    Cholesterolg,
                    Sodium,
                    Protein,
                    VitaminB3,
                    Seleniumg,
                    Phosphorusg,
                    Irong,
                    VitaminB2,
                    Calciumg,
                    VitaminB1,
                    Folateg,
                    Potassiumg,
                    Copperg,
                    Zincg,
                    Manganeseg,
                    Magnesiumg,
                    VitaminB102g,
                    VitaminB5,
                    VitaminB6,
                    VitaminE,
                    Fiber,
                    VitaminA,
                    VitaminD,
                    VitaminK,
                    VitaminC,
                    Alcoholg,
                    Caffeine,
                ] = record;

                const haramRGX = /^.*(wine|pork|ham|beer|champagne).*$/gm;

                const ingredsValues = ingredients
                    .split(",")
                    .map((i) => i.toLowerCase().trim());

                try {
                    let dietType = [];
                    if (vegetarian === "TRUE") dietType.push("VEGETARIAN");
                    if (vegan === "TRUE") dietType.push("VEGAN");
                    if (glutenFree === "TRUE") dietType.push("GLUTENFREE");
                    if (dairyFree === "TRUE") dietType.push("DAIRYFREE");
                    if (lowFodmap === "TRUE") dietType.push("LOWFODMAP");
                    if (ketogenic === "TRUE") dietType.push("KETOGENIC");
                    if (whole30 === "TRUE") dietType.push("WHOLE30");

                    let dishTypeS = [];
                    if (dishTypes.includes("snack")) dishTypeS.push("SNACK");
                    if (dishTypes.includes("lunch")) dishTypeS.push("LUNCH");
                    if (dishTypes.includes("side dish"))
                        dishTypeS.push("SIDE_DISH");
                    if (dishTypes.includes("salad"))
                        dishTypeS.push("BREAKFAST");
                    if (dishTypes.includes("soup")) dishTypeS.push("SOUP");
                    if (dishTypes.includes("sauce")) dishTypeS.push("SAUCE");

                    const meal = {
                        name: title,
                        image,
                        quantity: Number(weightPerServing),
                        measure: "gram",
                        calories: Number(calories),
                        fats: Number(Fat),
                        carbs: Number(Carbohydrates),
                        protein: Number(Protein),
                        percentProtein: Number(percentProtein),
                        percentFat: Number(percentFat),
                        percentCarbs: Number(percentCarbs),
                        cuisines,
                        sourceURL: spoonacularSourceUrl,
                        popularity: 50,
                    };
                    // Create new added ingredients
                    const ingreds = ingredsValues.map((i) => {
                        if (!haramRGX.test(i))
                            return {
                                name: i,
                            };
                        else throw new Error("skip ingred:", i);
                    });
                    await prisma.ingredients.createMany({
                        data: ingreds,
                        skipDuplicates: true,
                    });

                    // Retrieve meal's ingredient records from the database
                    const MealIngredients = await prisma.ingredients.findMany({
                        where: {
                            name: {
                                in: ingredsValues,
                            },
                        },
                    });

                    // Create new meal with included ingredients
                    await prisma.meal.create({
                        data: {
                            ...meal,
                            ingredients: {
                                create: MealIngredients.map((ingredient) => ({
                                    ingredient: {
                                        connect: { id: ingredient.id },
                                    },
                                })),
                            },
                            dietType: {
                                create: dietType.map((diet) => ({
                                    type: diet,
                                })),
                            },
                            dishType: {
                                create: dishTypeS.map((dish) => ({
                                    type: dish,
                                })),
                            },
                        },
                    });

                    console.log("index: ", +id + 1);
                } catch (err) {
                    console.log("skip: ", err);
                    continue;
                }
            }
        });
    console.log("add Done");
};

const readEG_CSV = async () => {
    let start = false;
    const results = [];
    fs.createReadStream("EgpData.csv")
        .pipe(parse())
        .on("data", (data) => {
            if (!start) start = true;
            else results.push(data);
        })
        .on("end", async () => {
            for (const record of results) {
                let [
                    id,
                    name,
                    weightPerServing,
                    dietTypes,
                    image,
                    dishTypes,
                    ingredients,
                    calories,
                    fats,
                    carbs,
                    protein,
                ] = record;

                const haramRGX = /^.*(wine|pork|ham|beer|champagne).*$/gm;

                const ingredsValues = ingredients
                    .split(", ")
                    .map((i) => i.toLowerCase().trim());

                try {
                    dietTypes = dietTypes.split(", ").map((d) => {
                        if (
                            d.toLowerCase().includes("vegan") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "VEGAN";
                        else if (
                            d.toLowerCase().includes("gluten-free") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "GLUTENFREE";
                        else if (
                            d.toLowerCase().includes("vegetarian") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "VEGETARIAN";
                        else if (
                            d.toLowerCase().includes("dairy-free") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "DAIRYFREE";
                        else if (
                            d.toLowerCase().includes("gluten-free") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "GLUTENFREE";
                        else return "WHOLE30";
                    });

                    dishTypes = dishTypes.split(", ").map((d) => {
                        if (
                            d.toLowerCase().includes("breakfast") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "BREAKFAST";
                        else if (
                            d.toLowerCase().includes("dinner") ||
                            d.toLowerCase().includes("main course") ||
                            d.toLowerCase().includes("lunch")
                        )
                            return "LUNCH";
                        else if (
                            (d.toLowerCase().includes("snack") ||
                                d.toLowerCase().includes("dessert") ||
                                d.toLowerCase().includes("drink")) &&
                            !d.toLowerCase().includes("not")
                        )
                            return "SNACK";
                        else if (
                            (d.toLowerCase().includes("appetizer") ||
                                d.toLowerCase().includes("side dish")) &&
                            !d.toLowerCase().includes("not")
                        )
                            return "SIDE_DISH";
                        else if (
                            (d.toLowerCase().includes("dip") ||
                                d.toLowerCase().includes("soup")) &&
                            !d.toLowerCase().includes("not")
                        )
                            return "SOUP";
                        else if (
                            d.toLowerCase().includes("salad") &&
                            !d.toLowerCase().includes("not")
                        )
                            return "SIDE_DISH";
                    });

                    weightPerServing = weightPerServing.split(" ");
                    let measure = "";
                    if (weightPerServing.length === 1) {
                        weightPerServing[0] = Number(
                            weightPerServing[0].slice(
                                0,
                                weightPerServing[0].length - 1
                            )
                        );
                        measure = "gram";
                    } else {
                        weightPerServing.forEach((part, idx) => {
                            if (idx !== 0) measure += part + " ";
                        });
                    }

                    const meal = {
                        name,
                        image,
                        quantity: Number(weightPerServing[0]),
                        measure,
                        calories: Number(calories),
                        fats: Number(fats),
                        carbs: Number(carbs),
                        protein: Number(protein),
                        cuisines: "Egyptian, Egypt, Eg",
                        popularity: 90,
                    };
                    // Create new added ingredients
                    const ingreds = ingredsValues.map((i) => {
                        if (!haramRGX.test(i))
                            return {
                                name: i,
                            };
                        else throw new Error("skip ingred:", i);
                    });
                    await prisma.ingredients.createMany({
                        data: ingreds,
                        skipDuplicates: true,
                    });

                    // Retrieve meal's ingredient records from the database
                    const MealIngredients = await prisma.ingredients.findMany({
                        where: {
                            name: {
                                in: ingredsValues,
                            },
                        },
                    });

                    // Create new meal with included ingredients
                    await prisma.meal.create({
                        data: {
                            ...meal,
                            ingredients: {
                                create: MealIngredients.map((ingredient) => ({
                                    ingredient: {
                                        connect: { id: ingredient.id },
                                    },
                                })),
                            },
                            dietType: {
                                create: dietTypes.map((type) => ({ type })),
                            },
                            dishType: {
                                create: dishTypes.map((type) => ({ type })),
                            },
                        },
                    });

                    console.log("index: ", +id + 1);
                } catch (err) {
                    console.log("skip: ", err);
                    continue;
                }
            }
        });
    console.log("add Done");
};

// readCSV();
