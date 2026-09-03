// Bun imports
import { test, expect, describe } from "bun:test";

// Local imports
import { createInterpreter } from "../interpreter/interpreter.js";
import { createLexer, lex } from "../interpreter/phases/lexer.js";
import { createParser, parse as parseTokens } from "../interpreter/phases/parser.js";


function parse(source) {
    const interpreter = createInterpreter(source);
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
                starting: {
                    type: "LiteralExpression",
                    value: 1,
                },
                ending: {
                    type: "LiteralExpression",
                    value: 10,
                },
                gap: undefined,
                operator: {
                    type: "DotDot",
                },
            });
        });

        test("Exclusive upper range", () => {
            const { statements } = parse("1..<10;");

            expect(statements[0].expression).toMatchObject({
                type: "RangeExpression",
                starting: {
                    type: "LiteralExpression",
                    value: 1,
                },
                ending: {
                    type: "LiteralExpression",
                    value: 10,
                },
                gap: undefined,
                operator: {
                    type: "DotDotLessThan",
                },
            });
        });

        test("Exclusive lower range", () => {
            const { statements } = parse("10..>1;");

            expect(statements[0].expression).toMatchObject({
                type: "RangeExpression",
                starting: {
                    type: "LiteralExpression",
                    value: 10,
                },
                ending: {
                    type: "LiteralExpression",
                    value: 1,
                },
                gap: undefined,
                operator: {
                    type: "DotDotMoreThan",
                },
            });
        });

    });


    describe("Binary", () => {

        test("Multiplication", () => {
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

        test("Division", () => {
            const { statements } = parse("a / b;");

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
                    type: "Slash",
                },
            });
        });

        test("Addition", () => {
            const { statements } = parse("a + b;");

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
                    type: "Plus",
                },
            });
        });

        test("Subtraction", () => {
            const { statements } = parse("a - b;");

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
                    type: "Minus",
                },
            });
        });

        test("More than", () => {
            const { statements } = parse("a > b;");

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
                    type: "MoreThan",
                },
            });
        });

        test("More than equal", () => {
            const { statements } = parse("a >= b;");

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
                    type: "MoreThanEqual",
                },
            });
        });

        test("Less than", () => {
            const { statements } = parse("a < b;");

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
                    type: "LessThan",
                },
            });
        });

        test("Less than equal", () => {
            const { statements } = parse("a <= b;");

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
                    type: "LessThanEqual",
                },
            });
        });


        test("Equal", () => {
            const { statements } = parse("a == b;");
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
                    type: "EqualEqual",
                },
            });
        });

        test("Not equal", () => {
            const { statements } = parse("a != b;");
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
                    type: "ExclamationMarkEqual",
                },
            });
        });

    });


    describe("Logical", () => {

        test("And", () => {
            const { statements } = parse("a & b;");

            expect(statements[0].expression).toMatchObject({
                type: "LogicalExpression",
                left: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                right: {
                    type: "IdentifierExpression",
                    lexeme: "b",
                },
                operator: {
                    type: "And",
                },
            });
        });

        test("Or", () => {
            const { statements } = parse("a | b;");

            expect(statements[0].expression).toMatchObject({
                type: "LogicalExpression",
                left: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                right: {
                    type: "IdentifierExpression",
                    lexeme: "b",
                },
                operator: {
                    type: "Bar",
                },
            });
        });

    });


    describe("Precedence", () => {

        test("Multiplication binds tighter than addition", () => {
            const { statements } = parse("a + b * c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("Plus");
            expect(expression.right.operator.type).toBe("Asterisk");
        });

        test("Addition binds tighter than comparison", () => {
            const { statements } = parse("a + b < c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("LessThan");
            expect(expression.left.operator.type).toBe("Plus");
        });

        test("Comparison binds tighter than equality", () => {
            const { statements } = parse("a < b == c;");

            const expression = statements[0].expression;
            expect(expression.operator.type).toBe("EqualEqual");
            expect(expression.left.operator.type).toBe("LessThan");
        });

        test("Equality binds tighter than logical and", () => {
            const { statements } = parse("a == b & c;");

            const expression = statements[0].expression;

            expect(expression.type).toBe("LogicalExpression");
            expect(expression.left.operator.type).toBe("EqualEqual");
        });

        test("Logical and binds tighter than logical or", () => {
            const { statements } = parse("a & b | c;");

            const expression = statements[0].expression;

            expect(expression.type).toBe("LogicalExpression");
            expect(expression.operator.type).toBe("Bar");
            expect(expression.left.operator.type).toBe("And");
        });

        test("Grouping overrides precedence", () => {
            const { statements } = parse("(a + b) * c;");

            const expression = statements[0].expression;

            expect(expression.operator.type).toBe("Asterisk");
            expect(expression.left.type).toBe("GroupingExpression");
            expect(expression.left.expression.operator.type).toBe("Plus");
        });

    });


    describe("Assignment", () => {

        test("Identifier", () => {
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

        test("Right associativity", () => {
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


    describe("Member", () => {

        test("Dot", () => {
            const { statements } = parse("a.b;");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                object: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                property: {
                    type: "LiteralExpression",
                    value: "b",
                },
            });
        });

        test("Square bracket", () => {
            const { statements } = parse("a[b];");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                object: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                property: {
                    type: "IdentifierExpression",
                    lexeme: "b",
                },
            });
        });

        test("Chained", () => {
            const { statements } = parse("a.b.c;");

            expect(statements[0].expression).toMatchObject({
                type: "MemberExpression",
                property: {
                    value: "c",
                },
                object: {
                    type: "MemberExpression",
                    property: {
                        value: "b",
                    },
                },
            });
        });

    });


    describe("Call", () => {

        test("No arguments", () => {
            const { statements } = parse("a();");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                arguments: [],
            });
        });

        test("call with arguments", () => {
            const { statements } = parse("a(1, b, 2 + 3);");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "IdentifierExpression",
                    lexeme: "a",
                },
                arguments: [
                    {
                        type: "LiteralExpression",
                        value: 1,
                    },
                    {
                        type: "IdentifierExpression",
                        lexeme: "b",
                    },
                    {
                        type: "BinaryExpression",
                    },
                ],
            });
        });

        test("Curried", () => {
            const { statements } = parse("a()();");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "CallExpression",
                },
            });
        });

        test("Member call", () => {
            const { statements } = parse("foo.bar(1);");

            expect(statements[0].expression).toMatchObject({
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                },
            });
        });

    });



    describe("Functions", () => {

        test("Anonymous", () => {
            const { statements } = parse(
                "(func(x = 2) x + 1);"
            );

            expect(statements[0]).toMatchObject({
                type: "ExpressionStatement",
                expression: {
                    type: "GroupingExpression",
                    expression: {
                        type: "FunctionExpression",
                        name: undefined,
                        parameters: [
                            {
                                name: {
                                    type: "IdentifierExpression",
                                    lexeme: "x",
                                },
                                defaultValue: {
                                    type: "LiteralExpression",
                                    value: 2
                                }
                            },
                        ],
                        body: {
                            type: "ReturnStatement",
                        },
                    }
                },
            });
        });

        test("Named", () => {
            const { statements } = parse(
                "(func a() 1);"
            );

            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "FunctionExpression",
                    name: {
                        type: "IdentifierExpression",
                        lexeme: "a",
                    },
                    body: {
                        type: "ReturnStatement",
                    },
                }
            });
        });

        test("Block body", () => {
            const { statements } = parse(`
            (func(x) {
                return x;
            });
        `);

            expect(statements[0].expression).toMatchObject({
                type: "GroupingExpression",
                expression: {
                    type: "FunctionExpression",
                    body: {
                        type: "BlockStatement",
                        body: [
                            {
                                type: "ReturnStatement",
                            },
                        ],
                    },
                }
            });
        });

    });
});


