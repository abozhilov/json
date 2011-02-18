//Test options 
var MIN_NESTED_LEVELS = 50,
    MAX_NESTED_LEVELS = 60,
    PROP_COUNT = 10,
    STRING_LENGTH = 20,
    VALUES = [
        '"' + Array(STRING_LENGTH).join('X') + '"',    
        '12345',
        '-12345',
        '12345.12345',
        '12345.12345e10',
        'true', 
        'false',
        'null'
    ],
    LEN = VALUES.length;

function genObject(nestedLev, propCount) {
    var str = '{';
    for (var i = 0; i < propCount; i++) {
        if (i) {
            str += ',';
        }
        str += VALUES[0].slice(-1) + Math.random() + '"' + ':' + VALUES[Math.floor(Math.random() * LEN)];
    }
    
    if (nestedLev) {
        if (propCount > 0) {
            str += ',';
        } 
        str += VALUES[0].slice(-1) + Math.random() + '"' + ':' + genObject(nestedLev - 1, propCount);
    }
    
    return str + '}';
}

function genArray(nestedLev, valCount) {
    var str = '[';
    for (var i = 0; i < valCount; i++) {
        if (i) {
            str += ',';
        }
        str += VALUES[Math.floor(Math.random() * LEN)];
    }
    
    if (nestedLev) {
        if (valCount > 0) {
            str += ',';
        }
        str += genArray(nestedLev - 1, valCount); 
    }
    
    return str + ']';    
}


/******* Setup test *********/
load('json_parse.js');
load('json_parse_state.js');
load('json.js');

var time1, time2,
    obj, arr, 
    val1, val2,
    toStr = Object.prototype.toString;

var funcMap = [
    'Bozhilov\'s evalJSON', evalJSON,
    'Crockford\'s json_parse', json_parse,
    'Crockford\'s json_parse_state', json_parse_state,
],
len = funcMap.length,
currFunc;

for (var i = MIN_NESTED_LEVELS; i <= MAX_NESTED_LEVELS; i++) {
    print('============================');
    print('Nested level: ' + i);

    obj = genObject(i, PROP_COUNT);
    arr = genArray(i, PROP_COUNT);
    
    for (var j = 1; j < len; j += 2) {
        
        currFunc = funcMap[j];
        print('----------------------------');
        print(funcMap[j - 1]);
        
        time1 = new Date();
        val1 = currFunc(obj);
        time1 = new Date() - time1;
        
        time2 = new Date();
        val2 = currFunc(arr);
        time2 = new Date() - time2;
        
        print('obj time: ' + time1 + 'ms'); 
        print('value:    ' + toStr.call(val1).slice(8, -1));
        print('arr time: ' + time2 + 'ms'); 
        print('value:    ' + toStr.call(val2).slice(8, -1));   
    } 
}
