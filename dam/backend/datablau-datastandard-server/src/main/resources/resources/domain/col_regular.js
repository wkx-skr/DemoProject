/**
 * 只用正则进行判断
 * 
 * @param data_list
 * @param data_type
 * @param reg_list
 * @param param_json
 * @returns {Boolean}
 */
function regDataValid(data_list, data_type, reg_list, param_json) {
	var ratio = 0.8;
	var reg_arr = eval(reg_list);// json类型:eval("("+reg+")");
	var data_arr = eval(data_list);

	var tag_count = 0;
	for (var i = 0; i < data_arr.length; i++) {
		for (var j = 0; j < reg_arr.length; j++) {
			var data_pattern = new RegExp(eval(reg_arr[j]));
			var result = data_pattern.exec(data_arr[i]);
			if (result != null && result[0].length == data_arr[i].length) {
				tag_count++;
				break;
			}
		}
	}
	// print(tag_count);
	// print(data_arr.length);
	return tag_count / data_arr.length >= ratio;
}

/**
 * 判断枚举型数值
 * 
 * @param data_list
 * @param data_type
 * @param reg_list
 * @param param_json
 * @returns {Boolean}
 */
function enumDataValid(data_list, data_type, reg_list, param_json) {
	var ratio = 0.8;
	var tag_count = 0;
	var reg_arr = eval(reg_list);
	var data_arr = eval(data_list);
	for (var i = 0; i < data_arr.length; i++) {
		for (var j = 0; j < reg_arr.length; j++) {
			if (data_arr[i].toLowerCase() == reg_arr[j].toLowerCase()) {
				tag_count++;
				break;
			}
		}
	}
	// print(tag_count);
	// print(data_arr.length);
	return tag_count / data_arr.length >= ratio;
}

/**
 * 判断是否是身份证 前两位必须符合“省”的编码，生日要在18600101-当前日期之间，最后四位符合相应正则
 * 
 * @param data_list
 * @param data_type
 * @param reg_list
 * @param param_json
 * @returns {Boolean}
 */
