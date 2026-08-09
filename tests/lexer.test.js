// Bun imports
import { test, expect, describe } from "bun:test";

// Local Imports
import { createCompiler } from "../compiler/compiler.js";
import { createLexer, lex } from "../compiler/lexer.js";


function tokenise(source, returnCompiler = false) {
    const compiler = createCompiler(source);
    const lexer = createLexer(compiler.sources[0]);
    const tokens = lex(compiler, lexer);
    
    if (returnCompiler) {
        return [compiler, tokens];
    } else {
        return tokens;
    }
    
}

test("Empty file", function () {
    const tokens = tokenise("");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with only spaces", function () {
    const tokens = tokenise("   ");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with only newlines", function () {
    const tokens = tokenise("\n\n\n");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with only whitespaces", function () {
    const tokens = tokenise("   \n \n      \n");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with comment", function () {
    const tokens = tokenise("# hi");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with leading whitespaces and comments", function () {
    const tokens = tokenise("   \n \n   # hi \n # bye");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Empty file, with leading whitespaces and comments", function () {
    const tokens = tokenise("   \n \n   # hi \n # bye");

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})

test("Leading spaces before an identifier", function () {
    const [compiler, tokens] = tokenise("   aaa", /* returnCompiler */ true);

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe("EndOfFile");
})



test("Lexing a variable declaration", function () {
    const tokens = tokenise("x ~ 10");

    expect(tokens.length).toBe(4);
    expect(tokens[0].type).toBe("Identifier");
    expect(tokens[1].type).toBe("Tilde");
    expect(tokens[2].type).toBe("NumericLiteral");
});

test("Lexing a variable declaration", function () {
    const tokens = tokenise("x = 10");

    expect(tokens.length).toBe(4);
    expect(tokens[0].type).toBe("Identifier");
    expect(tokens[1].type).toBe("Equal");
    expect(tokens[2].type).toBe("NumericLiteral");
});





