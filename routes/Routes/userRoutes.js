const {
    signup,
    login,
    verifyUser,
    activateUser,
    emailResend,
    listUsers,
    viewOneUser,
    updateAccountData,
    updateUserInfo,
    updateUserPassword,
    blockUser,
    deleteUser,
    addToPreferences,
    listAdmins,
    getPreferences,
} = require("../../service/userService");

const {
    ProtectAdminAuth,
    ProtectAuth,
} = require("../../middlewares/AuthMiddleware");

const {
    userLoginValidation,
    userSignupValidation,
    userUpdateNameValidation,
    userUpdateInformationValidation,
    activateUserValidation,
    userUpdatePasswordValidation,
    userIDValidation,
} = require("../../service/validation/userValidation");
const {
    uploadImage,
    UserImagePrecessing,
} = require("../../middlewares/ImageMiddleware");

const router = require("express").Router();
/**
 * @desc All User Authentication routes
 * @route Auth/{route}
 */

router.route("/signup").post(userSignupValidation, signup);

router.route("/login").post(userLoginValidation, login);

router.route("/admin").get(ProtectAdminAuth, listAdmins);

router
    .route("/user")
    .get(ProtectAdminAuth, listUsers)
    .put(ProtectAuth, uploadImage, UserImagePrecessing, updateAccountData);

router.route("/user/resend/:id").put(userIDValidation, emailResend);

// Update user's attributes
router
    .route("/user/preference")
    .get(ProtectAuth, getPreferences)
    .put(ProtectAuth, addToPreferences);

router
    .route("/user/info")
    .put(ProtectAuth, userUpdateInformationValidation, updateUserInfo);

router
    .route("/user/password")
    .put(ProtectAuth, userUpdatePasswordValidation, updateUserPassword);

router
    .route("/user/block/:id")
    .put(ProtectAdminAuth, userIDValidation, blockUser);

router
    .route("/user/activate/:id")
    .put(ProtectAdminAuth, userIDValidation, activateUser);

router
    .route("/user/verify/:id")
    .put(userIDValidation, activateUserValidation, verifyUser);

router
    .route("/user/:id")
    .get(userIDValidation, viewOneUser)
    .delete(ProtectAdminAuth, userIDValidation, deleteUser);

module.exports = router;
