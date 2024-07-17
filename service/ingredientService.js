const AsyncHandler = require("express-async-handler");
const ErrorHandler = require("../util/ErrorHandler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc Create new ingredient
 * @route /api/ingredient
 * @access private
 * @method POST
 */
const addIngredient = AsyncHandler(async (req, res, next) => {
    const { name } = req.body;
    const data = { name: ("" + name).toLowerCase().trim() };

    try {
        const ingredient = await prisma.ingredients.create({
            data,
        });
        res.status(200).json(ingredient);
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying create new ingredient",
                400
            )
        );
    }
});

/**
 * @desc Get all existed ingredients
 * @route /api/ingredient
 * @access public
 * @method GET
 */
const listIngredients = AsyncHandler(async (req, res, next) => {
    const countPerPage = Number(req.query.countPerPage) || 99;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * countPerPage;

    try {
        let Ingredients = await prisma.ingredients.findMany({
            skip: skip,
            take: countPerPage,
        });

        res.status(200).json(Ingredients);
    } catch (err) {
        next(
            new ErrorHandler(
                "Something went wrong trying to get you the data",
                500
            )
        );
    }
});

/**
 * @desc search for ingredients with name
 * @route /api/ingredient/search
 * @access public
 * @method GET
 */
const searchForIngredient = AsyncHandler(async (req, res, next) => {
    let { key, exceptions } = req.query;

    try {
        console.log(JSON.parse(exceptions) || []);
        exceptions = JSON.parse(exceptions) || [];
        let Ingredients = await prisma.ingredients.findMany({
            where: {
                AND: {
                    id: {
                        not: {
                            in: exceptions,
                        },
                    },
                    name: {
                        contains: key,
                    },
                },
            },
        });

        res.status(200).json(Ingredients);
    } catch (err) {
        console.log(err);
        next(
            new ErrorHandler(
                "Something went wrong trying to get you the data",
                500
            )
        );
    }
});

/**
 * @desc Update ingredient by id
 * @route /api/ingredient/{:id}
 * @access private
 * @method PUT
 */
const updateIngredient = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const ingredient = await prisma.ingredients.update({
            where: {
                id,
            },
            data: { name },
        });
        console.log("ingreds:", ingredient);
        res.status(200).json(ingredient);
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "No ingredient found associated with this ID ",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong trying to update your ingredient",
                    400
                )
            );
    }
});

/**
 * @desc Delete ingredient with id
 * @route /api/ingredient/{:id}
 * @access private
 * @method Delete
 */
const deleteIngredient = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        await prisma.ingredients.delete({
            where: { id },
        });

        res.status(200).json({
            message: "Ingredient has been deleted successfully",
        });
    } catch (err) {
        if (err.code === "P2025")
            next(
                new ErrorHandler(
                    "No ingredient found associated with this ID ",
                    400
                )
            );
        else
            next(
                new ErrorHandler(
                    "Something went wrong trying to delete this ingredient",
                    400
                )
            );
    }
});

module.exports = {
    addIngredient,
    listIngredients,
    updateIngredient,
    deleteIngredient,
    searchForIngredient,
};
