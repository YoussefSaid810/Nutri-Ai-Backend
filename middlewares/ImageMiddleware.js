const multer = require("multer");
const ErrorHandler = require("../util/ErrorHandler");
const AsyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const cloudinary = require("../util/Cloudinary");

const ImagesFiltration = (req, file, cb) => {
    const typeExtension = file.mimetype.split("/")[0];
    if (typeExtension === "image") cb(null, true);
    else cb(new ErrorHandler("Wrong format please send message", 404), null);
};

// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(
            null,
            `User-${Date.now()}-${uuidv4()}.${file.originalname.split(".")[1]}`
        );
    },
});

const MulterControls = multer({
    storage: storage,
});

const uploadImage = MulterControls.single("image");

const UserImagePrecessing = (req, res, next) => {
    try {
        if (req.file)
            cloudinary.v2.uploader.upload(
                req.file.path,
                {
                    public_id: `${process.env.CLOUDINARY_USERS_IMAGE_FOLDER}/User-${Date.now()}-${uuidv4()}`,
                    format: "webp",
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Error uploading file to Cloudinary:",
                            error
                        );
                        next(
                            new ErrorHandler(
                                "Something is going wrong with image uploading please try again later.",
                                500
                            )
                        );
                    }
                    // Set the secure URL to req.body.image
                    req.body.image = result.secure_url;
                    next();
                }
            );
        else {
            req.body.image = null;
            next();
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const MealImagePrecessing = AsyncHandler(async (req, res, next) => {
    try {
        if (req.file)
            cloudinary.v2.uploader.upload(
                req.file.path,
                {
                    public_id: `${process.env.CLOUDINARY_MEALS_IMAGE_FOLDER}/Meal-${Date.now()}-${uuidv4()}`,
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Error uploading file to Cloudinary:",
                            error
                        );
                        next(
                            new ErrorHandler(
                                "Something is going wrong with image uploading please try again later.",
                                500
                            )
                        );
                    }
                    // Set the secure URL to req.body.image
                    req.body.image = result.secure_url;
                    next();
                }
            );
        else {
            req.body.image = null;
            next();
        }
    } catch (err) {
        next(err); // Forward error to Express error handler
    }
});

module.exports = {
    uploadImage,
    MealImagePrecessing,
    UserImagePrecessing,
};
