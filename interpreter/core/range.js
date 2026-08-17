// @ts-check

/**
 * Computes the line and column for a character offset in the source.
 *
 * @param {string} source
 * @param {number} offset
 * @param {number} startingLine
 * @param {number} startingColumn
 * @returns {{ line: number, column: number }}
 */
function getLineAndColumn(source, offset, startingLine, startingColumn) {
    let line = startingLine;
    let column = startingColumn;

    for (let i = 0; i < offset; i++) {
        if (source[i] === "\n") {
            line++;
            column = startingColumn;
        } else {
            column++;
        }
    }

    return { line, column };
}

/**
 * Gets the start/end line and column for a token, for use in diagnostics
 * or editor integrations.
 *
 * @param {Interpreter} interpreter
 * @param {SourceSpan} node
 * @param {number} startingLine
 * @param {number} startingColumn
 * @returns {SourceRange}
 */
export function getRange(interpreter, node, startingLine, startingColumn) {
    const { line: startLine, column: startColumn } = getLineAndColumn(interpreter.source, node.start, startingLine, startingColumn);
    const { line: endLine, column: endColumn } = getLineAndColumn(interpreter.source, node.end, startingLine, startingColumn);

    return { startLine, startColumn, endLine, endColumn };
}