// @ts-check

import "../types.js";
import { keywords } from "../core/keywords.js";
import { LexingError } from "../diagnostics/classes.js";
import { error as diagnosticError } from "../diagnostics/report.js";


/**
 * Creates a new lexer state.
 * 
 * @param {Interpreter} interpreter Source code of the Nikrisht file.
 * @returns {Lexer} Lexer state.
 */
export function createLexer(interpreter) {
    return {
        interpreter,
        start: 0,
        current: 0,
    }
}

/**
 * Check whether the lexer has reached the end of the source code.
 * 
 * @param {Lexer} lexer Lexer state.
 * @returns {boolean} True if there are no more characters to scan.
 */
function isAtEnd(lexer) {
    return lexer.current >= lexer.interpreter.source.length;
}

/**
 * Return the current character without consuming it.
 *
 * @param {Lexer} lexer Lexer state.
 * @returns {string | undefined} The current character, or `undefined` if the lexer is at EndOfFile.
 */
function peek(lexer) {
    return lexer.interpreter.source[lexer.current];
}

/**
 * Consume and return the current character.
 *
 * @param {Lexer} lexer Lexer state.
 * @returns {string | undefined} The consumed character, or `undefined` if the lexer is at EndOfFile.
 */
function consume(lexer) {
    return lexer.interpreter.source[lexer.current++];
}


/**
 * Checks if the character at the current lexer position matches the expected character.
 * 
 * @param {Lexer} lexer Lexer state.
 * @param {string} expected The exact character to match.
 * @returns {boolean} `true` if the current character matches one of the expected characters, otherwise `false`.
 */
function check(lexer, expected) {
    if (lexer.interpreter.source[lexer.current] === expected) {
        return true;
    } else {
        return false;
    }
}

/**
 * Consume the current character if it matches the expected character.
 *
 * @param {Lexer} lexer Lexer state.
 * @param {string} expected Expected character.
 * @returns {boolean} True if the character matched and was consumed.
 */
function match(lexer, expected) {
    if (lexer.interpreter.source[lexer.current] != expected) {
        return false;
    } else {
        lexer.current++;
        return true;
    }
}


/**
 * Check whether a character is a decimal digit
 * 
 * @param {string | undefined} character 
 * @returns {boolean} True if the character is 0-9
 */
function isDigit(character) {
    if (character === undefined) return false;

    const characterCode = character.charCodeAt(0);
    return characterCode >= 48 && characterCode <= 57;   // 0-9
}

/**
 * Check whether a character is start of an identifier
 * 
 * @param {string | undefined} character 
 * @returns {boolean} True if the character is A-Z, a-z, or _
 */
function isIdentifierStart(character) {
    if (character === undefined) return false;

    const characterCode = character.charCodeAt(0);
    return (
        (characterCode >= 65 && characterCode <= 90) ||    // A-Z
        (characterCode >= 97 && characterCode <= 122) ||   // a-z
        characterCode === 95                               // _
    );
}

/**
 * Check whether a character is part of an identifier
 * 
 * @param {string | undefined} character 
 * @returns {boolean} True if the character is A-Z, a-z, _, or 0-9
 */
function isIdentifierPart(character) {
    if (character === undefined) return false;

    return isIdentifierStart(character) || isDigit(character);
}


/**
 *  
 * @param {Lexer} lexer 
 * @param {TokenType} tokenType 
 */
function addToken(lexer, tokenType) {
    lexer.interpreter.tokens.push({
        type: tokenType,
        start: lexer.start,
        end: lexer.current,
    });
}


/**
 * This function is here only because writing `{ start: lexer.start, end: lexer.current }` at every call is
 * wasteful. Other phases don't have any similar helper function like this, for they have their start and
 * end range in their nodes themselves.
 * 
 * @param {Lexer} lexer 
 * @param {string} message
 */
function error(lexer, message) {
    diagnosticError(lexer.interpreter, { start: lexer.start, end: lexer.current }, message, "lexer");
}

/**
 * 
 * @param {Lexer} lexer Lexer state 
 */
