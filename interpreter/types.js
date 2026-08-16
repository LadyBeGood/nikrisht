// @ts-check


/**
 * @typedef { "LeftRoundBracket"
 *          | "RightRoundBracket"
 *          | "LeftSquareBracket"
 *          | "RightSquareBracket"
 *          | "LeftCurlyBracket"
 *          | "RightCurlyBracket"
 *          | "Dot"
 *          | "DotDot"
 *          | "DotDotDot"
 *          | "Comma"
 *          | "Colon"
 *          | "Semicolon"
 *          | "Tilde"
 *          | "Equal"
 *          | "EqualEqual"
 *          | "LessThan"
 *          | "MoreThan"
 *          | "And"
 *          | "Plus"
 *          | "Minus"
 *          | "Asterisk"
 *          | "Slash"
 *          | "Bar"
 *          | "ExclamationMark"
 *          | "ExclamationMarkEqual"
 *          | "LessThanEqual"
 *          | "MoreThanEqual"
 *          | "StringLiteral"
 *          | "NumericLiteral"
 *          | "Identifier"
 *          | "Var"
 *          | "Const"
 *          | "Func"
 *          | "False"
 *          | "True"
 *          | "Null"
 *          | "If"
 *          | "Else"
 *          | "Loop"
 *          | "With"
 *          | "Return"
 *          | "Exit"
 *          | "Skip"
 *          | "NewLine"
 *          | "EndOfFile" } TokenType
 */


/**
 * @typedef {number | string | boolean | null} Literal
 */

/**
 * A token produced by the lexer.
 * 
 * @typedef {Object} Token
 * @property {TokenType} type The type of the token.
 * @property {Literal} [literal] The processed value.
 * @property {number} start Start character index in the source (inclusive).
 * @property {number} end End character index in the source (exclusive).
 * @property {string} lexeme
 */


/**
 * @typedef {Object} Environment
 * @property {Environment | undefined} enclosing
 * @property {Map<string, {value: _Type, reassignable: boolean}>} values
 */





/**
 * Lexer state
 * 
 * @typedef {Object} Lexer
 * @property {string} source Source code being tokenized
 * @property {Token[]} tokens Tokens produced by the lexer
 * @property {number} start Start index of the current lexeme
 * @property {number} current Current character index in the source
 * @property {number} line Line number, 1 based
 */

/**
 * @typedef {Object} Parser
 * @property {Token[]} tokens
 * @property {number} current
 * @property {*} diagnostics
 */

/**
 * @typedef {Object} Resolver
 * @property {Statement[]} statements
 * @property {*} interpreter
 * @property {Map<string, boolean>[]} scopes
 * @property {number} functionDepth
 * @property {number} loopDepth
 * @property {*} diagnostics
 */

/**
 * @typedef {Object} Evaluator
 * @property {Environment} globals
 * @property {Environment} environment
 * @property {Map<Expression, number>} locals
 * @property {*} diagnostics
 */


/*=============================*/
/* Expressions                 */
/*=============================*/

/**
 * @typedef {object} LiteralExpression
 * @property {"LiteralExpression"} type
 * @property {Literal} value
 */

/**
 * @typedef {Object} UnaryExpression
 * @property {"UnaryExpression"} type
 * @property {Token} operator
 * @property {Expression} expression
 */

/**
 * @typedef {Object} GroupingExpression
 * @property {"GroupingExpression"} type
 * @property {Expression} expression
 */

/**
 * @typedef {Object} BinaryExpression
 * @property {"BinaryExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 */

/**
 * @typedef {Object} LogicalExpression
 * @property {"LogicalExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 */

/**
 * @typedef {Object} CallExpression
 * @property {"CallExpression"} type
 * @property {Expression} callee
 * @property {Expression[]} arguments
 * @property {Token} closingRoundBracket
 */

/**
 * @typedef {Object} VariableExpression
 * @property {"VariableExpression"} type
 * @property {Token} name
 */

/**
 * @typedef {Object} AssignmentExpression
 * @property {"AssignmentExpression"} type
 * @property {Token} name
 * @property {Expression} value 
 */

/**
 * @typedef {Object} IndexExpression
 * @property {"IndexExpression"} type
 * @property {Expression} object 
 * @property {Expression} index 
 * @property {Token} symbol
 */

/**
 * @typedef {Object} IndexedAssignmentExpression
 * @property {"IndexedAssignmentExpression"} type
 * @property {Expression} left 
 * @property {Expression} value 
 */

