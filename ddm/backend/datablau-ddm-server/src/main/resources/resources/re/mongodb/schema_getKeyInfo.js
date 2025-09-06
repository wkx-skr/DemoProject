function (node, keyString, keyInfo, depth) {
			var key, newKeyString, type, useArrayWildcard = false;

            if (depth > schemaInferDepth) {
                return keyInfo;
            }
			
			// Store the mongo type. 'bson' instead of 'object', etc
			type = getType(node);

			// We need to handle objects and arrays by calling getKeyInfo() recursively
            if (!(type === 'array' && omitArray)) {
                if (['array', 'bson', 'object'].indexOf(type) >= 0) {

                    // Set the flag to be used in our for loop below
                    if (type === 'array' && arraysAreWildcards === true) {
                        useArrayWildcard = true;
                    }

                    // Loop through each key
                    var keyIndex = 0;
                    for (key in node) {
                        if (node.hasOwnProperty(key)) {
                            if (useArrayWildcard) {
                                newKeyString = keyString + '.$';
                            } else {
                                newKeyString = getNewKeyString(key, keyString);
                            }
                            keyInfo = getKeyInfo(node[key], newKeyString, keyInfo, depth + 1);
                        }

                        // limit of the key count.
                        if(scanFieldLimit) {
                            if (scanFieldLimit > 0 && ++keyIndex >= scanFieldLimit) {
                                return keyInfo;
                            }
                        }
                    }

                }
            }
			// We don't need to emit this key
			// Using a long statement to pass jslint
			// there are 3 parts to this:
			// 1: empty key
			// 2: usePostiveFields is true, and the current key is not valid
			// 3: useNegativeFields is true, and the current key exists in fields (and is -1)
			if (keyString === '' || (usePositiveFields && (!fields.hasOwnProperty(keyString) || fields[keyString] !== 1)) || (useNegativeFields && fields.hasOwnProperty(keyString) && fields[keyString] === -1)) {
				return keyInfo;
			}

			// We need to emit this key
            if (!keyInfo.hasOwnProperty(keyString)) {
                keyInfo[keyString] = {};
            }
            if (!keyInfo[keyString].hasOwnProperty(type)) {
                keyInfo[keyString][type] = {
					docs : 1,
					coverage : 0,
					perDoc : 0,
					maxOccur : 0
				};
            }
            
            keyInfo[keyString][type].perDoc += 1;
            keyInfo[keyString][type].maxOccur += 1;

			return keyInfo;
		};