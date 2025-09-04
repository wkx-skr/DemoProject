function (key, values) {
	var result = {};
	values.forEach(function (value) {
		var type;
		
		for (type in value) {
			if (value.hasOwnProperty(type)) {
				if (!result.hasOwnProperty(type)) {
					result[type] = { docs : 0, coverage : 0, perDoc : 0, maxOccur : 0 };
				}
				if (result[type].maxOccur < value[type].perDoc)
				{
					result[type].maxOccur = value[type].perDoc;
				}
				result[type].docs += value[type].docs;
				result[type].perDoc += value[type].perDoc;
			}
		}
	});
	return result;
};