describe("Statement", () => {

    test("Expression statement", () => {
        const { statements } = parse("42;");

        expect(statements[0]).toMatchObject({
            type: "ExpressionStatement",
            expression: {
                type: "LiteralExpression",
                value: 42,
            },
        });
    });



    describe("Conditionals", () => {

        test("If", () => {
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

        test("If else", () => {
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


    describe("Loops", () => {

        test("No header", () => {
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

        test("Iterable", () => {
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

        test("Value binding", () => {
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

        test("Index and value binding", () => {
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

        test("Index binding", () => {
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


    describe("Exit and skip", () => {

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


    describe("Return", () => {

        test("Without expression", () => {
            const { statements } = parse("return;");

            expect(statements[0]).toMatchObject({
                type: "ReturnStatement",
                expression: undefined,
            });
        });

        test("With expression", () => {
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


    describe("Block statements", () => {

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

        test("Nested blocks", () => {
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

    describe("Variable declarations", () => {

        test("Uninitialized variable", () => {
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

        test("Initialized variable", () => {
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


    test("Constant declarations", () => {
        const { statements } = parse("const a = 42;");

        expect(statements[0]).toMatchObject({
            type: "ConstantDeclaration",
            name: {
                type: "IdentifierExpression",
                lexeme: "a",
            },
            initialiser: {
                type: "LiteralExpression",
                value: 42,
            },
        });
    });


    describe("Function declarations", () => {

        test("Without parameters, without block", () => {
            const { statements } = parse("func a() 42;");

            expect(statements[0]).toMatchObject({
                type: "FunctionDeclaration",
                name: {
                    type: "IdentifierExpression",
                    lexeme: "a",
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

        test("With parameters, without block", () => {
            const { statements } = parse(
                "func foo(a, b = a * 2, c) 42;"
            );

            expect(statements[0]).toMatchObject({
                type: "FunctionDeclaration",
                parameters: [
                    {
                        name: {
                            type: "IdentifierExpression",
                            lexeme: "a",
                        },
                        defaultValue: undefined
                    },
                    {
                        name: {
                            type: "IdentifierExpression",
                            lexeme: "b",
                        },
                        defaultValue: {
                            type: "BinaryExpression",
                            left: {
                                type: "IdentifierExpression",
                                lexeme: "a",
                            },
                            right: {
                                type: "LiteralExpression",
                                value: 2
                            }
                        }
                    },
                    {
                        name: {
                            type: "IdentifierExpression",
                            lexeme: "c",
                        },
                        defaultValue: undefined
                    },
                ],
                body: {
                    type: "ReturnStatement",
                    expression: {
                        type: "LiteralExpression",
                        value: 42,
                    },
                },
            });
        });

        test("With block", () => {
            const { statements } = parse(`
            func a(b) {
                var c = b;
                return c;
            }
        `);

            expect(statements[0]).toMatchObject({
                type: "FunctionDeclaration",
                name: {
                    lexeme: "a",
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

});