function lexString(lexer) {
    while (!check(lexer, '"')) {
        consume(lexer)
    }

    if (isAtEnd(lexer)) {
        error(lexer, "Unterminated string.");
    }

    // consume closing quote
    consume(lexer)

    addToken(lexer, "StringLiteral")
}

/**
 * 
 * @param {Lexer} lexer 
 */
function lexNumber(lexer) {
    while (isDigit(peek(lexer))) {
        consume(lexer);
    }

    if (check(lexer, ".")) {
        consume(lexer)

        if (isAtEnd(lexer)) {
            error(lexer, "Invalid number.")
        }

        while (isDigit(peek(lexer))) {
            consume(lexer)
        }
    }

    addToken(lexer, "NumericLiteral");
}

/**
 * 
 * @param {Lexer} lexer 
 */
function lexIdentifier(lexer) {
    while (isIdentifierPart(peek(lexer))) {
        consume(lexer);
    }

    const lexeme = lexer.interpreter.source.slice(lexer.start, lexer.current);
    const type =
        keywords.has(lexeme)
            ? /** @type {TokenType} */ (lexeme[0].toUpperCase() + lexeme.slice(1))
            : "Identifier"

    addToken(lexer, type)
}





/**
 * 
 * @param {Lexer} lexer 
 */
function lexToken(lexer) {
    const character = consume(lexer);

    switch (character) {
        case "(":
            addToken(lexer, "LeftRoundBracket");
            break;
        case ")":
            addToken(lexer, "RightRoundBracket");
            break;
        case "{":
            addToken(lexer, "LeftCurlyBracket");
            break;
        case "}":
            addToken(lexer, "RightCurlyBracket");
            break;
        case "[":
            addToken(lexer, "LeftSquareBracket");
            break;
        case "]":
            addToken(lexer, "RightSquareBracket");
            break;
        case ",":
            addToken(lexer, "Comma");
            break;
        case ".":
            if (match(lexer, ".")) {
                addToken(lexer, "DotDot")
            } else {
                addToken(lexer, "Dot")
            }
            break;
        case "-":
            addToken(lexer, "Minus");
            break;
        case "+":
            addToken(lexer, "Plus");
            break;
        case ";":
            addToken(lexer, "Semicolon");
            break;
        case "*":
            addToken(lexer, "Asterisk");
            break;
        case ":":
            addToken(lexer, "Colon");
            break;
        case "!":
            if (match(lexer, "=")) {
                addToken(lexer, "ExclamationMarkEqual")
            } else {
                addToken(lexer, "ExclamationMark")
            }
            break;
        case "=":
            if (match(lexer, "=")) {
                addToken(lexer, "EqualEqual")
            } else {
                addToken(lexer, "Equal")
            }
            break;
        case "<":
            if (match(lexer, "=")) {
                addToken(lexer, "LessThanEqual")
            } else {
                addToken(lexer, "LessThan")
            }
            break;
        case ">":
            if (match(lexer, ">")) {
                addToken(lexer, "MoreThanEqual")
            } else {
                addToken(lexer, "MoreThan")
            }
            break;
        case "/":
            addToken(lexer, "Slash")
            break;
        case " ":
        case "\r":
        case "\t":
        case "\n":
            // Skip whitespace
            break;
        case '"':
            lexString(lexer);
            break;
        default:
            if (isDigit(character)) {
                lexNumber(lexer)
            } else if (isIdentifierStart(character)) {
                lexIdentifier(lexer)
            } else {
                error(lexer, `Invalid character ${JSON.stringify(character)}`);
            }
    }
}

/**
 * Lexes the source code and converts it into an array of token.
 * 
 * @param {Lexer} lexer Lexer state.
 */
export function lex(lexer) {
    while (!isAtEnd(lexer)) {
        lexer.start = lexer.current;

        try {
            lexToken(lexer);
        } catch (error) {
            if (error instanceof LexingError) {
                lexer.current++;
                continue;
            }

            throw error;
        }
    }

    lexer.interpreter.tokens.push({ type: "EndOfFile", start: lexer.start, end: lexer.current });
}

