// Bun imports
import { test, expect, describe } from "bun:test";

// Local imports
import { createInterpreter } from "../interpreter/interpreter.js";
import { createLexer, lex } from "../interpreter/phases/lexer.js";
import { createParser, parse as parseTokens } from "../interpreter/phases/parser.js";


function parse(source) {
    const interpreter = createInterpreter(source, "node");
    const lexer = createLexer(interpreter);
    lex(lexer);

    if (interpreter.diagnostics.length != 0) throw new Error("Bruh the lexing iteself failed.")

    const parser = createParser(interpreter);
    parseTokens(parser);

    return {
        statements: interpreter.statements,
        diagnostics: interpreter.diagnostics,
    };
}



describe("Expressions", () => {
    describe("Primary", () => {
        test("True", () => {
            const { statements } = parse("true;");

            expect(statements[0].expression).toMatchObject({
                type: "LiteralExpression",
                value: true,
            });
        });

        test("False", () => {
            const { statements } = parse("false;");

            expect(statements[0].expression).toMatchObject({
                type: "LiteralExpression",
                value: false,
            });
        });

        test("Null", () => {
            const { statements } = parse("null;");

            expect(statements[0].expression).toMatchObject({
                type: "LiteralExpression",
                value: null,
            });
        });

        test("Number", () => {
            const { statements } = parse("123.45;");

            expect(statements[0].expression).toMatchObject({
                type: "LiteralExpression",
                value: 123.45,
            });
        });

        test("String", () => {
            const { statements } = parse('"Hello, World!";');

            expect(statements[0].expression).toMatchObject({
                type: "LiteralExpression",
                value: "Hello, World!",
            });
        });

        test("Identifier", () => {
            const { statements } = parse("name;");

            expect(statements[0].expression).toMatchObject({
                type: "IdentifierExpression",
                lexeme: "name",
            });
        });

        test("Grouping", () => {
            const { statements } = parse("(123);");

            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "LiteralExpression",
                    value: 123,
                },
            });
        });
    })


    describe("Array", () => {
        test("Empty array", () => {
            const { statements } = parse("[];");

            expect(statements[0].expression).toMatchObject({
                type: "ArrayExpression",
                elements: [],
            });
        });

        test("Simple array", () => {
            const { statements } = parse("[1, 2, 3];");

            expect(statements[0].expression).toMatchObject({
                type: "ArrayExpression",
                elements: [
                    { type: "LiteralExpression", value: 1 },
                    { type: "LiteralExpression", value: 2 },
                    { type: "LiteralExpression", value: 3 },
                ],
            });
        });

        test("Array containing expressions", () => {
            const { statements } = parse("[1 + 2, abc, def * 3];");

            const elements = statements[0].expression.elements;

            expect(elements[0]).toMatchObject({
                type: "BinaryExpression",
            });

            expect(elements[1]).toMatchObject({
                type: "IdentifierExpression",
            });

            expect(elements[2]).toMatchObject({
                type: "BinaryExpression",
            });
        });
    });


    describe("Object", () => {
        test("Empty object", () => {
            const { statements } = parse("({});");

            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "ObjectExpression",
                    keys: [],
                    values: [],
                }
            });
        });

        test("Simple object", () => {
            const { statements } = parse('({ "abc": 123, true: null });');
            
            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "ObjectExpression",
                    keys: [
                        {
                            type: "LiteralExpression",
                            value: "abc",
                        },
                        {
                            type: "LiteralExpression",
                            value: true,
                        },
                    ],
                    values: [
                        {
                            type: "LiteralExpression",
                            value: 123,
                        },
                        {
                            type: "LiteralExpression",
                            value: null,
                        },
                    ],
                }
            });
        });

        test("Expressions as keys and values", () => {
            const { statements } = parse("({ 1 + 2 * 3: true & false });");

            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "ObjectExpression",
                    keys: [
                        {
                            type: "BinaryExpression",
                        },
                    ],
                    values: [
                        {
                            type: "LogicalExpression",
                        },
                    ],
                }
            });
        });

    });


    describe("Unary", () => {
        test("Plus", () => {
            const { statements } = parse("+abc;");

            expect(statements[0].expression).toMatchObject({
                type: "UnaryExpression",
                operator: {
                    type: "Plus",
                },
                argument: {
                    type: "IdentifierExpression",
                    lexeme: "abc",
                },
            });
        });

        test("Minus", () => {
            const { statements } = parse("-abc;");

            expect(statements[0].expression).toMatchObject({
                type: "UnaryExpression",
                operator: {
                    type: "Minus",
                },
                argument: {
                    type: "IdentifierExpression",
                    lexeme: "abc",
                },
            });
        });

        test("Not", () => {
            const { statements } = parse("!abc;");

            expect(statements[0].expression).toMatchObject({
                type: "UnaryExpression",
                operator: {
                    type: "ExclamationMark",
                },
                argument: {
                    type: "IdentifierExpression",
                    lexeme: "abc",
                },
            });
        });

        test("Nested unary", () => {
            const { statements } = parse("+-!abc;");

            expect(statements[0].expression).toMatchObject({
                type: "UnaryExpression",
                operator: { 
                    type: "Plus" 
                },
                argument: {
                    type: "UnaryExpression",
                    operator: {
                        type: "Minus"
                    },
                    argument: {
                        type: "UnaryExpression",
                        operator: {
                            type: "ExclamationMark"
                        },
                        argument: {
                            type: "IdentifierExpression",
                            lexeme: "abc",
                        }
                    },
                },
            });
        });

    });


    describe("Range", () => {
        test("Inclusive range", () => {
            const { statements } = parse("1..10;");

            expect(statements[0].expression).toMatchObject({
                type: "RangeExpression",
                left: {
                    type: "LiteralExpression",
                    value: 1,
                },
                right: {
                    type: "LiteralExpression",
                    value: 10,
                },
                operator: {
                    type: "DotDot",
                },
            });
        });

        test("Exclusive upper range", () => {
            const { statements } = parse("1..<10;");

            expect(statements[0].expression).toMatchObject({
                type: "RangeExpression",
                left: {
                    type: "LiteralExpression",
                    value: 1,
                },
                right: {
                    type: "LiteralExpression",
                    value: 10,
                },
                operator: {
                    type: "DotDotLessThan",
                },
            });
        });

        test("Exclusive lower range", () => {
            const { statements } = parse("10..>1;");

            expect(statements[0].expression).toMatchObject({
                type: "RangeExpression",
                left: {
                    type: "LiteralExpression",
                    value: 10,
                },
                right: {
                    type: "LiteralExpression",
                    value: 1,
                },
                operator: {
                    type: "DotDotMoreThan",
                },
            });
        });

    });


    describe("binary expressions", () => {

        test("multiplication", () => {
            const { statements } = parse("a * b;");

            expect(statements[0].expression).toMatchObject({
                type: "BinaryExpression",
                left: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                right: {
                    type: "IdentifierExpression",
                    lexeme: "b",
                },
                operator: {
                    type: "Asterisk",
                },
            });
        });

        test("division", () => {
            const { statements } = parse("a / b;");

            expect(statements[0].expression.operator.type)
                .toBe("Slash");
        });

        test("addition", () => {
            const { statements } = parse("a + b;");

            expect(statements[0].expression.operator.type)
                .toBe("Plus");
        });

        test("subtraction", () => {
            const { statements } = parse("a - b;");

            expect(statements[0].expression.operator.type)
                .toBe("Minus");
        });

        test("greater than", () => {
            const { statements } = parse("a > b;");

            expect(statements[0].expression.operator.type)
                .toBe("MoreThan");
        });

        test("greater than or equal", () => {
            const { statements } = parse("a >= b;");

            expect(statements[0].expression.operator.type)
                .toBe("MoreThanEqual");
        });

        test("less than", () => {
            const { statements } = parse("a < b;");

            expect(statements[0].expression.operator.type)
                .toBe("LessThan");
        });

        test("less than or equal", () => {
            const { statements } = parse("a <= b;");

            expect(statements[0].expression.operator.type)
                .toBe("LessThanEqual");
        });

        test("equality", () => {
            const { statements } = parse("a == b;");

            expect(statements[0].expression.operator.type)
                .toBe("EqualEqual");
        });

        test("inequality", () => {
            const { statements } = parse("a != b;");

            expect(statements[0].expression.operator.type)
                .toBe("ExclamationMarkEqual");
        });

    });


    describe("logical expressions", () => {

        test("logical and", () => {
            const { statements } = parse("a and b;");

            expect(statements[0].expression).toMatchObject({
                type: "LogicalExpression",
                operator: {
                    type: "And",
                },
            });
        });

        test("logical or", () => {
            const { statements } = parse("a | b;");

            expect(statements[0].expression).toMatchObject({
                type: "LogicalExpression",
                operator: {
                    type: "Bar",
                },
            });
        });

    });


    describe("expression precedence", () => {

        test("multiplication binds tighter than addition", () => {
            const { statements } = parse("a + b * c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("Plus");
            expect(expression.right.operator.type).toBe("Asterisk");
        });

        test("addition binds tighter than comparison", () => {
            const { statements } = parse("a + b < c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("LessThan");
            expect(expression.left.operator.type).toBe("Plus");
        });

        test("comparison binds tighter than equality", () => {
            const { statements } = parse("a < b == c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("EqualEqual");
            expect(expression.left.operator.type).toBe("LessThan");
        });

        test("equality binds tighter than logical and", () => {
            const { statements } = parse("a == b and c;");

            const expression = statements[0].expression;

            expect(expression.type).toBe("LogicalExpression");
            expect(expression.left.operator.type).toBe("EqualEqual");
        });

        test("logical and binds tighter than logical or", () => {
            const { statements } = parse("a and b | c;");

            const expression = statements[0].expression;

            expect(expression.type).toBe("LogicalExpression");
            expect(expression.operator.type).toBe("Bar");
            expect(expression.left.operator.type).toBe("And");
        });

        test("grouping overrides precedence", () => {
            const { statements } = parse("(a + b) * c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("Asterisk");
            expect(expression.left.type).toBe("GroupingExpression");
            expect(expression.left.expression.operator.type).toBe("Plus");
        });

    });


    describe("assignment expressions", () => {

        test("assignment", () => {
            const { statements } = parse("x = 10;");

            expect(statements[0].expression).toMatchObject({
                type: "AssignmentExpression",
                left: {
                    type: "IdentifierExpression",
                    lexeme: "x",
                },
                right: {
                    type: "LiteralExpression",
                    value: 10,
                },
            });
        });

        test("assignment is right associative", () => {
            const { statements } = parse("a = b = c;");

            const expression = statements[0].expression;

            expect(expression).toMatchObject({
                type: "AssignmentExpression",
                left: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                right: {
                    type: "AssignmentExpression",
                    left: {
                        type: "IdentifierExpression",
                        lexeme: "b",
                    },
                    right: {
                        type: "IdentifierExpression",
                        lexeme: "c",
                    },
                },
            });
        });

    });


    describe("member expressions", () => {

        test("dot access", () => {
            const { statements } = parse("foo.bar;");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                object: {
                    type: "IdentifierExpression",
                    lexeme: "foo",
                },
                property: {
                    type: "LiteralExpression",
                    value: "bar",
                },
            });
        });

        test("bracket access", () => {
            const { statements } = parse("foo[bar];");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                object: {
                    type: "IdentifierExpression",
                    lexeme: "foo",
                },
                property: {
                    type: "IdentifierExpression",
                    lexeme: "bar",
                },
            });
        });

        test("chained member access", () => {
            const { statements } = parse("foo.bar.baz;");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                property: {
                    value: "baz",
                },
                object: {
                    type: "MemberExpression",
                    property: {
                        value: "bar",
                    },
                },
            });
        });

    });


    describe("call expressions", () => {

        test("call without arguments", () => {
            const { statements } = parse("foo();");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "IdentifierExpression",
                    lexeme: "foo",
                },
                arguments: [],
            });
        });

        test("call with arguments", () => {
            const { statements } = parse("foo(1, bar, 2 + 3);");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                arguments: [
                    {
                        type: "LiteralExpression",
                        value: 1,
                    },
                    {
                        type: "IdentifierExpression",
                        lexeme: "bar",
                    },
                    {
                        type: "BinaryExpression",
                    },
                ],
            });
        });

        test("chained calls", () => {
            const { statements } = parse("foo()();");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "CallExpression",
                },
            });
        });

        test("member call", () => {
            const { statements } = parse("foo.bar(1);");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                },
            });
        });

    });
});




