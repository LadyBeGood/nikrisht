// @ts-check

import "../types.js";
import { keywords } from "../core/keywords.js";


/**
 * Creates a new lexer state.
 * 
 * @param {string} source Source code of the Nikrisht file.
 * @returns {Lexer} Lexer state.
 */
export function createLexer(source) {
    return {
        source,
        tokens: [],
        start: 0,
        current: 0,
        line: 0,
    }
}

/**
 * Check whether the lexer has reached the end of the source code.
 * 
 * @param {Lexer} lexer Lexer state.
 * @returns {boolean} True if there are no more characters to scan.
 */
function isAtEnd(lexer) {
    return lexer.current >= lexer.source.length;
}

/**
 * Return the current character without consuming it.
 *
 * @param {Lexer} lexer Lexer state.
 * @returns {string | undefined} The current character, or `undefined` if the lexer is at EndOfFile.
 */
function peek(lexer) {
    return lexer.source[lexer.current];
}

/**
 * Consume and return the current character.
 *
 * @param {Lexer} lexer Lexer state.
 * @returns {string | undefined} The consumed character, or `undefined` if the lexer is at EndOfFile.
 */
function consume(lexer) {
    return lexer.source[lexer.current++];
}


/**
 * Checks if the character at the current lexer position matches the expected character.
 * 
 * @param {Lexer} lexer Lexer state.
 * @param {string} expected The exact character to match.
 * @returns {boolean} `true` if the current character matches one of the expected characters, otherwise `false`.
 */
function check(lexer, expected) {
    if (lexer.source[lexer.current] === expected) {
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
    if (lexer.source[lexer.current] != expected) {
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
        (characterCode >= 65 && characterCode <= 90)  ||   // A-Z
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
 * @param {any} [literal] 
 */
function addToken(lexer, tokenType, literal) {
    lexer.tokens.push({ 
        type: tokenType, 
        literal, 
        start: lexer.start, 
        end: lexer.current,
        lexeme: lexer.source.slice(lexer.start, lexer.current),
    });
}




/**
 * 
 * @param {Lexer} lexer Lexer state 
 */
function lexString(lexer) {
    while (!check(lexer, '"')) {
        if (check(lexer, "\n")) {
            lexer.line++
        }

        consume(lexer)
    }

    if (isAtEnd(lexer)) {
        throw Error("Unterminated string.")
    }

    // consume closing quote
    consume(lexer)

    // Skip the quotes for literal value
    const literal = lexer.source.slice(lexer.start + 1, lexer.current - 1)
    addToken(lexer, "StringLiteral", literal)
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
            throw Error("Oihoi")
        }

        while (isDigit(peek(lexer))) {
            consume(lexer)
        }
    }

    const literal = parseFloat(lexer.source.slice(lexer.start, lexer.current))
    addToken(lexer, "NumericLiteral", literal);
}

/**
 * 
 * @param {Lexer} lexer 
 */
function lexIdentifier(lexer) {
    while (isIdentifierPart(peek(lexer))) {
        consume(lexer);
    }

    const lexeme = lexer.source.slice(lexer.start, lexer.current);
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
            break;
        case "\n":
            lexer.line++
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
                throw Error("oiiiiiii");
            }
    }
}

/**
 * Lexes the source code and converts it into an array of token.
 * 
 * @param {Lexer} lexer Lexer state.
 * @returns {Token[]} Generated tokens.
 */
export function lex(lexer) {
    while (!isAtEnd(lexer)) {
        lexer.start = lexer.current;
        lexToken(lexer)
    }

    lexer.tokens.push({ type: "EndOfFile", start: lexer.start, end: lexer.current, lexeme: "" });
    return lexer.tokens;
}

