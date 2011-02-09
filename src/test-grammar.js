#! /usr/bin/env rhino

load('json.js');

var JSONTest = (function () {
    var ASSERT_ERROR = [
        /**
         * Empty string is not a valid JSONValue 
         */
        "",
        
        /**
         * Evaluating ECMAScript expression is not allowed in JSONText
         */
         "eval('6 * 6') == 36",
         
        /**
         * ECMAScript list is not allowed as JSONValue
         */ 
         '"str", "str"',         
                
        /**
         * ECMA-262-5
         * JSONString :
         * JSONStringCharacter :: See 15.12.1.1
         * JSONSourceCharacter but not double-quote " or backslash \ or U+0000 thru U+001F
         */
        '"""', '"\\"',
        '"\x00"', '"\x01"', '"\x02"', '"\x03"', '"\x04"', '"\x05"', '"\x06"', '"\x07"',
        '"\x08"', '"\x09"', '"\x0a"', '"\x0b"', '"\x0c"', '"\x0d"', '"\x0e"', '"\x0f"',
        '"\x10"', '"\x11"', '"\x12"', '"\x13"', '"\x14"', '"\x15"', '"\x16"', '"\x17"',
        '"\x18"', '"\x19"', '"\x1a"', '"\x1b"', '"\x1c"', '"\x1d"', '"\x1e"', '"\x1f"',
        
        /**
         * ECMA-262-5
         * JSONEscapeSequence :: See 15.12.1.1
         * Cannot contain HexEscapeSequence 
         */
         '"\\xF1"',
         
        /**
         * ECMA-262-5
         * JSONEscapeSequence :: See 15.12.1.1
         * Cannot contain OctalEscapeSequence
         */
         '"\\101"',             
                    
        /**
         * ECMA-262-5
         * JSONNumber :: See 15.12.1.1
         * - opt DecimalIntegerLiteral JSONFraction opt ExponentPart opt
         */
        '+2', '2.', '.2',
        
        /**
         * ECMA-262-5
         * JSONNumber :: See 15.12.1.1  
         * Cannot contain OctalIntegerLiteral 
         */ 
         '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
         
        /**
         * ECMA-262-5
         * JSONNumber :: See 15.12.1.1  
         * Cannot contain HexIntegerLiteral 
         */  
         '0xFF',        
    
        /**
         * ECMA-262-5
         * JSONMember : See 15.12.1.2
         * JSONString : JSONValue
         */
        '{property : false}',
        "{'property' : false}",
        
        /**
         * JSONNumber is not allowed as property name
         */
         '{2 : false}',
         
        /**
         * true, false and null are not allowed as property name 
         */
         '{true : false}',
         '{false : false}',
         '{null  : false}', 
        
        /**
         * ECMA-262-5
         * JSONMemberList : See 15.12.1.2
         * Trailing coma is not allowed in JSONMemberList:
         */
         '{"property": "value",}',
         
        /**
         * ECMA-262-5
         * JSONElementList : See 15.12.1.2
         * Trailing coma is not allowed in JSONElementList :
         */  
         '["value", "value",]',
         
         /**
          * ECMA-262-5
          * JSONWhiteSpace :: See 15.12.1.1
          *   <TAB> 
          *   <CR> 
          *   <LF> 
          *   <SP> 
          */
          
          /**
           * Vertical Tab <VT> is not allowed in JSONWhiteSpace
           */
           '[\u000B]',
           
          /**
           * Form Feed <FF> is not allowed in JSONWhiteSpace
           */
           '[\u000C]',
            
          /**
           * No-break space <NBSP> is not allowed in JSONWhiteSpace
           */
           '[\u00A0]',
             
          /**
           * Byte Order Mark <BOM> is not allowed in JSONWhiteSpace
           */  
           '[\uFEFF]',
           
          /**
           * Other category “Zs”
           * Any other Unicode “space separator” <USP> are not allowed in JSONWhiteSpace
           */
           '[\u1680]', '[\u180E]', '[\u2000]', '[\u2001]', '[\u2002]', '[\u2003]', '[\u2004]', '[\u2005]', '[\u2006]', '[\u2007]', '[\u2008]', '[\u2009]', '[\u200A]', '[\u202F]', '[\u205F]', '[\u3000]'
    ];

    for (var i = 0, len = ASSERT_ERROR.length; i < len; i++) {
        try {
            evalJSON(ASSERT_ERROR[i]);
            print("Allowed syntax");
        }catch (e) {
            if (e instanceof SyntaxError) {
                print("Passed");
            }
            else {
                print("Undefined behavior");
            }
        }
    }
})();