describe("expression statements", () => {

    test("expression statement", () => {
        const { statements } = parse("42;");

        expect(statements[0]).toMatchObject({
            type: "ExpressionStatement",
            expression: {
                type: "LiteralExpression",
                value: 42,
            },
        });
    });

});


describe("if statements", () => {

    test("if statement", () => {
        const { statements } = parse(
            "if (condition) return 1;"
        );

        expect(statements[0]).toMatchObject({
            type: "IfStatement",
            condition: {
                type: "IdentifierExpression",
                lexeme: "condition",
            },
            thenBranch: {
                type: "ReturnStatement",
                expression: {
                    value: 1,
                },
            },
            elseBranch: undefined,
        });
    });

    test("if else statement", () => {
        const { statements } = parse(
            "if (condition) return 1; else return 2;"
        );

        expect(statements[0]).toMatchObject({
            type: "IfStatement",
            thenBranch: {
                type: "ReturnStatement",
                expression: {
                    value: 1,
                },
            },
            elseBranch: {
                type: "ReturnStatement",
                expression: {
                    value: 2,
                },
            },
        });
    });

});


describe("loop statements", () => {

    test("loop without header", () => {
        const { statements } = parse(
            "loop return 1;"
        );

        expect(statements[0]).toMatchObject({
            type: "LoopStatement",
            iterable: undefined,
            binding: undefined,
            body: {
                type: "ReturnStatement",
            },
        });
    });

    test("loop with iterable", () => {
        const { statements } = parse(
            "loop (items) return items;"
        );

        expect(statements[0]).toMatchObject({
            type: "LoopStatement",
            iterable: {
                type: "IdentifierExpression",
                lexeme: "items",
            },
            binding: undefined,
        });
    });

    test("loop with value binding", () => {
        const { statements } = parse(
            "loop (items with value) return value;"
        );

        expect(statements[0]).toMatchObject({
            type: "LoopStatement",
            binding: {
                index: undefined,
                value: {
                    type: "IdentifierExpression",
                    lexeme: "value",
                },
            },
        });
    });

    test("loop with index and value binding", () => {
        const { statements } = parse(
            "loop (items with [index, value]) return value;"
        );

        expect(statements[0]).toMatchObject({
            type: "LoopStatement",
            binding: {
                index: {
                    type: "IdentifierExpression",
                    lexeme: "index",
                },
                value: {
                    type: "IdentifierExpression",
                    lexeme: "value",
                },
            },
        });
    });

    test("loop with index-only binding", () => {
        const { statements } = parse(
            "loop (items with [index]) return index;"
        );

        expect(statements[0]).toMatchObject({
            type: "LoopStatement",
            binding: {
                index: {
                    type: "IdentifierExpression",
                    lexeme: "index",
                },
                value: undefined,
            },
        });
    });

});


