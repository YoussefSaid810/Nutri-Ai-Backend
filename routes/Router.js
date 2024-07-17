const Router = require("express").Router();

const ingredientRouter = require("./Routes/ingredientRoute");
const mealRouter = require("./Routes/mealRoute");
const userRouter = require("./Routes/userRoutes");
const aiRouter = require("./Routes/aiRoutes");

Router.use("/ingredient", ingredientRouter);
Router.use("/auth", userRouter);
Router.use("/meal", mealRouter);
Router.use("/ai", aiRouter);

module.exports = Router;
