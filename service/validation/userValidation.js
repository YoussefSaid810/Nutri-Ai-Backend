const { check, body } = require("express-validator");
const ValidateHandler = require("../../util/ValidatorHandler");

const pass_RGX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;

const userLoginValidation = [
    check("email")
        .notEmpty()
        .withMessage("This field is required")
        .isEmail()
        .withMessage("Please enter a valid email (ex. example@nutriai.com)"),
    // check("password").notEmpty().withMessage("This field is required"),
    ValidateHandler,
];

const userSignupValidation = [
    check("email")
        .notEmpty()
        .withMessage("This field is required")
        .isEmail()
        .withMessage("Please enter a valid email (ex. example@nutriai.com)"),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 32 })
        .withMessage("Password length must be in range of [8 - 32] character")
        .matches(pass_RGX)
        .withMessage("Wrong password formate"),
    check("name")
        .notEmpty()
        .withMessage("name is required")
        .isLength({ min: 8, max: 32 })
        .withMessage("name length must be in range of [8 - 32] character"),
    ValidateHandler,
];

const userUpdateNameValidation = [
    check("name")
        .notEmpty()
        .withMessage("name is required")
        .isLength({ min: 8, max: 32 })
        .withMessage("name length must be in range of [8 - 32] character"),
    ValidateHandler,
];

const userUpdateInformationValidation = [
    body("gender")
        .optional()
        .matches(/^(MALE|FEMALE)$/i)
        .withMessage("Invalid gender type must be one of [male, female]"),
    body("height")
        .optional()
        .isNumeric()
        .withMessage("This field must be provided as a number")
        .isFloat({ min: 100, max: 250 })
        .withMessage("Height must be in range [100 - 250] centimeter"),
    body("weight")
        .optional()
        .isNumeric()
        .withMessage("This field must be provided as a number")
        .isFloat({ min: 30, max: 250 })
        .withMessage("Weight must be in range [30 - 250] kilogram"),
    body("age")
        .optional()
        .isNumeric()
        .withMessage("This field must be provided as a number")
        .isFloat({ min: 8, max: 100 })
        .withMessage("Age must be in range [8 - 100] years"),
    body("activity")
        .optional()
        .matches(/^(SEDENTARY|LIGHT|MODERATE|HEAVY|ATHLETE)$/i)
        .withMessage(
            "Invalid activity type must be one of [sedentary, light, moderate, heavy, athlete]"
        ),
    ValidateHandler,
];

const activateUserValidation = [
    check("code")
        .notEmpty()
        .withMessage("Verification code is required")
        .isLength({ min: 8, max: 8 })
        .withMessage(
            "Please enter the 8 character code that has been sent to you"
        ),
    ValidateHandler,
];

const userUpdatePasswordValidation = [
    check("old_password")
        .notEmpty()
        .withMessage("Old password is required")
        .isLength({ min: 8, max: 32 })
        .withMessage("Password length must be in range of [8 - 32] character"),
    check("new_Password")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8, max: 32 })
        .withMessage("Password length must be in range of [8 - 32] character")
        .matches(pass_RGX)
        .withMessage("Wrong password formate"),
    check("confirm_password")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((_, { req }) => {
            const { new_Password, confirm_password } = req.body;

            if (new_Password !== confirm_password) {
                throw new Error(
                    "New Password and Password confirmation must be the same"
                );
            }

            return true;
        })
        .withMessage("New Password and Password confirmation must be the same"),
    ValidateHandler,
];

const userIDValidation = [
    check("id")
        .notEmpty()
        .withMessage("ID is required in this kind of requests"),
    ValidateHandler,
];

module.exports = {
    userLoginValidation,
    userSignupValidation,
    userUpdateNameValidation,
    userUpdateInformationValidation,
    activateUserValidation,
    userUpdatePasswordValidation,
    userIDValidation,
};
