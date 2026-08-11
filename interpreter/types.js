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
 * A token produced by the lexer.
 * 
 * @typedef {Object} Token
 * @property {TokenType} type The type of the token.
 * @property {any} [literal] The processed value.
 * @property {number} start Start character index in the source (inclusive).
 * @property {number} end End character index in the source (exclusive).
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
 * @property {string} source Source code being tokenized
 * @property {Token[]} tokens
 * @property {number} current
 * @property {*} diagnostics
 */

/**
 * @typedef {object} LiteralExpression
 * @property {"LiteralExpression"} type
 * @property { string
 *           | number 
 *           | boolean 
 *           | null } value
 */

/**
 * @typedef {Object} UnaryExpression
 * @property {"UnaryExpression"} type
 * @property {Token} operator
 * @property {Expression} right
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
/* STATEMENTS                  */
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
 * @property {Statement[]} body
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

