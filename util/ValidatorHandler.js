const { validationResult } = require("express-validator");

const ValidateHandler = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json(errors);
    else next();
};

module.exports = ValidateHandler;
