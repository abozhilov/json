#! /usr/bin/env rhino

load('../src/json.js');

print(
   new JSONParser(
      readFile('json-1')
   ).parse()
);
