/**
 * @param {Object 1} object1 to merge in
 * @param {Object2} object2 to merge
 * @description merge to objects while skipping undefined in second obj
 */
const CombineObjects = (object1, object2) => {
    // Filter out undefined values from object2
    const filteredObject2 = Object.fromEntries(
        Object.entries(object2).filter(([key, value]) => {
            return value !== undefined && value !== "undefined";
        })
    );

    // Merge object1 with filteredObject2
    const mergedObject = Object.assign({}, object1, filteredObject2);

    return mergedObject;
};

module.exports = CombineObjects;
