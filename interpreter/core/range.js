// @ts-check

/**
 * Computes the line and column for a character offset in the source.
 *
 * @param {string} source
 * @param {number} offset
 * @param {number} [base=1] Line/column numbering base — use 1 for
 *   diagnostics/CLI output, 0 for editors like Ace that expect 0-based
 *   rows/columns.
 * @returns {{ line: number, column: number }}
 */
function getLineAndColumn(source, offset, base = 1) {
    let line = base;
    let column = base;

    for (let i = 0; i < offset; i++) {
        if (source[i] === "\n") {
            line++;
            column = base;
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
 * @param {Token | Statement} node
 * @param {number} [startingLine] 
 * @param {number} [startingColumn] 
 * @returns {SourceRange}
 */
export function getRange(interpreter, node, startingLine = 1, startingColumn = 0) {
    const { line: startLine, column: startColumn } = getLineAndColumn(interpreter.source, node.start, base);
    const { line: endLine, column: endColumn } = getLineAndColumn(interpreter.source, node.end, base);

    return { startLine, startColumn, endLine, endColumn };
}