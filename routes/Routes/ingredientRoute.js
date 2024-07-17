const router = require("express").Router();
const {
    addIngredient,
    listIngredients,
    updateIngredient,
    deleteIngredient,
    searchForIngredient,
} = require("../../service/ingredientService");

const {
    addIngredientValidation,
    updateIngredientValidation,
    deleteIngredientValidation,
} = require("../../service/validation/ingredientValidation");

const { ProtectAdminAuth } = require("../../middlewares/AuthMiddleware");

router
    .route("/")
    .get(listIngredients)
    .post(ProtectAdminAuth, addIngredientValidation, addIngredient);

router.route("/search").get(searchForIngredient);

router
    .route("/:id")
    .put(ProtectAdminAuth, updateIngredientValidation, updateIngredient)
    .delete(ProtectAdminAuth, deleteIngredientValidation, deleteIngredient);

module.exports = router;
