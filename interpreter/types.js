// @ts-check

/*=========================================*/
/* Interpreter                             */
/*=========================================*/

/**
 * Interpreter state. Shared across all phases (lexer, parser, resolver,
 * executor) so they can report diagnostics into one place and access
 * the original source.
 * 
 * @typedef {Object} Interpreter
 * @property {Host} host
 * @property {string} source Raw source code being interpreted.
 * @property {Token[]} tokens Tokens produced by the lexer phase.
 * @property {Statement[]} statements Abstract syntax tree produced by the parser phase.
 * @property {Map<Expression, number>} locals
 * @property {Diagnostic[]} diagnostics Errors/warnings/information collected across all phases.
 * @property {boolean} success True if no diagnostics with severity level "error" were reported
 */


/**
 * @typedef {"node" | "browser"} Host
 */

/*=========================================*/
/* Phases                                  */
/*=========================================*/

/**
 * Lexer state.
 * 
 * @typedef {Object} Lexer
 * @property {Interpreter} interpreter Shared interpreter state.
 * @property {number} start Start index of the current lexeme.
 * @property {number} current Current character index in the source.
 */

/**
 * Parser state.
 * 
 * @typedef {Object} Parser
 * @property {Interpreter} interpreter
 * @property {number} current
 */

/**
 * Resolver state.
 * 
 * @typedef {Object} Resolver
 * @property {Interpreter} interpreter
 * @property {Map<string, SymbolMetadata>[]} scopes
 * @property {number} functionDepth
 * @property {number} loopDepth
 */

/**
 * Executor state.
 * 
 * @typedef {Object} Executor
 * @property {Interpreter} interpreter
 * @property {Environment} globals
 * @property {Environment} environment
 */



/*=========================================*/
/* Tokens                                  */
/*=========================================*/

/**
 * @typedef { "LeftRoundBracket"
 *          | "RightRoundBracket"
 *          | "LeftSquareBracket"
 *          | "RightSquareBracket"
 *          | "LeftCurlyBracket"
 *          | "RightCurlyBracket"
 *          | "Dot"
 *          | "DotDot"
 *          | "DotDotMoreThan"
 *          | "DotDotLessThan"
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
 * The "lexeme" and "literal" fields are omitted here for simplicity and
 * to save memory. Use `getLexeme` and `getLiteral` from `./core/token.js`
 * instead.
 * 
 * @typedef {Object} Token
 * @property {TokenType} type The type of the token.
 * @property {number} start Start character index in the source (inclusive).
 * @property {number} end End character index in the source (exclusive).
 */


/**
 * `Range` identifier is already taken unfortunately. Hence the name `SourceRange` instead.
 * 
 * @typedef {Object} SourceRange
 * @property {number} startLine
 * @property {number} endLine
 * @property {number} startColumn
 * @property {number} endColumn
 */

/**
 * Named so to have symmetry with `SourceRange`.
 * 
 * @typedef {Object} SourceSpan
 * @property {number} start
 * @property {number} end
 */



/*=========================================*/
/* Expressions                             */
/*=========================================*/

/**
 * @typedef {object} LiteralExpression
 * @property {"LiteralExpression"} type
 * @property {Literal} value
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} UnaryExpression
 * @property {"UnaryExpression"} type
 * @property {Token} operator
 * @property {Expression} argument
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} RangeExpression
 * @property {"RangeExpression"} type
 * @property {Token} operator .. or ..< or ..>
 * @property {Expression} starting
 * @property {Expression} ending
 * @property {Expression | undefined} gap
 * @property {number} start Source range start
 * @property {number} end Source range end
 */