function idCardRegDataValid(data_list, data_type, reg_list, param_json) {
	var ratio = 0.8;
	var tag_count = 0;
	var province_arr = new Array(11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33,
			34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 61, 62,
			63, 64, 65, 71, 81, 82, 91);
	var myDate = new Date();
	var currentDate = myDate.getFullYear().toString()
			+ (myDate.getMonth() + 1).toString() + myDate.getDate().toString();
	var reg_arr = eval(reg_list);
	var data_arr = eval(data_list);
	var post_data_arr = new Array();
	if (data_arr.length > 0) {
		if (data_arr[0].length == 18) {
			for (var i = 0; i < data_arr.length; i++) {
				if ((province_arr
						.indexOf(parseInt(data_arr[i].substring(0, 2))) != -1)
						&& (data_arr[i].substring(6, 14) > "18640101")
						&& (data_arr[i].substring(6, 14) < currentDate)) {
					post_data_arr.push(data_arr[i].substring(14, 18));
				}
			}
			for (var i = 0; i < post_data_arr.length; i++) {
				for (var j = 0; j < reg_arr.length; j++) {
					var data_pattern = new RegExp(eval(reg_arr[j]));
					var is_tag = data_pattern.test(post_data_arr[i]);
					if (is_tag == true) {
						tag_count++;
						break;
					}
				}
			}
			// print(tag_count);
			// print(data_arr.length);
			return tag_count / data_arr.length >= ratio;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * 判断是否是美国SSN号码（相当于中国的身份证号码，构成：3位Area Number + 2位Group Number(01-99) + 4位Serial
 * Number(0001-9999)）
 * 
 * @param data_list
 * @param data_type
 * @param reg_list
 * @param param_json
 * @returns {Boolean}
 */
function SSNDataValid(data_list, data_type, reg_list, param_json) {
	var ratio = 0.8;
	var tag_count = 0;
	var AN_arr = new Array(205, 251, 256, 334, 938, 907, 684, 480, 520, 602,
			623, 928, 479, 501, 870, 209, 213, 310, 323, 408, 415, 424, 442,
			510, 530, 559, 562, 619, 626, 650, 657, 661, 669, 707, 714, 747,
			760, 805, 818, 831, 858, 909, 916, 925, 949, 951, 303, 719, 720,
			970, 203, 475, 860, 302, 239, 305, 321, 352, 386, 407, 561, 727,
			754, 772, 786, 813, 850, 863, 904, 941, 954, 229, 404, 470, 478,
			678, 706, 762, 770, 912, 671, 808, 208, 217, 224, 309, 312, 331,
			618, 630, 708, 773, 779, 815, 847, 872, 219, 260, 317, 574, 765,
			812, 319, 515, 563, 641, 712, 316, 620, 785, 913, 270, 502, 606,
			859, 225, 318, 337, 504, 985, 207, 240, 301, 410, 443, 667, 339,
			351, 413, 508, 617, 774, 781, 857, 978, 231, 248, 269, 313, 517,
			586, 616, 734, 810, 906, 947, 989, 218, 320, 507, 612, 651, 763,
			952, 228, 601, 662, 769, 314, 417, 573, 636, 660, 816, 406, 308,
			402, 531, 702, 725, 775, 603, 201, 551, 609, 732, 848, 856, 862,
			908, 973, 505, 575, 212, 315, 347, 516, 518, 585, 607, 631, 646,
			716, 718, 845, 914, 917, 929, 252, 336, 704, 828, 910, 919, 980,
			984, 701, 670, 216, 234, 330, 419, 440, 513, 567, 614, 740, 937,
			405, 539, 580, 918, 458, 503, 541, 971, 215, 267, 272, 412, 484,
			570, 610, 717, 724, 814, 878, 787, 939, 401, 803, 843, 864, 605,
			423, 615, 731, 865, 901, 931, 210, 214, 254, 281, 325, 346, 361,
			409, 430, 432, 469, 512, 682, 713, 737, 806, 817, 830, 832, 903,
			915, 936, 940, 956, 972, 979, 385, 435, 801, 802, 340, 276, 434,
			540, 571, 703, 757, 804, 206, 253, 360, 425, 509, 202, 304, 681,
			262, 414, 534, 608, 715, 920, 307);
	// var reg_arr = eval(reg_list);
	var data_arr = eval(data_list);
	var post_data_arr = new Array();
	if (data_arr.length > 0) {
		for (var i = 0; i < data_arr.length; i++) {
			if ((AN_arr.indexOf(parseInt(data_arr[i].substring(0, 3))) != -1)) {
				post_data_arr.push(data_arr[i].substring(3, 9));
			}
		}
		for (var i = 0; i < post_data_arr.length; i++) {
			if ((post_data_arr[i].substring(0, 2) > 0)
					&& (post_data_arr[i].substring(2, 6) > 0)) {
				tag_count++;
			}
		}
		return tag_count / data_arr.length >= ratio;

	} else {
		return false;
	}
}

/**
 * 判断枚举型数值
 * 
 * @param data_list
 * @param data_type
 * @param reg_list
 * @param param_json
 * @returns {Boolean}
 */
function bloodTypeDataValid(data_list, data_type, reg_list, param_json) {
	var ratio = 0.8;
	var tag_count = 0;
	var main_type = [ "A", "B", "O", "AB", "Rh阴性", "Rh阳性", "MNSSU", "P",
			"KELL", "KIDD", "LUTHERAN", "DEIGO", "LEWIS", "DUFFY" ];
	var reg_arr = eval(reg_list);
	var data_arr = eval(data_list);
	for (var i = 0; i < data_arr.length; i++) {
		for (var j = 0; j < reg_arr.length; j++) {
			if (data_arr[i].toLowerCase() == reg_arr[j].toLowerCase()) {
				tag_count++;
				var type_index = main_type.indexOf(data_arr[i]);
				if (type_index >= 0) {
					main_type.splice(type_index, 1);
				}
				break;
			}
		}
	}
	return (tag_count / data_arr.length >= ratio) && (main_type.length <= 11);
}
