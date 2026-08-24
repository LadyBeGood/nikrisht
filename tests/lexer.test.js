// Bun imports
import { test, expect, describe } from "bun:test";

// Local imports
import { createInterpreter } from "../interpreter/interpreter.js";
import { createLexer, lex } from "../interpreter/phases/lexer.js";
import { getLexeme, getLiteral } from "../interpreter/core/token.js";
import { keywords } from "../interpreter/core/keywords.js";


function tokenise(source) {
    const interpreter = createInterpreter(source, "node");
    const lexer = createLexer(interpreter);
    lex(lexer);

    return {
        tokens: interpreter.tokens,
        diagnostics: interpreter.diagnostics,
        lexeme: (token) => getLexeme(interpreter, token),
        literal: (token) => getLiteral(interpreter, token),
    };
}

describe("Whitespace and Comments", () => {
    test.each([
        ["Empty file", ""],
        ["Spaces", "   "],
        ["LF newlines", "\n\n\n"],
        ["CRLF newlines", "\r\n\r\n\r\n"],
        ["Tabs", "\t\t\t"],
        ["Regular comment not terminated by any newline", "# Hello, World!"],
        ["Regular comment terminated by LF newline", "# Hello, World!\n"],
        ["Regular comment terminated by CRLF newline", "# Hello, World!\r\n"],
        ["Mixed whitespace and comments", "   \n \n \t \r\n   # Hello, World!      \n\t # Bye, World!"],
    ])("%s produces just EndOfFile", (_name, source) => {
        const { tokens, diagnostics } = tokenise(source);

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(1); // EndOfFile
        expect(tokens[0].type).toBe("EndOfFile");
    });
});


describe("Single-character punctuations", () => {
    test.each([
        ["(", "LeftRoundBracket"],
        [")", "RightRoundBracket"],
        ["{", "LeftCurlyBracket"],
        ["}", "RightCurlyBracket"],
        ["[", "LeftSquareBracket"],
        ["]", "RightSquareBracket"],
        [".", "Dot"],
        [",", "Comma"],
        [":", "Colon"],
        [";", "Semicolon"],
        ["+", "Plus"],
        ["-", "Minus"],
        ["*", "Asterisk"],
        ["/", "Slash"],
        ["&", "And"],
        ["|", "Bar"],
        ["!", "ExclamationMark"],
        ["=", "Equal"],
        ["<", "LessThan"],
        [">", "MoreThan"],
    ])("%p lexes to %s", (source, expectedType) => {
        const { tokens, diagnostics, lexeme } = tokenise(source);

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(expectedType);
        expect(lexeme(tokens[0])).toBe(source);
    });
});

describe("Multi-character operators", () => {
    test.each([
        ["!=", "ExclamationMarkEqual"],
        ["==", "EqualEqual"],
        ["<=", "LessThanEqual"],
        [">=", "MoreThanEqual"],
        ["..", "DotDot"],
        ["..<", "DotDotLessThan"],
        ["..>", "DotDotMoreThan"],
    ])("%p lexes to %s", (source, expectedType) => {
        const { tokens, diagnostics, lexeme } = tokenise(source);

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(expectedType);
        expect(lexeme(tokens[0])).toBe(source);
    });
});

describe("Numbers", () => {
    test("Integer number", () => {
        const { tokens, lexeme, literal } = tokenise("123");

        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe("NumericLiteral");
        expect(lexeme(tokens[0])).toBe("123");
        expect(literal(tokens[0])).toBe(123);
    });

    test("Rational number", () => {
        const { tokens, lexeme, literal } = tokenise("123.45");

        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe("NumericLiteral");
        expect(lexeme(tokens[0])).toBe("123.45");
        expect(literal(tokens[0])).toBe(123.45);
    });

    test("Negative number", () => {
        const { tokens, lexeme, literal } = tokenise("-123.45");

        expect(tokens.length).toBe(3);
        expect(tokens[0].type).toBe("Minus");
        expect(tokens[1].type).toBe("NumericLiteral");
        expect(lexeme(tokens[1])).toBe("123.45");
        expect(literal(tokens[1])).toBe(123.45);
    });

    test("Number with trailing dot", () => {
        const { tokens, lexeme, literal } = tokenise("123.");

        expect(tokens.length).toBe(3); 
        expect(tokens[0].type).toBe("NumericLiteral");
        expect(lexeme(tokens[0])).toBe("123");
        expect(literal(tokens[0])).toBe(123);
        expect(tokens[1].type).toBe("Dot");
    });

    test("Number with trailing letters", () => {
        const { tokens, lexeme, literal } = tokenise("123abc");

        expect(tokens.length).toBe(3);
        expect(tokens[0].type).toBe("NumericLiteral");
        expect(lexeme(tokens[0])).toBe("123");
        expect(literal(tokens[0])).toBe(123);
        expect(tokens[1].type).toBe("Identifier");
        expect(lexeme(tokens[1])).toBe("abc");
    });
});

