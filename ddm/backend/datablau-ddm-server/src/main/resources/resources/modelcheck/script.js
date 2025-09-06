function contains(arr, obj) {
  var i = arr.length;
  while(i--) {
    if (arr[i] == obj)
      return true;
  }
  return false;
}

function startWith(v, keyword) {
  if(v == null){
    return false;
  }
  return v.indexOf(keyword) === 0;
}

function startNotWith(v, keyword) {
  if(v == null){
    return false;
  }
  return !(v.indexOf(keyword) === 0);
}

function endWith(v, keyword) {
  if(v == null){
    return false;
  }

  var idx = v.lastIndexOf(keyword);
  if (idx < 0) {
    return false;
  }

  return v.length - keyword.length == idx;
}

function endNotWith(v, keyword) {
  if(v == null){
    return false;
  }

  var idx = v.lastIndexOf(keyword);
  if (idx < 0) {
    return true;
  }

  return !(v.length - keyword.length == idx);
}

function containKeyword(v, keyword) {
  if(v == null){
    return false;
  }
  var arr = keyword.split(",");
  return contains(arr, v);
}

function includeKeyWord(v, keyword) {
  if(v == null){
    return false;
  }
  var idx = v.indexOf(keyword);
  if(idx<0){
    return false;
  }
  return true;
}

function unIncludeKeyWord(v, keyword) {
  if(v == null){
    return true;
  }
  var idx = v.indexOf(keyword);
  if(idx<0){
    return true;
  }
  return false;
}

function dataTypeScaleEql(v, keyword) {
  if(v == null){
    return false;
  }
  var s = v.substring(v.indexOf("(")+1, v.indexOf(")"));
  if(s == keyword){
    return true;
  }
  return false;
}

function indexLen(v, keyword, sflag) {
  // if(v == null){
  //   if(keyword == 0){
  //     return true;
  //   }
  //   return false;
  // }
  var len = 0;
  if(v != null && v != ""){
    len = v.split(",").length;
  }

  if(sflag == "eq"){
    if(len==keyword){
      return true;
    }
  }else if(sflag == "neq"){
    if(len != keyword){
      return true;
    }
  }else if(sflag == "than"){
    if(len > keyword){
      return true;
    }
  }else if(sflag == "less"){
    if(len < keyword){
      return true;
    }
  }else if(sflag == "max"){
    if(len<=keyword){
      return true;
    }
  }else if(sflag == "min"){
    if(len>=keyword){
      return true;
    }
  }
  return false;
  // var sp = v.split(",");
  // if(sflag == "eq"){
  //   if(sp.length==keyword){
  //     return true;
  //   }
  // }else if(sflag == "max"){
  //   if(sp.length<=keyword){
  //     return true;
  //   }
  // }else {
  //   if(sp.length>=keyword){
  //     return true;
  //   }
  // }
  // return false;
}

function dataTypeEql(v, keyword, isEql) {
  if (v == null) {
    return false;
  }

  var index = v.indexOf("(");
  if (index !== -1) {
    s = v.substring(0, index);
  } else {
    s = v;
  }
  var s1 = keyword;
  if (isEql) {
    if (s === s1) {
      return true;
    }
    return false;
  } else {
    if (s !== s1) {
      return true;
    }
    return false;
  }
}

function len(v) {
  if (v === null)
    return 0;

  return v.length;
}

function toLowerCase(str) {
  // ASCII 编码大写小写相差32
  if(str == null){
    return "";
  }
  var arr = str.split('');
  var asciiCode;
  var maxCode = 'Z'.charCodeAt();
  var minCode = 'A'.charCodeAt();
  for (var i = 0; i < arr.length; i++) {
    asciiCode = arr[i].charCodeAt();// 转换为ASCII码
    if (maxCode >= asciiCode && minCode <= asciiCode) {
      arr[i] = String.fromCharCode(asciiCode+32);
    }
  }
  return arr.join('');
}

function isIncludes(v, str, sflag) {
  if(sflag == "YES"){
    if(isEmpty(str)){
      return false;
    }else {
      return str.replace('/ /g', '').split(',').indexOf(v) > -1;
    }
  }else {
    if(isEmpty(str)){
      return true;
    }else {
      return !(str.replace('/ /g', '').split(',').indexOf(v) > -1);
    }
  }
}

function isEmpty(strIn) {
  if (strIn === undefined) {
    return true;
  } else if (strIn == null) {
    return true;
  } else if (strIn == "") {
    return true;
  } else {
    return false;
  }
}

function nonEmpty(strIn) {
  if (strIn === undefined) {
    return false;
  } else if (strIn == null) {
    return false;
  } else if (strIn == "") {
    return false;
  } else {
    return true;
  }
}