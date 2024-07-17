const router = require("express").Router();
const {
    addMealValidation,
    getMealsValidation,
    updateMealValidation,
    deleteMealValidation,
    rateMealValidation,
    MealArrayHandler,
    getListOfMealsValidation,
} = require("../../service/validation/mealValidation");
const {
    rateMeal,
    addMeal,
    listMeals,
    viewOneMeal,
    updateMeal,
    deleteMeal,
    listOfMeals,
    listMealsAdmin,
} = require("../../service/mealService");
const {
    ProtectAdminAuth,
    ProtectAuth,
} = require("../../middlewares/AuthMiddleware");
const {
    uploadImage,
    MealImagePrecessing,
} = require("../../middlewares/ImageMiddleware");

router.route("/rate/:id").post(ProtectAuth, rateMealValidation, rateMeal);

router
    .route("/")
    .get(listMeals)
    .post(
        ProtectAdminAuth,
        uploadImage,
        MealArrayHandler,
        addMealValidation,
        MealImagePrecessing,
        addMeal
    );

router.route("/admin").get(ProtectAdminAuth, listMealsAdmin);

router.route("/list").get(getListOfMealsValidation, listOfMeals);

router
    .route("/:id")
    .get(getMealsValidation, viewOneMeal)
    .patch(ProtectAdminAuth, updateMealValidation, updateMeal)
    .delete(ProtectAdminAuth, deleteMealValidation, deleteMeal);

module.exports = router;
