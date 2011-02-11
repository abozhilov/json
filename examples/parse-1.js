#! /usr/bin/env rhino

load('../src/json.js');

function reviver(name, value) {
    print('name: ' + name + ', value: ' + value);
    return value;    
}

var val = evalJSON(
  readFile('json-1'),
  reviver
);

print('-------------------\nevalJSON: ' + val);
