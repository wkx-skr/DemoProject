function () {
    var key, keyInfo, count, type;
    // Get our keyInfo struct
    keyInfo = getKeyInfo(this, '', {}, 0, [], true);
    // Loop through keys, emitting info
    for (key in keyInfo) {
        if (keyInfo.hasOwnProperty(key)) {
            count = 0;
            for (type in keyInfo[key]) {
                if (keyInfo[key].hasOwnProperty(type)) {
                    count += keyInfo[key][type].perDoc;
                }
            }
            keyInfo[key].all = {
                docs : 1,
                perDoc : count,
                maxOccur : count
            };
            emit(key, keyInfo[key]);
        }
    }
};