describe("exit and skip statements", () => {

    test("exit", () => {
        const { statements } = parse("exit;");

        expect(statements[0]).toMatchObject({
            type: "ExitStatement",
        });
    });

    test("skip", () => {
        const { statements } = parse("skip;");

        expect(statements[0]).toMatchObject({
            type: "SkipStatement",
        });
    });

});


describe("return statements", () => {

    test("return without expression", () => {
        const { statements } = parse("return;");

        expect(statements[0]).toMatchObject({
            type: "ReturnStatement",
            expression: undefined,
        });
    });

    test("return with expression", () => {
        const { statements } = parse("return value;");

        expect(statements[0]).toMatchObject({
            type: "ReturnStatement",
            expression: {
                type: "IdentifierExpression",
                lexeme: "value",
            },
        });
    });

});


describe("block statements", () => {

    test("empty block", () => {
        const { statements } = parse("{}");

        expect(statements[0]).toMatchObject({
            type: "BlockStatement",
            body: [],
        });
    });

    test("block containing statements", () => {
        const { statements } = parse(`
            {
                var x = 1;
                return x;
            }
        `);

        expect(statements[0]).toMatchObject({
            type: "BlockStatement",
            body: [
                {
                    type: "VariableDeclaration",
                },
                {
                    type: "ReturnStatement",
                },
            ],
        });
    });

    test("nested blocks", () => {
        const { statements } = parse(`
            {
                {
                    return 1;
                }
            }
        `);

        expect(statements[0]).toMatchObject({
            type: "BlockStatement",
            body: [
                {
                    type: "BlockStatement",
                    body: [
                        {
                            type: "ReturnStatement",
                        },
                    ],
                },
            ],
        });
    });

});


