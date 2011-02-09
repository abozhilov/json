/**
 * @name JSONParser 
 * @version 0.1.3
 * @author Asen Bozhilov
 * @date 2011-02-09
 * 
 * @license MIT
 * 
 * @description 
 * Javascript parser of JSON (JavaScript Object Notation) according ECMAScript 5 JSON grammar
 *
 * @contributors
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
        string = /^"(?:[^"\\\u0000-\u001F\u0080-\u009F\u007F]|\\["\\\/bfnrt]|\\u[0-9A-F]{4})*"/,
        number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
        bool = /^(?:true|false)/,
        nullLiteral = /^null/,
        whiteSpace = /^[\t ]+/,
        lineTerminator = /^\r?\n/;
        
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
                type = 'PUNCTUATOR';
            }
            else if ((token = string.exec(str))) {
                type = 'STRING';
            }
            else if ((token = number.exec(str))) {
                type = 'NUMBER';
            }
            else if ((token = bool.exec(str))) {
                type = 'BOOLEAN';
            }
            else if ((token = nullLiteral.exec(str))) {
                type = 'NULL';
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
                token, tval, type,
                prop, pairs = false;
                
            while (true) {
                token = lex.getNextToken();
                tval = token.value;
                type = token.type;
                
                if (tval == RIGHT_CURLY) {
                    return jsObj;
                }
                
                if (pairs) {
                    if (tval == COMMA) {
                        token = lex.getNextToken();
                        tval = token.value;
                        type = token.type;  
                        if (tval == RIGHT_CURLY) {
                            lex.error('Invalid trailing comma');
                        }           
                    }
                    else {
                        lex.error('Illegal token where expect comma');
                    } 
                }
                
                if (type != 'STRING') {
                    lex.error('Invalid property name');
                }
                
                prop = String(tval).slice(1, -1);
                
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
                token, tval, type,
                prop, values = false;
            while (true) {
                token = lex.getNextToken();
                tval = token.value;
                type = token.type;
                
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
        
        getValue : function(fromToken) {
            var lex = this.lex,
                token = fromToken || lex.getNextToken(),
                tval = token.value;
            switch (token.type) {
                case 'PUNCTUATOR':
                    if (tval == LEFT_CURLY) {
                        return this.getObject();
                    }
                    else if (tval == LEFT_BRACE) {
                        return this.getArray();
                    }    
                    else {
                        lex.error('Illegal punctoator');
                    }
                case 'STRING':
                    return String(tval).slice(1, -1);               
                case 'NUMBER':
                    return Number(tval);
                case 'BOOLEAN':
                    return Boolean(tval);
                case 'NULL':
                    return null;
                default:
                    lex.error('Invalid value');
           }       
        }
    };
    
    return function (JSONStr) {
        return new JSONParser(new JSONLexer(JSONStr)).parse();
    };
})();


