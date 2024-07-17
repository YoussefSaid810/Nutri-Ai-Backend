const { check } = require("express-validator");
const ValidateHandler = require("../../util/ValidatorHandler");
// const Meal = require("../../model/mealModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MealArrayHandler = (req, res, next) => {
    if (req.body.dietTypes)
        req.body.dietTypes = JSON.parse(req.body.dietTypes) || [];
    if (req.body.dishTypes)
        req.body.dishTypes = JSON.parse(req.body.dishTypes) || [];
    if (req.body.ingredients)
        req.body.ingredients = JSON.parse(req.body.ingredients) || [];

    next();
};

const addMealValidation = [
    check("name")
        .notEmpty()
        .withMessage("This field is required")
        .isLength({ min: 3 })
        .withMessage("Length can't be less than 3 characters")
        .isLength({ max: 32 })
        .withMessage("Length can't be greater than 32 characters")
        .matches("^[a-zA-z]+[a-zA-z0-9_-]*")
        .withMessage("Category name should start with alphabetical characters")
        .custom(async (_, { req }) => {
            const meal = await prisma.meal.findFirst({
                where: {
                    name: req.body.name.trim(),
                },
            });

            if (meal) {
                throw new Error("A meal with this name already exists");
            }

            return true;
        }),
    check("measure").notEmpty().withMessage("This field is required"),
    check("quantity")
        .notEmpty()
        .withMessage("This field is required")
        .isNumeric({ min: 1 })
        .withMessage("This field should be a number & greater than 1"),
    check("ingredients")
        .isArray()
        .withMessage("This field should be an array of strings"),
    check("dietTypes")
        .isArray()
        .withMessage("This field should be an array of Diet Types")
        .custom((dietTypes, _) => {
            const dietRGX = [
                "VEGETARIAN",
                "VEGAN",
                "GLUTENFREE",
                "DAIRYFREE",
                "LOWFODMAP",
                "KETOGENIC",
                "WHOLE30",
            ];
            dietTypes.forEach((type) => {
                let condition = dietRGX.indexOf(type) !== -1;
                if (!condition) {
                    throw new Error(
                        "Dish type should be an array of this values [VEGETARIAN|VEGAN|GLUTENFREE|DAIRYFREE|LOWFODMAP|KETOGENIC|WHOLE30]"
                    );
                }
            });
            return true;
        }),
    check("dishTypes")
        .isArray()
        .withMessage("This field should be an array of Dish Types")
        .custom((dishTypes, _) => {
            const dishRGX = ["BREAKFAST", "LUNCH", "SNACK"];
            dishTypes.forEach((type) => {
                let condition = dishRGX.indexOf(type) !== -1;
                if (!condition)
                    throw new Error(
                        "Dish type should be an array of this values [BREAKFAST|LUNCH|SNACK]"
                    );
            });
            return true;
        }),
    ValidateHandler,
];

const getMealsValidation = [
    check("id").notEmpty().withMessage("ID should be a valid number"),
    ValidateHandler,
];

const getListOfMealsValidation = [
    check("meals_id")
        .isArray({ min: 1 })
        .withMessage("please provide a list of IDs"),
    ValidateHandler,
];

const updateMealValidation = [
    check("id").notEmpty().withMessage("ID should be a valid number"),
    check("name")
        .optional()
        .notEmpty()
        .withMessage("This field is required")
        .isLength({ min: 3 })
        .withMessage("Length can't be less than 3 characters")
        .isLength({ max: 32 })
        .withMessage("Length can't be greater than 32 characters")
        .matches("^[a-zA-z]+[a-zA-z0-9_-]*")
        .withMessage("Category name should start with alphabitical charachters")
        .custom(async (_, { req }) => {
            const { id } = req.params;
            const name = req.body.name.trim();
            const meal = await prisma.meal.findFirst({
                where: {
                    AND: {
                        name,
                        NOT: {
                            id,
                        },
                    },
                },
            });

            if (meal) {
                throw new Error("A meal with this name already exists");
            }

            return true;
        }),
    check("measure")
        .optional()
        .notEmpty()
        .withMessage("This field is required"),
    check("quantity")
        .optional()
        .notEmpty()
        .withMessage("This field is required")
        .isNumeric({ min: 1 })
        .withMessage("This field should be a number & greater than 1"),
    check("ingredients")
        .optional()
        .isArray()
        .withMessage("This field should be an array of strings"),
    check("dietTypes")
        .optional()
        .isArray()
        .withMessage("This field should be an array of Diet Types")
        .custom((dietTypes, _) => {
            const dietRGX = [
                "VEGETARIAN",
                "VEGAN",
                "GLUTENFREE",
                "DAIRYFREE",
                "LOWFODMAP",
                "KETOGENIC",
                "WHOLE30",
            ];
            dietTypes.forEach((type) => {
                let condition = dietRGX.indexOf(type) !== -1;
                if (!condition) {
                    throw new Error(
                        "Dish type should be an array of this values [VEGETARIAN|VEGAN|GLUTENFREE|DAIRYFREE|LOWFODMAP|KETOGENIC|WHOLE30]"
                    );
                }
            });
            return true;
        }),
    check("dishTypes")
        .optional()
        .isArray()
        .withMessage("This field should be an array of Dish Types")
        .custom((dishTypes, _) => {
            const dishRGX = ["BREAKFAST", "LUNCH", "SNACK"];
            dishTypes.forEach((type) => {
                let condition = dishRGX.indexOf(type) !== -1;
                if (!condition)
                    throw new Error(
                        "Dish type should be an array of this values [BREAKFAST|LUNCH|SNACK]"
                    );
            });
            return true;
        }),
    ValidateHandler,
];

const deleteMealValidation = [
    check("id").notEmpty().withMessage("ID should be a valid number"),
    ValidateHandler,
];

const rateMealValidation = [
    check("id").notEmpty().withMessage("ID should be a valid number"),
    check("rate")
        .optional()
        .isNumeric({ min: 0, max: 5 })
        .withMessage("Rate should be in the range of [0-5]"),
    check("rateMessage")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Rate Message can't exceed 500 character"),
    ValidateHandler,
];

module.exports = {
    addMealValidation,
    getMealsValidation,
    updateMealValidation,
    deleteMealValidation,
    rateMealValidation,
    MealArrayHandler,
    getListOfMealsValidation,
};
