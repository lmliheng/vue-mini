// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
}
console.log(isReadonly(1))