/*=============================*/
/* Declarations                */
/*=============================*/

describe("variable declarations", () => {

    test("uninitialized variable", () => {
        const { statements } = parse("var x;");

        expect(statements[0]).toMatchObject({
            type: "VariableDeclaration",
            name: {
                type: "IdentifierExpression",
                lexeme: "x",
            },
            initialiser: undefined,
        });
    });

    test("initialized variable", () => {
        const { statements } = parse("var x = 42;");

        expect(statements[0]).toMatchObject({
            type: "VariableDeclaration",
            name: {
                type: "IdentifierExpression",
                lexeme: "x",
            },
            initialiser: {
                type: "LiteralExpression",
                value: 42,
            },
        });
    });

});


describe("constant declarations", () => {

    test("constant", () => {
        const { statements } = parse("const x = 42;");

        expect(statements[0]).toMatchObject({
            type: "ConstantDeclaration",
            name: {
                type: "IdentifierExpression",
                lexeme: "x",
            },
            initialiser: {
                type: "LiteralExpression",
                value: 42,
            },
        });
    });

});


describe("function declarations", () => {

    test("function without parameters", () => {
        const { statements } = parse(
            "func foo() return 42;"
        );

        expect(statements[0]).toMatchObject({
            type: "FunctionDeclaration",
            name: {
                type: "IdentifierExpression",
                lexeme: "foo",
            },
            parameters: [],
            body: {
                type: "ReturnStatement",
                expression: {
                    type: "LiteralExpression",
                    value: 42,
                },
            },
        });
    });

    test("function parameters", () => {
        const { statements } = parse(
            "func foo(a, b, c) return a;"
        );

        expect(statements[0]).toMatchObject({
            type: "FunctionDeclaration",
            parameters: [
                {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                {
                    type: "IdentifierExpression",
                    lexeme: "b",
                },
                {
                    type: "IdentifierExpression",
                    lexeme: "c",
                },
            ],
        });
    });

    test("function block body", () => {
        const { statements } = parse(`
            func foo(a) {
                var x = a;
                return x;
            }
        `);

        expect(statements[0]).toMatchObject({
            type: "FunctionDeclaration",
            name: {
                lexeme: "foo",
            },
            body: {
                type: "BlockStatement",
                body: [
                    {
                        type: "VariableDeclaration",
                    },
                    {
                        type: "ReturnStatement",
                    },
                ],
            },
        });
    });

});


describe("function expressions", () => {

    test("anonymous function", () => {
        const { statements } = parse(
            "func(x) x + 1;"
        );

        expect(statements[0]).toMatchObject({
            type: "ExpressionStatement",
            expression: {
                type: "FunctionExpression",
                name: undefined,
                parameters: [
                    {
                        type: "IdentifierExpression",
                        lexeme: "x",
                    },
                ],
                body: {
                    type: "ReturnStatement",
                },
            },
        });
    });

    test("named function expression", () => {
        const { statements } = parse(
            "func foo(x) x + 1;"
        );

        expect(statements[0].expression).toMatchObject({
            type: "FunctionExpression",
            name: {
                type: "IdentifierExpression",
                lexeme: "foo",
            },
        });
    });

    test("function expression with block body", () => {
        const { statements } = parse(`
            func(x) {
                return x;
            };
        `);

        expect(statements[0].expression).toMatchObject({
            type: "FunctionExpression",
            body: {
                type: "BlockStatement",
                body: [
                    {
                        type: "ReturnStatement",
                    },
                ],
            },
        });
    });

});


/*=============================*/
/* Errors                      */
/*=============================*/

describe("parser errors", () => {

    test("reports missing semicolon", () => {
        const { diagnostics } = parse("var x = 10");

        expect(diagnostics.length).toBeGreaterThan(0);
    });

    test("reports missing closing parenthesis", () => {
        const { diagnostics } = parse("(10;");

        expect(diagnostics.length).toBeGreaterThan(0);
    });

    test("reports missing closing square bracket", () => {
        const { diagnostics } = parse("[1, 2;");

        expect(diagnostics.length).toBeGreaterThan(0);
    });

    test("reports missing closing curly bracket", () => {
        const { diagnostics } = parse("{ var x = 1;");

        expect(diagnostics.length).toBeGreaterThan(0);
    });

    test("reports missing expression", () => {
        const { diagnostics } = parse("var x = ;");

        expect(diagnostics.length).toBeGreaterThan(0);
    });

    test("recovers after an invalid declaration", () => {
        const { statements, diagnostics } = parse(`
            var x = ;
            var y = 10;
        `);

        expect(diagnostics.length).toBeGreaterThan(0);

        expect(statements).toHaveLength(1);

        expect(statements[0]).toMatchObject({
            type: "VariableDeclaration",
            name: {
                lexeme: "y",
            },
            initialiser: {
                value: 10,
            },
        });
    });

});