/**
 * @typedef {Object} ArrayExpression
 * @property {"ArrayExpression"} type
 * @property {Expression[]} items 
 */

/**
 * @typedef {Object} ObjectExpression
 * @property {"ObjectExpression"} type
 * @property {Expression[]} keys
 * @property {Expression[]} values
 * @property {Token} openingCurlyBracket
 */

/**
 * @typedef {Object} FunctionExpression
 * @property {"FunctionExpression"} type
 * @property {Token | undefined} name
 * @property {Token[]} parameters
 * @property {Statement} body
 */



/**
 * @typedef { LiteralExpression
 *          | UnaryExpression
 *          | GroupingExpression
 *          | LogicalExpression
 *          | CallExpression
 *          | VariableExpression
 *          | AssignmentExpression
 *          | IndexExpression
 *          | IndexedAssignmentExpression
 *          | ArrayExpression
 *          | ObjectExpression
 *          | FunctionExpression
 *          | BinaryExpression } Expression
 */



/*=============================*/
/* Statements                  */
/*=============================*/

/**
 * @typedef {Object} BlockStatement
 * @property {"BlockStatement"} type
 * @property {Statement[]} statements
 */

/**
 * @typedef {object} Parameter
 * @property {Expression} name
 * @property {Expression | undefined} defaultValue
 */

/**
 * @typedef {Object} VariableDeclaration
 * @property {"VariableDeclaration"} type
 * @property {Token} name
 * @property {Expression | undefined} initialiser
 */

/**
 * @typedef {Object} ConstantDeclaration
 * @property {"ConstantDeclaration"} type
 * @property {Token} name
 * @property {Expression} initialiser
 */

/**
 * @typedef {Object} FunctionDeclaration
 * @property {"FunctionDeclaration"} type
 * @property {Token} name
 * @property {Token[]} parameters
 * @property {Statement} body
 */

/**
 * @typedef {Object} ReturnStatement
 * @property {"ReturnStatement"} type
 * @property {Token} keyword
 * @property {Expression | undefined} expression
 */

/**
 * @typedef {Object} ExitStatement
 * @property {"ExitStatement"} type
 * @property {Token} keyword
 */

/**
 * @typedef {Object} SkipStatement
 * @property {"SkipStatement"} type
 * @property {Token} keyword
 */

/**
 * @typedef {Object} IfStatement
 * @property {"IfStatement"} type
 * @property {Expression} condition
 * @property {Statement} thenBranch
 * @property {Statement | undefined} elseBranch
 */

/**
 * @typedef {Object} Binding
 * @property {"Binding"} type
 * @property {Token | undefined} index
 * @property {Token | undefined} value
 */

/**
 * @typedef {Object} LoopStatement
 * @property {"LoopStatement"} type
 * @property {Expression | undefined} iterable
 * @property {Binding | undefined} binding
 * @property {Statement} body
 */

/**
 * @typedef {Object} ExpressionStatement
 * @property {"ExpressionStatement"} type
 * @property {Expression} expression
 */

/**
 * @typedef { BlockStatement
 *          | VariableDeclaration
 *          | ConstantDeclaration
 *          | FunctionDeclaration
 *          | ReturnStatement
 *          | ExitStatement
 *          | SkipStatement
 *          | IfStatement
 *          | LoopStatement
 *          | ExpressionStatement } Statement
 */



/*=============================*/
/* Values                      */
/*=============================*/


/**
 * @typedef {number} _Number 
 */

/**
 * @typedef {string} _String
 */

/**
 * @typedef {boolean} _Boolean
 */

/**
 * @typedef {null} _Null
 */

/**
 * @typedef {_Type[]} _Array
 */

/**
 * @typedef {Map<_Type, _Type>} _Object
 */

/**
 * @typedef {Object} _Function
 * @property {number} arity
 * @property {Environment} [closure]
 * @property {FunctionDeclaration | FunctionExpression} [declaration]
 * @property {(interpreter: Evaluator, args: _Type[]) => _Type} call
 */

/**
 * @typedef { _String
 *          | _Number 
 *          | _Boolean
 *          | _Array
 *          | _Object
 *          | _Function
 *          | _Null } _Type
 */

/**
 * @typedef {"null" | "array" | "object" | "function" | "string" | "number" | "boolean"} _TypeNames
 */
