// @ts-check

import "../types.js";
import { getLexeme, getLiteral } from "../core/token.js";
import { ImplementationError, ParsingError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";

/**
 * Creates a new parser state.
 * 
 * @param {Interpreter} interpreter Shared interpreter state.
 * @returns {Parser}
 */
export function createParser(interpreter) {
    return {
        interpreter,
        current: 0,
    }
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @param {number} position 
 * @returns {Token}
 */
function peekAtOffset(parser, position) {
    return parser.interpreter.tokens[parser.current + position];
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Token}
 */
function peek(parser) {
    return peekAtOffset(parser, 0);
}

/**
 * Checks whether the token at the given offset from the parser's current position matches any of the expected token types.
 * 
 * Positive offsets look ahead, negative offsets look behind, and `0` checks the current token.
 * 
 * This function does not consume any tokens.
 * 
 * @param {Parser} parser Parser state. 
 * @param {number} offset Offset from the current token. Can be positive, negative, or `0`.
 * @param  {...TokenType} expected Expected token types.
 * @returns {boolean} `true` if the token at the specified offset matches one of the expected types, otherwise `false`.
 */
function checkAtOffset(parser, offset, ...expected) {
    for (const type of expected) {
        if (peekAtOffset(parser, offset).type === type) {
            return true;
        }
    }

    return false;
}

/**
 * Checks whether the token at the parser's current position matches any of the expected token types.
 * 
 * This function does not consume the token.
 * 
 * @param {Parser} parser Parser state.
 * @param  {...TokenType} expected Expected types.
 * @returns {boolean} `true` if the current token matches one of the expected token types, otherwise `false`.
 */
function check(parser, ...expected) {
    return checkAtOffset(parser, 0, ...expected)
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {boolean}
 */
function isAtEnd(parser) {
    return check(parser, "EndOfFile");
}



/**
 * 
 * @param {Parser} parser Parser state. 
 * @param {TokenType} [type] 
 * @param {string} [message] 
 * @returns {Token}
 */
function consume(parser, type, message) {
    if (arguments.length !== 1 && arguments.length !== 3) {
        throw new ImplementationError("consume() expects either 1 or 3 arguments.");
    }

    if (type && message) {
        if (!check(parser, type)) {
            error(parser.interpreter, peek(parser), message, "parser");
        }
    }

    return parser.interpreter.tokens[parser.current++];
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @param  {...TokenType} expected 
 * @returns {boolean}
 */
function match(parser, ...expected) {
    for (const type of expected) {
        if (check(parser, type)) {
            consume(parser)
            return true
        }
    }

    return false
}

/**
 * 
 * @param {Parser} parser 
 * @returns 
 */
function synchronize(parser) {
    parser.current++;

    while (!isAtEnd(parser)) {
        const tokenType = peek(parser).type;

        if (tokenType === "Semicolon") {
            consume(parser);
            return;
        }

        switch (tokenType) {
            case "Func":
            case "Var":
            case "Const":
            case "Loop":
            case "Exit":
            case "Skip":
            case "If":
            case "Return":
                return;
        }

        consume(parser);
    }
}

/**
 * 
 * @param {Parser} parser 
 * @param {string} [message] 
 * @returns {IdentifierExpression}
 */
function parseIdentifierExpression(parser, message = "Expected Identifier") {
    const token = consume(parser, "Identifier", message);
    return { type: "IdentifierExpression", lexeme: getLexeme(parser.interpreter, token), start: token.start, end: token.end };
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parsePrimaryExpression(parser) {
    if (check(parser, "False")) {
        const token = consume(parser);
        return { type: "LiteralExpression", value: false, start: token.start, end: token.end };
    }
    else if (check(parser, "True")) {
        const token = consume(parser);
        return { type: "LiteralExpression", value: true, start: token.start, end: token.end };
    }
    else if (check(parser, "Null")) {
        const token = consume(parser);
        return { type: "LiteralExpression", value: null, start: token.start, end: token.end };
    }
    else if (check(parser, "NumericLiteral", "StringLiteral")) {
        const token = consume(parser);
        return { type: "LiteralExpression", value: getLiteral(parser.interpreter, token), start: token.start, end: token.end };
    }
    else if (check(parser, "Identifier")) {
        return parseIdentifierExpression(parser);
    }
    else if (check(parser, "LeftRoundBracket")) {
        const start = consume(parser).start;
        const expression = parseExpression(parser);
        const end = consume(parser, "RightRoundBracket", "Expected ')' after expression").end;
        return { type: "GroupingExpression", expression, start, end }
    }
    else if (check(parser, "LeftSquareBracket")) {
        const start = consume(parser).start;
        const elements = [];

        if (!check(parser, "RightSquareBracket")) {
            do {
                elements.push(parseExpression(parser));
            } while (match(parser, "Comma") && !check(parser, "RightSquareBracket"));
        }

        const end = consume(parser, "RightSquareBracket", "Expected ']' after array literal.").end;

        return { type: "ArrayExpression", elements, start, end };
    }
    else if (check(parser, "LeftCurlyBracket")) {
        const start = consume(parser).start;

        const keys = [];
        const values = [];

        if (!check(parser, "RightCurlyBracket")) {
            do {
                keys.push(parseExpression(parser));

                consume(parser, "Colon", "Expected ':' between key and value in object literal.");

                values.push(parseExpression(parser));
            } while (match(parser, "Comma") && !check(parser, "RightCurlyBracket"));
        }

        const end = consume(parser, "RightCurlyBracket", "Expected '}' after object literal.").end;

        return { type: "ObjectExpression", keys, values, start, end };
    }
    else if (check(parser, "Func")) {
        const start = consume(parser).start;
        let name;
        if (check(parser, "Identifier")) {
            name = (parseIdentifierExpression(parser));
        }

        consume(parser, "LeftRoundBracket", "Expected '(' after 'func'.");

        const parameters = [];

        if (!check(parser, "RightRoundBracket")) {
            do {
                parameters.push(parseIdentifierExpression(parser, "Expected parameter name."));
            } while (match(parser, "Comma") && !check(parser, "RightRoundBracket"));
        }

        consume(parser, "RightRoundBracket", "Expected ')' after parameters.");

        let body;

        if (check(parser, "LeftCurlyBracket")) {
            body = parseBlockStatement(parser);
        } else {
            const expression = parseExpression(parser);
            /** @type {ReturnStatement} */
            body = ({ type: "ReturnStatement", expression, start: expression.start, end: expression.end });
        }

        return { type: "FunctionExpression", name, parameters, body, start, end: body.end };
    }
    else {
        error(
            parser.interpreter,
            peek(parser),
            check(parser, "EndOfFile")
                ? "Expected an expression but reached end of code"
                : "Expected an expression but got " + peek(parser).type,
            "parser"
        );
    }
}


/**
 * 
 * @param {Parser} parser 
 * @param {Expression} object 
 * @returns {Expression}
 */
function parseMemberExpression(parser, object) {
    let property;
    let end;

    if (match(parser, "LeftSquareBracket")) {
        property = parseExpression(parser);
        end = consume(parser, "RightSquareBracket", "Expected ']' after index.").end;
    } else {
        consume(parser, "Dot");
        const identifier = consume(parser, "Identifier");
        end = identifier.end;
        /** @type {LiteralExpression} */
        property = ({ type: "LiteralExpression", value: getLexeme(parser.interpreter, identifier), start: identifier.start, end: identifier.end });
    }

    return { type: "MemberExpression", object, property, start: object.start, end };
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @param {Expression} callee 
 * @returns {Expression}
 */
function parseCallExpression(parser, callee) {
    const args = [];

    if (!check(parser, "RightRoundBracket")) {
        do {
            args.push(parseExpression(parser));
        } while (match(parser, "Comma"));
    }

    const end = consume(parser, "RightRoundBracket", "Expected ')' after arguments").end;

    return { type: "CallExpression", callee, arguments: args, start: callee.start, end };
}


/**
 * 
 * @param {Parser} parser 
 * @returns 
 */
function parsePostfixExpression(parser) {
    let expression = parsePrimaryExpression(parser);

    while (true) {
        if (match(parser, "LeftRoundBracket")) {
            expression = parseCallExpression(parser, expression);
        } else if (check(parser, "LeftSquareBracket", "Dot")) {
            expression = parseMemberExpression(parser, expression);
        } else {
            break;
        }
    }

    return expression;
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseUnaryExpression(parser) {
    if (check(parser, "ExclamationMark", "Minus")) {
        const operator = consume(parser);
        const argument = parseUnaryExpression(parser);
        return { type: "UnaryExpression", argument, operator, start: operator.start, end: argument.end };
    }

    return parsePostfixExpression(parser);
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseRangeExpression(parser) {
    const expression = parseUnaryExpression(parser);

    if (check(parser, "DotDot", "DotDotLessThan", "DotDotMoreThan")) {
        const operator = consume(parser);
        const right = parseUnaryExpression(parser);

        return { type: "RangeExpression", left: expression, operator, right, start: expression.start, end: right.end };
    }

    return expression;
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseMultiplicationAndDivisionExpression(parser) {
    let expression = parseRangeExpression(parser);

    while (check(parser, "Slash", "Asterisk")) {
        const operator = consume(parser);
        const right = parseRangeExpression(parser);

        expression = { type: "BinaryExpression", left: expression, right, operator, start: expression.start, end: right.end };
    }

    return expression;
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseAdditionAndSubstractionExpression(parser) {
    let expression = parseMultiplicationAndDivisionExpression(parser);

    while (check(parser, "Minus", "Plus")) {
        const operator = consume(parser);
        const right = parseMultiplicationAndDivisionExpression(parser);

        expression = { type: "BinaryExpression", left: expression, right, operator, start: expression.start, end: right.end };
    }

    return expression;
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseComparisonExpression(parser) {
    let expression = parseAdditionAndSubstractionExpression(parser);

    while (check(parser, "MoreThan", "MoreThanEqual", "LessThan", "LessThanEqual")) {
        const operator = consume(parser);
        const right = parseAdditionAndSubstractionExpression(parser);

        expression = { type: "BinaryExpression", left: expression, right, operator, start: expression.start, end: right.end };
    }

    return expression;
}

/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseEqualityAndInequalityExpression(parser) {
    let expression = parseComparisonExpression(parser);

    while (check(parser, "ExclamationMarkEqual", "EqualEqual")) {
        const operator = consume(parser);
        const right = parseComparisonExpression(parser);

        expression = { type: "BinaryExpression", left: expression, right, operator, start: expression.start, end: right.end };
    }

    return expression;
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseLogicalAndExpression(parser) {
    let expression = parseEqualityAndInequalityExpression(parser);

    while (check(parser, "And")) {
        const operator = consume(parser);
        const right = parseEqualityAndInequalityExpression(parser);

        expression = { type: "LogicalExpression", left: expression, right, operator, start: expression.start, end: right.end };
    }

    return expression;
}


/**
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseLogicalOrExpression(parser) {
    let expression = parseLogicalAndExpression(parser)

    while (check(parser, "Bar")) {
        const operator = consume(parser);
        const right = parseLogicalAndExpression(parser);

        expression = { type: "LogicalExpression", left: expression, right: right, operator, start: expression.start, end: right.end };
    }

    return expression
}


/**
 * Parses an assignment expression.
 * 
 * ```ebnf
 * 
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseAssignmentExpression(parser) {
    const expression = parseLogicalOrExpression(parser)

    if (check(parser, "Equal")) {
        const right = parseAssignmentExpression(parser);
        return { type: "AssignmentExpression", left: expression, right, start: expression.start, end: right.end };
    }

    return expression
}


/**
 * Parses an expression.
 * 
 * ```ebnf
 * expression = assignment
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Expression}
 */
function parseExpression(parser) {
    return parseAssignmentExpression(parser);
}


/**
 * Parses an expression statement.
 * 
 * ```ebnf
 * expression-statement = expression ";"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `ExpressionStatement`
 */
function parseExpressionStatement(parser) {
    const expression = parseExpression(parser);
    const end = consume(parser, "Semicolon", "Expected ';' after statement.").end;
    return { type: "ExpressionStatement", expression, start: expression.start, end };
}



/**
 * Parses an if statement.
 * 
 * ```ebnf
 * if-statement = "if" "(" expression ")" statement ( "else" statement )?
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `IfStatement`
 */
function parseIfStatement(parser) {
    const start = consume(parser).start;

    consume(parser, "LeftRoundBracket", "Expected '(' after 'if'");

    const condition = parseExpression(parser);

    consume(parser, "RightRoundBracket", "Expected ')' after if condition");

    const thenBranch = parseStatement(parser);

    let elseBranch;
    if (match(parser, "Else")) {
        elseBranch = parseStatement(parser);
    }

    const end = elseBranch?.end ?? thenBranch.end;

    return { type: "IfStatement", condition, thenBranch, elseBranch, start, end };
}


/**
 * Parses a binding. Helper function for parsing a loop statement.
 * 
 * ```ebnf
 * binding = 
 *     | Identifier
 *     | "[" Identifier ( "," Identifier )? "]"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Binding}
 */
function parseBinding(parser) {
    let index;
    let value;

    let start;
    let end;

    // with i
    if (check(parser, "Identifier")) {
        value = parseIdentifierExpression(parser);
        start = value.start;
        end = value.end;
    } else {
        // with [i, value]
        start = consume(parser, "LeftSquareBracket", "Expected '[' after 'with'").start;

        index = parseIdentifierExpression(parser, "Expected index variable name");

        if (match(parser, "Comma")) {
            value = parseIdentifierExpression(parser, "Expected value variable name");
        }

        end = consume(parser, "RightSquareBracket", "Expected ']' after loop variables").end;
    }

    return { type: "Binding", index, value, start, end };
}

/**
 * Parses a loop statement.
 * 
 * ```ebnf
 * loop-statement = "loop" ( "(" expression ( "with" binding )? ")" )? statement
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `LoopStatement`
 */
function parseLoopStatement(parser) {
    const start = consume(parser).start;

    let iterable;
    let binding;

    // loop (...)
    if (match(parser, "LeftRoundBracket")) {
        iterable = parseExpression(parser);

        if (match(parser, "With")) {
            binding = parseBinding(parser);
        }

        consume(parser, "RightRoundBracket", "Expected ')' after loop header");
    }

    const body = parseStatement(parser);

    return { type: "LoopStatement", iterable, binding, body, start, end: body.end };
}

/**
 * Parses an exit or a skip statement.
 * 
 * ```ebnf
 * exit-statement = "exit" ";"
 * skip-statement = "skip" ";"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `ExitStatement` or `SkipStatement`
 */
function parseExitOrSkipStatement(parser) {
    const isExit = check(parser, "Exit");
    const start = consume(parser).start;

    const end = consume(parser, "Semicolon", "Expected ';' after statement.").end;

    return { type: isExit ? "ExitStatement" : "SkipStatement", start, end };
}


/**
 * Parses a return statement.
 * 
 * ```ebnf
 *  return-statement = "return" expression? ";"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `ReturnStatement`
 */
function parseReturnStatement(parser) {
    const start = consume(parser).start;

    let expression;
    if (!check(parser, "Semicolon")) {
        expression = parseExpression(parser);
    }
    const end = consume(parser, "Semicolon", "Expected ';' after statement.").end;

    return { type: "ReturnStatement", expression, start, end }
}


/**
 * Parses a block statement.
 * 
 * ```ebnf
 * block-statement = "{" declarations* "}"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `BlockStatement`.
 */
function parseBlockStatement(parser) {
    const start = consume(parser, "LeftCurlyBracket", "Expected '{'").start;

    const statements = [];

    while (!check(parser, "RightCurlyBracket") && !isAtEnd(parser)) {
        statements.push(parseDeclaration(parser));
    }

    const end = consume(parser, "RightCurlyBracket", "Expected '}' after block").end;

    return { type: "BlockStatement", body: statements, start, end };
}



/**
 * Parses a statement.
 * 
 * ```ebnf
 * statement = 
 *     | if-statement
 *     | loop-statement
 *     | exit-statement
 *     | skip-statement
 *     | return-statement
 *     | block-statement
 *     | expression-statement
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement}
 */
function parseStatement(parser) {
    if (check(parser, "If")) {
        return parseIfStatement(parser)
    }

    else if (check(parser, "Loop")) {
        return parseLoopStatement(parser)
    }

    else if (check(parser, "Exit", "Skip")) {
        return parseExitOrSkipStatement(parser)
    }

    else if (check(parser, "Return")) {
        return parseReturnStatement(parser)
    }

    else if (check(parser, "LeftCurlyBracket")) {
        return parseBlockStatement(parser)
    }

    else {
        return parseExpressionStatement(parser);
    }
}



/**
 * Parses a variable declaration.
 * 
 * ```ebnf
 * variable-declaration = "var" Identifier ( "=" expression )? ";"
 * ```
 * 
 * @param {Parser} parser Parser state.
 * @returns {Statement} `VariableDeclaration`.
 */
function parseVariableDeclaration(parser) {
    const start = consume(parser).start;
    const name = parseIdentifierExpression(parser, "Expected variable name.");
    let initialiser;

    if (match(parser, "Equal")) initialiser = parseExpression(parser);

    const end = consume(parser, "Semicolon", "Expected ';' after variable declaration.").end;

    return { type: "VariableDeclaration", name, initialiser, start, end };
}

/**
 * Parses a constant declaration.
 * 
 * ```ebnf
 * constant-declaration = "const" Identifier "=" expression ";"
 * ```
 * 
 * @param {Parser} parser Parser state.
 * @returns {Statement} `ConstantDeclaration`.
 */
function parseConstantDeclaration(parser) {
    const start = consume(parser).start;
    const name = parseIdentifierExpression(parser, "Expected constant name.");

    consume(parser, "Equal", "Constants must be initialised.");

    const initialiser = parseExpression(parser);

    const end = consume(parser, "Semicolon", "Expected ';' after constant declaration.").end;

    return { type: "ConstantDeclaration", name, initialiser, start, end };
}


/**
 * Parses a function declaration.
 * 
 * ```ebnf
 * function-declaration = "func" Identifier "(" ( Identifier ( "," Identifier )* )? ")" block ";"
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement} `FunctionDeclaration`.
 */
function parseFunctionDeclaration(parser) {
    const start = consume(parser).start;
    const name = parseIdentifierExpression(parser, "Expected function name.");

    consume(parser, "LeftRoundBracket", "Expected '(' after function name");

    const parameters = [];
    if (!check(parser, "RightRoundBracket")) {
        do {
            parameters.push(parseIdentifierExpression(parser, "Expected parameter name."));
        } while (match(parser, "Comma"));
    }

    consume(parser, "RightRoundBracket", "Expected ')' after parameters");

    let body;

    if (check(parser, "LeftCurlyBracket")) {
        body = parseBlockStatement(parser);
    } else {
        const expression = parseExpression(parser);
        /** @type {ReturnStatement} */
        body = ({ type: "ReturnStatement", expression, start: expression.start, end: expression.end });
    }

    return { type: "FunctionDeclaration", name, parameters, body, start, end: body.end };
}


/**
 * Parses a declaration.
 * 
 * ```ebnf
 * declaration = 
 *     | variable-declaration
 *     | constant-declaration
 *     | function-declaration
 *     | statement 
 * ```
 * 
 * @param {Parser} parser Parser state. 
 * @returns {Statement}
 */
function parseDeclaration(parser) {
    if (check(parser, "Var")) {
        return parseVariableDeclaration(parser);
    } 
    
    else if (check(parser, "Const")) {
        return parseConstantDeclaration(parser);
    } 
    
    else if (check(parser, "Func")) {
        return parseFunctionDeclaration(parser);
    } 
    
    else {
        return parseStatement(parser);
    }
}



/**
 * Parses the tokens inside `parser` and converts it into an array of statements. 
 * 
 * ```ebnf
 * program = declaration* EndOfFile
 * ```
 * 
 * @param {Parser} parser Parser state.
 */
export function parse(parser) {
    while (!isAtEnd(parser)) {
        try {
            parser.interpreter.statements.push(parseDeclaration(parser));
        } catch (error) {
            if (error instanceof ParsingError) {
                synchronize(parser);
                continue;
            }

            throw error;
        }
    }
}