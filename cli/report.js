// @ts-check

import "../interpreter/types.js";

const TAB_WIDTH = 4;

/**
 * @type {Record<Diagnostic["type"], {label: string, color: CurrentlyRequiredColors}>}
 */
const SEVERITY_STYLE = {
    error: { label: "Error", color: "red" },
    warning: { label: "Warning", color: "yellow" },
};

/**
 * Expands tabs to a fixed width so caret alignment stays correct
 * regardless of the terminal's own tab-stop settings.
 * 
 * @param {string} line
 * @returns {string}
 */
function expandTabs(line) {
    return line.replace(/\t/g, " ".repeat(TAB_WIDTH));
}

/**
 * Converts a raw column (counted against the original, un-expanded line)
 * into the column it lands on after tabs have been expanded.
 * 
 * @param {string} rawLine
 * @param {number} rawColumn 1-based column in the raw (un-expanded) line.
 * @returns {number} 1-based column in the tab-expanded line.
 */
function toExpandedColumn(rawLine, rawColumn) {
    let expanded = 1;
    for (let i = 0; i < rawColumn - 1 && i < rawLine.length; i++) {
        expanded += rawLine[i] === "\t" ? TAB_WIDTH : 1;
    }
    return expanded;
}

/**
 * Formats an interpreter diagnostic into a CLI-friendly code snippet 
 * with line-number gutters and severity-colored caret (`^`) range underlines.
 *
 * Coordinates are 1-based. `endColumn` is exclusive (1 character past the span end).
 * Tab characters in `source` are automatically expanded to align carets correctly.
 *
 * @example
 * Single-line output:
 * ```txt
 * Warning: Constant "number" is declared but never used.
 *   |
 * 4 | const number = 20;
 *   |       ^^^^^^
 * C:\Users\HandsomeMan\project\input.nki:4:7
 * ```
 * 
 * @example
 * Multi-line output (interior lines underlined in full width):
 * ```txt
 * Error: Function "sort" expects an array, but got "string"
 *    |
 *  8 | sort("
 *    |      ^^
 *  9 | Hello
 *    | ^^^^^^
 * 10 | World
 *    | ^^^^^^
 * 11 | ");
 *    | ^
 * C:\Users\HandsomeMan\project\input.nki:8:6
 *```
 * @param {Diagnostic} diagnostic
 * @param {string} source Full original source text.
 * @param {string} filePath Path to display in the header line.
 * @param {Interpreter["host"]["colors"]} colors 
 * @param {Interpreter["host"]["escape"]} escape
 * @returns {string}
 */
export function formatDiagnostic(diagnostic, source, filePath, colors, escape) {
    const style = SEVERITY_STYLE[diagnostic.type];
    const severityColor = style.color;

    const sourceLines = source.split("\n");
    const gutterWidth = String(diagnostic.endLine).length;
    const gutter = " ".repeat(gutterWidth) + " " + colors.dim("|");

    const header = colors.bold(colors[severityColor](`${style.label}:`)) + " " + colors.bold(diagnostic.message);
    const footer = createSourceLink(filePath, diagnostic.startLine, diagnostic.startColumn, colors);

    const linesOut = [header, gutter];

    for (let lineNumber = diagnostic.startLine; lineNumber <= diagnostic.endLine; lineNumber++) {
        const rawLine = sourceLines[lineNumber - 1] ?? "";
        const expandedLine = expandTabs(rawLine);
        const escapedLine = escape(expandedLine);

        const isFirstLine = lineNumber === diagnostic.startLine;
        const isLastLine = lineNumber === diagnostic.endLine;

        // Interior lines of a multi-line span are underlined in full.
        // The first/last line only underline the part inside the span.
        const startCol = isFirstLine ? toExpandedColumn(rawLine, diagnostic.startColumn) : 1;
        const endCol = isLastLine ? toExpandedColumn(rawLine, diagnostic.endColumn) : expandedLine.length + 1;

        const caretCount = Math.max(1, endCol - startCol);
        const carets = colors.bold(colors[severityColor]("^".repeat(caretCount)));
        const underlinePadding = " ".repeat(Math.max(0, startCol - 1));

        const numberedGutter = colors.dim(String(lineNumber).padStart(gutterWidth)) + " " + colors.dim("|");

        linesOut.push(`${numberedGutter} ${escapedLine}`);
        linesOut.push(`${gutter} ${underlinePadding}${carets}`);
    }

    linesOut.push(footer);

    return linesOut.join("\n");
}

/**
 * Formats and prints all diagnostics for a completed interpretation run,
 * sorted by source position, followed by a summary line.
 *
 * @param {Diagnostic[]} diagnostics
 * @param {string} source
 * @param {string} filePath
 * @param {Interpreter["host"]} host
 */
export function report(diagnostics, source, filePath, host) {
    const { logger, colors, escape } = host;

    const sorted = [...diagnostics].sort((a, b) => {
        if (a.startLine !== b.startLine) return a.startLine - b.startLine;
        return a.startColumn - b.startColumn;
    });

    for (const diagnostic of sorted) {
        logger(formatDiagnostic(diagnostic, source, filePath, colors, escape));
        logger("");
    }

    const errorCount = diagnostics.filter((d) => d.type === "error").length;
    const warningCount = diagnostics.filter((d) => d.type === "warning").length;

    if (errorCount === 0 && warningCount === 0) return;

    const parts = [];
    if (errorCount > 0) {
        parts.push(colors.bold(colors.red(`${errorCount} error${errorCount === 1 ? "" : "s"}`)));
    }
    if (warningCount > 0) {
        parts.push(colors.bold(colors.yellow(`${warningCount} warning${warningCount === 1 ? "" : "s"}`)));
    }
    logger(parts.join(", "));
}






/**
 * Formats a source range path like Node.js / Rust / TypeScript compilers.
 * Terminals natively detect and make this clickable without OS prompt dialogs.
 *
 * @param {string} filePath Absolute or relative file path
 * @param {number} line 1-based line number
 * @param {number} column 1-based column number
 * @param {Interpreter["host"]["colors"]} colors 
 * @returns {string}
 */
export function createSourceLink(filePath, line, column, colors) {
    return (
        colors.blue(filePath) + 
        colors.dim(":") + 
        colors.yellow(String(line)) + 
        colors.dim(":") + 
        colors.yellow(String(column))
    );
}


