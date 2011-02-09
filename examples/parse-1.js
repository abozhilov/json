#! /usr/bin/env rhino

load('../src/json.js');

print(
   evalJSON(
      readFile('json-1')
   )
);
