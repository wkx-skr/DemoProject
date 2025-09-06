function (key, value) {
    var rate = 1.0* value["count"] / statCount* 100;
    value["ratio"] = rate.toFixed(1);
    return value;
};
