// Bun imports
import { test, expect, describe } from "bun:test";

// Local imports
import { createInterpreter } from "../interpreter/interpreter.js";
import { createLexer, lex as lexSource } from "../interpreter/phases/lexer.js";
import { createParser, parse as parseSource } from "../interpreter/phases/parser.js";
import { createResolver, resolve as resolveSource } from "../interpreter/phases/resolver.js";

/**
 * Helper that runs the full pipeline up to (and including) the resolver.
 * Returns the diagnostics and the locals map produced by the resolver.
 */
function resolve(source) {
    const interpreter = createInterpreter(source);

    const lexer = createLexer(interpreter);
    lexSource(lexer);

    const parser = createParser(interpreter);
    parseSource(parser);

    const resolver = createResolver(interpreter);
    resolveSource(resolver);

    return {
        diagnostics: interpreter.diagnostics,
        locals: interpreter.locals,
        statements: interpreter.statements,
    };
}


describe("Basic", () => {
    test("Empty program produces no diagnostics", () => {
        const { diagnostics, locals } = resolve("");
        expect(diagnostics.length).toBe(0);
        expect(locals.size).toBe(0);
    });

    test("Simple variable declaration & use", () => {
        const { diagnostics, locals } = resolve(`
            var x = 1;
            write(x);
        `);

        expect(diagnostics.length).toBe(0);
        // the IdentifierExpression for the use of `x` should be recorded in locals
        expect(locals.size).toBeGreaterThan(0);
    });

    test("Constant declaration & use", () => {
        const { diagnostics, locals } = resolve(`
            const PI = 3.14;
            write(PI);
        `);
        expect(diagnostics.length).toBe(0);
        expect(locals.size).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// Unused symbols
// ---------------------------------------------------------------------------

describe("Unused symbols", () => {
    test("unused variable emits a warning", () => {
        const { diagnostics } = resolve(`
            var unused = 42;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("warning");
        expect(diagnostics[0].message).toContain('Variable "unused" is declared but never used');
    });

    test("unused constant emits a warning", () => {
        const { diagnostics } = resolve(`
            const unused = 42;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("warning");
        expect(diagnostics[0].message).toContain('Constant "unused" is declared but never used');
    });

    test("unused function parameter emits a warning", () => {
        const { diagnostics } = resolve(`
            func f(a) {}
            f(1);
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("warning");
        expect(diagnostics[0].message).toContain('Parameter "a" is declared but never used');
    });

    test("used symbols do not emit warnings", () => {
        const { diagnostics } = resolve(`
            var x = 1;
            const y = 2;
            func f(a) {
                return a + x + y;
            }
            f(3);
        `);
        expect(diagnostics.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Redeclaration
// ---------------------------------------------------------------------------

describe("Redeclaration", () => {
    test("redeclaration in the same scope is an error", () => {
        const { diagnostics } = resolve(`
            var x = 1;
            var x = 2;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Symbol "x" is already declared in this scope');
    });

    test("shadowing in a nested block is allowed", () => {
        const { diagnostics } = resolve(`
            var x = 1;
            {
                var x = 2;
            }
        `);
        // only the outer unused warning (if any); no redeclaration error
        const errors = diagnostics.filter(d => d.type === "error");
        expect(errors.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Self-reference in initialiser
// ---------------------------------------------------------------------------

describe("Self-reference in initialiser", () => {
    test("reading a variable in its own initialiser is an error", () => {
        const { diagnostics } = resolve(`
            var x = x;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Cannot read local variable "x" in its own initializer');
    });

    test("reading a constant in its own initialiser is an error", () => {
        const { diagnostics } = resolve(`
            const x = x;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Cannot read local variable "x" in its own initializer');
    });
});

// ---------------------------------------------------------------------------
// return / exit / skip
// ---------------------------------------------------------------------------

describe("Control-flow restrictions", () => {
    test("return outside a function is an error", () => {
        const { diagnostics } = resolve(`
            return 42;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Cannot use "return" outside of a function');
    });

    test("return inside a function is fine", () => {
        const { diagnostics } = resolve(`
            func f() {
                return 42;
            }
        `);
        // may have an unused-function warning, but no error
        const errors = diagnostics.filter(d => d.type === "error");
        expect(errors.length).toBe(0);
    });

    test("exit outside a loop is an error", () => {
        const { diagnostics } = resolve(`
            exit;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Cannot use "exit" outside of a loop');
    });

    test("skip outside a loop is an error", () => {
        const { diagnostics } = resolve(`
            skip;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("error");
        expect(diagnostics[0].message).toContain('Cannot use "skip" outside of a loop');
    });

    test("exit / skip inside a loop are fine", () => {
        const { diagnostics } = resolve(`
            loop ([1, 2, 3] with x) {
                if (x == 2) {
                    skip;
                }
                if (x == 3) {
                    exit;
                }
            }
        `);
        const errors = diagnostics.filter(diagnostic => diagnostic.type === "error");
        expect(errors.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Pure-expression warning
// ---------------------------------------------------------------------------

describe("Pure expression statements", () => {
    test("discarded pure expression emits a warning", () => {
        const { diagnostics } = resolve(`
            1 + 2;
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("warning");
        expect(diagnostics[0].message).toContain("Expression result is never used");
    });

    test("call expression is not considered pure", () => {
        const { diagnostics } = resolve(`
            func f() {}
            f();
        `);
        // only possible unused-function warning, no “result is never used”
        const pureWarnings = diagnostics.filter(d =>
            d.message.includes("Expression result is never used")
        );
        expect(pureWarnings.length).toBe(0);
    });

    test("assignment is not considered pure", () => {
        const { diagnostics } = resolve(`
            var x = 0;
            x = 1;
        `);
        const pureWarnings = diagnostics.filter(d =>
            d.message.includes("Expression result is never used")
        );
        expect(pureWarnings.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Functions & nesting
// ---------------------------------------------------------------------------

describe("Functions", () => {
    test("named function declaration", () => {
        const { diagnostics } = resolve(`
            func add(a, b) {
                return a + b;
            }
            add(1, 2);
        `);
        expect(diagnostics.length).toBe(0);
    });

    test("function expression", () => {
        const { diagnostics } = resolve(`
            var f = func(a) {
                return a;
            };
            f(10);
        `);
        expect(diagnostics.length).toBe(0);
    });

    test("nested functions see outer scopes", () => {
        const { diagnostics } = resolve(`
            var outer = 1;
            func f() {
                func g() {
                    return outer;
                }
                return g();
            }
            f();
        `);
        expect(diagnostics.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Loops & bindings
// ---------------------------------------------------------------------------

describe("Loops", () => {
    test("loop with value binding", () => {
        const { diagnostics } = resolve(`
            loop ([1, 2, 3] with value) {
                write(value);
            }
        `);
        expect(diagnostics.length).toBe(0);
    });

    test("loop with index and value binding", () => {
        const { diagnostics } = resolve(`
            loop ([1, 2, 3] with [i, value]) {
                write(i);
                write(value);
            }
        `);
        expect(diagnostics.length).toBe(0);
    });

    test("unused loop binding emits a warning", () => {
        const { diagnostics } = resolve(`
            loop ([1, 2, 3] with value) {
                # value never used
            }
        `);

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].type).toBe("warning");
        expect(diagnostics[0].message).toContain('Binding "value" is declared but never used');
    });
});


describe("Locals distance", () => {
    test("records correct distance for nested scopes", () => {
        const { locals, statements } = resolve(`
            var a = 1;
            {
                var b = 2;
                {
                    a;   // distance 2
                    b;   // distance 1
                }
            }
        `);

        // We just assert that the map is non-empty and contains sensible distances.
        // Exact Expression nodes are hard to grab without walking the AST,
        console.log([...locals.entries()]);
        // so we only check the recorded distances.
        const distances = [...locals.values()];
        expect(distances).toContain(2); // a
        expect(distances).toContain(1); // b
    });
});