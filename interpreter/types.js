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
 *          | "Try"
 *          | "Fix"
 *          | "Crash"
 *          | "When"
 *          | "Else"
 *          | "Loop"
 *          | "With"
 *          | "Return"
 *          | "Exit"
 *          | "Skip"
 *          | "Import"
 *          | "Export"
 *          | "Indent"
 *          | "Dedent"
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
 * @property {Token[]} tokens
 * @property {number} current
 */