/**
 * @typedef {Object} GroupingExpression
 * @property {"GroupingExpression"} type
 * @property {Expression} expression
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} BinaryExpression
 * @property {"BinaryExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} LogicalExpression
 * @property {"LogicalExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} CallExpression
 * @property {"CallExpression"} type
 * @property {Expression} callee
 * @property {Expression[]} arguments
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} IdentifierExpression
 * @property {"IdentifierExpression"} type
 * @property {string} lexeme
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} AssignmentExpression
 * @property {"AssignmentExpression"} type
 * @property {Expression} left
 * @property {Expression} right 
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} MemberExpression
 * @property {"MemberExpression"} type
 * @property {Expression} object 
 * @property {Expression} property 
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ArrayExpression
 * @property {"ArrayExpression"} type
 * @property {Expression[]} elements 
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ObjectExpression
 * @property {"ObjectExpression"} type
 * @property {Expression[]} keys
 * @property {Expression[]} values
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} FunctionExpression
 * @property {"FunctionExpression"} type
 * @property {IdentifierExpression | undefined} name
 * @property {IdentifierExpression[]} parameters
 * @property {Statement} body
 * @property {number} start
 * @property {number} end
 */



/**
 * @typedef { LiteralExpression
 *          | UnaryExpression
 *          | RangeExpression
 *          | GroupingExpression
 *          | LogicalExpression
 *          | CallExpression
 *          | IdentifierExpression
 *          | AssignmentExpression
 *          | MemberExpression
 *          | ArrayExpression
 *          | ObjectExpression
 *          | FunctionExpression
 *          | BinaryExpression } Expression
 */



/*=========================================*/
/* Statements                              */
/*=========================================*/

/**
 * @typedef {Object} BlockStatement
 * @property {"BlockStatement"} type
 * @property {Statement[]} body
 * @property {number} start
 * @property {number} end
 */


/**
 * @typedef {Object} VariableDeclaration
 * @property {"VariableDeclaration"} type
 * @property {IdentifierExpression} name
 * @property {Expression | undefined} initialiser
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ConstantDeclaration
 * @property {"ConstantDeclaration"} type
 * @property {IdentifierExpression} name
 * @property {Expression} initialiser
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} FunctionDeclaration
 * @property {"FunctionDeclaration"} type
 * @property {IdentifierExpression} name
 * @property {IdentifierExpression[]} parameters
 * @property {Statement} body
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ReturnStatement
 * @property {"ReturnStatement"} type
 * @property {Expression | undefined} expression
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ExitStatement
 * @property {"ExitStatement"} type
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} SkipStatement
 * @property {"SkipStatement"} type
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} IfStatement
 * @property {"IfStatement"} type
 * @property {Expression} condition
 * @property {Statement} thenBranch
 * @property {Statement | undefined} elseBranch
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} Binding
 * @property {"Binding"} type
 * @property {IdentifierExpression | undefined} index
 * @property {IdentifierExpression | undefined} value
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} LoopStatement
 * @property {"LoopStatement"} type
 * @property {Expression | undefined} iterable
 * @property {Binding | undefined} binding
 * @property {Statement} body
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ExpressionStatement
 * @property {"ExpressionStatement"} type
 * @property {Expression} expression
 * @property {number} start
 * @property {number} end
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



/*=========================================*/
/* Environment                             */
/*=========================================*/

/**
 * @typedef {Object} Environment
 * @property {Environment | undefined} enclosing
 * @property {Map<string, {value: _Type, reassignable: boolean}>} values
 */



/*=========================================*/
/* Values                                  */
/*=========================================*/

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
 * @property {(args: _Type[], expression: CallExpression, executor: Executor) => _Type} call
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



/*=========================================*/
/* Error handling                          */
/*=========================================*/

/**
 * @typedef {Object} Diagnostic
 * @property {"error" | "warning" | "information"} type
 * @property {string} phase
 * @property {string} message Fully formatted message, placeholders already substituted
 * @property {number} startLine 
 * @property {number} startColumn
 * @property {number} endLine
 * @property {number} endColumn
*/

/*=========================================*/
/* Symbol Metadata                         */
/*=========================================*/

/**
 * @typedef {Object} SymbolMetadata
 * @property {boolean} defined
 * @property {boolean} used
 * @property {IdentifierExpression} node
 * @property {"Variable" | "Constant" | "Function" | "Parameter" | "Binding"} kind
 */