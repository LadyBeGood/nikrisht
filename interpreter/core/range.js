// @ts-check

/**
 * Computes the offsets where each line begins for a source string.
 *
 * @param {string} source
 * @returns {number[]}
 */
function computeLineStarts(source) {
    const starts = [0];

    for (let i = 0; i < source.length; i++) {
        if (source[i] === "\n") {
            starts.push(i + 1);
        }
    }

    return starts;
}

/**
 * Computes the line and column for a character offset, using a
 * precomputed table of line-start offsets (see computeLineStarts).
 *
 * @param {number[]} lineStarts
 * @param {number} offset
 * @returns {{ line: number, column: number }}
 */
function getLineAndColumn(lineStarts, offset) {
    let low = 0;
    let high = lineStarts.length - 1;

    while (low < high) {
        const mid = Math.floor((low + high + 1) / 2);

        if (lineStarts[mid] <= offset) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }

    const line = low + 1;
    const column = (offset - lineStarts[low]) + 1;

    return { line, column };
}

/**
 * Gets the start/end line and column for a token, for use in diagnostics
 * or editor integrations.
 *
 * @param {Interpreter} interpreter
 * @param {SourceSpan} node
 * @returns {SourceRange}
 */
export function getRange(interpreter, node) {
    // Compute (or reuse an interpreter-scoped cache) per-source, never module-scoped
    if (interpreter.lineStarts === undefined) {
        interpreter.lineStarts = computeLineStarts(interpreter.source);
    }

    const { line: startLine, column: startColumn } = getLineAndColumn(interpreter.lineStarts, node.start);
    const { line: endLine, column: endColumn } = getLineAndColumn(interpreter.lineStarts, node.end);

    return { startLine, startColumn, endLine, endColumn };
}