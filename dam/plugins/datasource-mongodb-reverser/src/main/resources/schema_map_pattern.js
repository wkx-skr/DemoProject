function () {
    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length == 0) return hash;
        for (i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    getJson = function(vobject){
        var output = '';
        for (var property in vobject) {
          output += property + ': ' + getJson(vobject[property])+'; ';
        }
        return output;
    }
    getDataType = function(vobject){
        for (var property in vobject) {
          return property;
        }
        return '';
    }
    
    var key, keyInfo, count, type;
    // Get our keyInfo struct
    keyInfo = getKeyInfo(this, '', {}, 0, [], true);
    print("this sssss");
    // Loop through keys, emitting info
    var keySummary = "";
    for (key in keyInfo) {
        var isArrayElement = key.indexOf("$")>=0;
        if(isArrayElement == false)
            keySummary += key;
        
        if (hashDatatype) 
            keySummary += getDataType(keyInfo[key]);
    }
    //print( this["_id"].str);
    //emit(keySummary, {count:1,id: this["_id"]});
    emit(keySummary.hashCode(), {count:1,id: this["_id"]});

};