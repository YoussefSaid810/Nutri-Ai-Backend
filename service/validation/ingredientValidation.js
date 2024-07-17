const { check } = require("express-validator");
const ValidateHandler = require("../../util/ValidatorHandler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const addIngredientValidation = [
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
            const Ingredient = await prisma.ingredients.findFirst({
                where: {
                    name: ("" + req.body.name).trim().toLowerCase(),
                },
            });

            if (Ingredient) {
                throw new Error("An ingredient with this name already exists");
            }
        }),
    ValidateHandler,
];

const updateIngredientValidation = [
    check("id")
        .notEmpty()
        .withMessage("ID is required in this kind of requests"),
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
            const Ingredient = await prisma.ingredients.findFirst({
                where: {
                    name: ("" + req.body.name).trim().toLowerCase(),
                },
            });

            if (Ingredient) {
                throw new Error("An ingredient with this name already exists");
            }
        }),
    ValidateHandler,
];

const deleteIngredientValidation = [
    check("id")
        .notEmpty()
        .withMessage("ID is required in this kind of requests"),
    ValidateHandler,
];

module.exports = {
    addIngredientValidation,
    updateIngredientValidation,
    deleteIngredientValidation,
};