describe("Strings", () => {
    test("Empty string", () => {
        const { tokens, diagnostics, lexeme, literal } = tokenise('""');

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe("StringLiteral");
        expect(lexeme(tokens[0])).toBe('""');
        expect(literal(tokens[0])).toBe("");
    });

    test("Simple string", () => {
        const { tokens, diagnostics, lexeme, literal } = tokenise('"hello"');

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe("StringLiteral");
        expect(lexeme(tokens[0])).toBe('"hello"');
        expect(literal(tokens[0])).toBe("hello");
    });

    test("Unterminated empty string", () => {
        const { tokens, diagnostics } = tokenise('"');

        expect(diagnostics.length).toBe(1);
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe("EndOfFile");
    });

    test("Unterminated simple string", () => {
        const { tokens, diagnostics } = tokenise('"Hello, World!');

        expect(diagnostics.length).toBe(1);
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe("EndOfFile");
    });
});

describe("Identifiers", () => {
    test.each([
        ["Identifier with only letters", "name"],
        ["Identifier starting with letters and ending with digits", "name123"],
        ["Identifier starting with underscore", "_name"],
        ["Identifier ending with underscore", "name_"],
        ["Identifier with digits and underscore mixed", "name123_name_456"],
    ])("%s", (_name, source) => {
        const { tokens, diagnostics, lexeme } = tokenise(source);

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe("Identifier");
        expect(lexeme(tokens[0])).toBe(source);
    });
});

describe("Keywords", () => {
    test.each(
        [...keywords].map(keyword => [keyword, keyword[0].toUpperCase() + keyword.slice(1)])
    )("Keyword %p lexes to its token type %s", (keyword, expectedType) => {
        const { tokens, diagnostics, lexeme } = tokenise(keyword);

        expect(diagnostics.length).toBe(0);
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(expectedType);
        expect(lexeme(tokens[0])).toBe(keyword);
    });

    test("An identifier that merely contains a keyword is not treated as one", () => {
        const randomKeyword = () => [...keywords][Math.floor(Math.random() * keywords.size)];
        const { tokens, lexeme } = tokenise(`${randomKeyword()}abcd ab${randomKeyword()}cd abcd${randomKeyword()}`);

        expect(tokens[0].type).toBe("Identifier");
        expect(tokens[1].type).toBe("Identifier");
        expect(tokens[2].type).toBe("Identifier");
    });
});

describe("Invalid characters", () => {
    test.each([
        "`",
        "~",
        "@",
        "$",
        "%",
        "^",
        "\\",
        "'",
        "?",
    ])("%s", (character) => {
        const { tokens, diagnostics } = tokenise(character);

        expect(diagnostics.length).toBe(1);
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe("EndOfFile");
    });

    test("Recovery after lexing an invalid character", () => {
        const { tokens, diagnostics, lexeme } = tokenise("abc@def");

        expect(diagnostics.length).toBe(1);
        expect(tokens.length).toBe(3);
        expect(tokens[0].type).toBe("Identifier");
        expect(tokens[1].type).toBe("Identifier");
        expect(lexeme(tokens[0])).toBe("abc");
        expect(lexeme(tokens[1])).toBe("def");
    });

    test("Multiple invalid characters each report their own diagnostic", () => {
        const { tokens, diagnostics } = tokenise("@$%");

        expect(diagnostics.length).toBe(3);
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe("EndOfFile");
    });
});

