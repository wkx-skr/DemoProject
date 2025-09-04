function (key, value) {
	var type, result = {
		wildcard : (key.search(/^\$|\.\$/gi) >= 0),
		types : [],
		results : [{
			type : 'all',
			docs : value.all.docs,
			coverage : ((value.all.docs / statCount) * 100).toFixed(1),
			perDoc : value.all.perDoc / value.all.docs,
			maxOccur : value.all.maxOccur
		}]
	};
	for (type in value) {
		if (value.hasOwnProperty(type) && type !== 'all') {
			result.types.push(type);
			result.results.push({
				type : type,
				docs : value[type].docs,
				coverage : ((value[type].docs / statCount) * 100).toFixed(1),
				perDoc : value[type].perDoc / value[type].docs,
				maxOccur : value[type].maxOccur
			});
		}
	}
	return result;
};
