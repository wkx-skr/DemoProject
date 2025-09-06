function (key, values) {

    var result = {count:0,id: new ObjectId()};
    values.forEach(function (value) {
        result["count"] += value["count"];
        result["id"] = value["id"];
    });
    return result;
};