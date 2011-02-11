/**
 * @name JSONParser 
 * @version 0.9.0
 * @author Asen Bozhilov
 * @date 2011-02-09
 * 
 * @license MIT
 * 
 * @description 
 * Javascript parser of JSON (JavaScript Object Notation) according ECMAScript 5 JSON grammar
 *
 * @contributors
 * Alexander a.k.a @bga_
 *
 * @usage
 * var jsValue = evalJSON(JSONStr);
 */


var evalJSON = (function () {

    var LEFT_CURLY  = '{',
        RIGHT_CURLY = '}',
        COLON       = ':',
        LEFT_BRACE  = '[',
        RIGHT_BRACE = ']',
        COMMA       = ',';       

    var punctuator = /^[{}:,\[\]]/,
        string = /^"(?:[^"\\\u0000-\u001F]|\\["\\\/bfnrt]|\\u[0-9A-F]{4})*"/,
        number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
        bool = /^(?:true|false)/,
        nullLiteral = /^null/,
        whiteSpace = /^[\t ]+/,
        lineTerminator = /^\r?\n/;
        
    var tokenType = {
        PUNCTUATOR : 1,
        STRING     : 2,
        NUMBER     : 3,
        BOOLEAN    : 4,
        NULL       : 5
    };
    
    var escChars = {
        'b'  : '\b',
        'f'  : '\f',
        'n'  : '\n',
        'r'  : '\r',
        't'  : '\t',
        '"'  : '"',
        '\\' : '\\',
        '/'  : '/'
    };
        
    function JSONLexer(JSONStr) {
        this.line = 1;
        this.col = 1;
        this._tokLen = 0;
        this._str = JSONStr; 
    }

    JSONLexer.prototype = {
        getNextToken : function () {
            var str = this._str,
                token, type;
            
            this.col += this._tokLen;
            
            if (!str.length) {
                return 'END';
            }
            
            if ((token = whiteSpace.exec(str))) {
                this._tokLen = token[0].length;
                this._str = str.slice(this._tokLen);
                return this.getNextToken();
            }
            else if ((token = lineTerminator.exec(str))) {
                this._tokLen = 0;
                this._str = str.slice(token[0].length);
                this.line++;
                this.col = 1;
                return this.getNextToken();
            }
            else if ((token = punctuator.exec(str))) {
                type = tokenType.PUNCTUATOR;
            }
            else if ((token = string.exec(str))) {
                type = tokenType.STRING;
            }
            else if ((token = number.exec(str))) {
                type = tokenType.NUMBER;
            }
            else if ((token = bool.exec(str))) {
                type = tokenType.BOOLEAN;
            }
            else if ((token = nullLiteral.exec(str))) {
                type = tokenType.NULL;
            }
            else {
                this.error('Invalid token');
            }
            
            this._tokLen = token[0].length;
            this._str = str.slice(this._tokLen);
            
            return {
                type : type, 
                value : token[0]
            };
        },
        
        error : function (message) {
            var err = new SyntaxError(message);
            err.line = this.line;
            err.col  = this.col;
            
            throw err;
        }   
    }

    function JSONParser(lexer) {
        this.lex = lexer;
    }

    JSONParser.prototype = {
        parse : function () {
            var lex = this.lex,
                jsValue = this.getValue();
                
            if (lex.getNextToken() !== 'END') {
                lex.error('Illegal token');
            }
            
            return jsValue;       
        },
        
        getObject : function () {
            var jsObj = {},
                lex = this.lex,
                token, tval, prop, 
                pairs = false;
                
            while (true) {
                token = lex.getNextToken();
                tval = token.value;
                
                if (tval == RIGHT_CURLY) {
                    return jsObj;
                }
                
                if (pairs) {
                    if (tval == COMMA) {
                        token = lex.getNextToken();
                        tval = token.value;
                        if (tval == RIGHT_CURLY) {
                            lex.error('Invalid trailing comma');
                        }           
                    }
                    else {
                        lex.error('Illegal token where expect comma');
                    } 
                }
                
                if (token.type != tokenType.STRING) {
                    lex.error('Invalid property name');
                }
                
                prop = this.getString(tval);
                
                token = lex.getNextToken();
                tval = token.value;
                
                if (tval != COLON) {
                    lex.error('Invalid token where expect colon');
                }
                
                jsObj[prop] = this.getValue();
                pairs = true;           
            }
        },
        
        getArray : function () {
            var jsArr = [],
                lex = this.lex,
                token, tval, prop, 
                values = false;
            while (true) {
                token = lex.getNextToken();
                tval = token.value;
                
                if (tval == RIGHT_BRACE) {
                    return jsArr;
                }
                
                if (values) {
                    if (tval == COMMA) {
                        token = lex.getNextToken();
                        tval = token.value;  
                        if (tval == RIGHT_BRACE) {
                            lex.error('Invalid trailing comma');
                        }           
                    }
                    else {
                        lex.error('Illegal token where expect comma');
                    } 
                }
                
                jsArr.push(this.getValue(token));
                values = true;
            }        
        },
        
        getString : function (strVal) {
            return strVal.slice(1, -1).replace(/\\u?([0-9A-F]{4}|["\\\/bfnrt])/g, function (match, escVal) {
                return escChars[escVal] || String.fromCharCode(parseInt(escVal, 16));
            }); 
        },
        
        getValue : function(fromToken) {
            var lex = this.lex,
                token = fromToken || lex.getNextToken(),
                tval = token.value;
            switch (token.type) {
                case tokenType.PUNCTUATOR:
                    if (tval == LEFT_CURLY) {
                        return this.getObject();
                    }
                    else if (tval == LEFT_BRACE) {
                        return this.getArray();
                    }    
                    else {
                        lex.error('Illegal punctoator');
                    }
                case tokenType.STRING:
                    return this.getString(tval);               
                case tokenType.NUMBER:
                    return Number(tval);
                case tokenType.BOOLEAN:
                    return tval === "true";
                case tokenType.NULL:
                    return null;
                default:
                    lex.error('Invalid value');
           }       
        }
    };   
    
    var getClass = Object.prototype.toString,
        hasOwnProp = Object.prototype.hasOwnProperty;
    
    function filter(base, prop, value) {
        if (typeof value == 'undefined') {
            delete base[prop];
            return;
        }
        base[prop] = value;
    }
    
    function walk(holder, name, rev) {
        var val = holder[name], 
            i, len;
        
        if (typeof val == 'object' && val) {
            if (getClass.call(val) == '[object Array]') {
                for (i = 0, len = val.length; i < len; i++) {
                    filter(val, i, walk(val, i, rev));
                }
            }
            else {
                for (i in val) {
                    if (hasOwnProp.call(val, i)) {
                        filter(val, i, walk(val, i, rev));
                    }
                }
            }
        }
        
        return rev.call(holder, name, val); 
    }
        
    return function (JSONStr, reviver) {
        var jsVal = new JSONParser(new JSONLexer(JSONStr)).parse();
        if (typeof reviver == 'function') {
            return walk({'' : jsVal}, '', reviver);
        }
        return jsVal;
    };
})();

