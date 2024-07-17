const router = require("express").Router();
const { ProtectAuth } = require("../../middlewares/AuthMiddleware");
const {
    Rank_My_Meals,
    Generate_Plan,
    Get_Current_Rank,
    Get_Current_Daily_Plans,
} = require("../../service/AiService");

router.route("/ranked_meals").get(ProtectAuth, Get_Current_Rank);
router.route("/daily_plans").get(ProtectAuth, Get_Current_Daily_Plans);
router.route("/rank_meals").put(ProtectAuth, Rank_My_Meals);
router.route("/generate_one_plan").get(ProtectAuth, Generate_Plan);

module.exports = router;
