// @ts-check

/**
 * @type {number[] | undefined}
 */
let lineStarts;


/**
 * Computes the offsets where each line begins for a source string.
 *
 * Why doesn't it directly modify the `lineStarts` variable? Well, because typescript
 * is stupid and doesn't do Inter preocedural analysis and will need a silly `lineStarts !== undefined`
 * guard in `getLineAndColumn`.
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
 * @param {string} source
 * @param {number} offset
 * @param {number} startingLine
 * @param {number} startingColumn
 * @returns {{ line: number, column: number }}
 */
function getLineAndColumn(source, offset, startingLine, startingColumn) {
    if (lineStarts === undefined) {
        lineStarts = computeLineStarts(source);
    }

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

    const line = startingLine + low;
    const column = startingColumn + (offset - lineStarts[low]);

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