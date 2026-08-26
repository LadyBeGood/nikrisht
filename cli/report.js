// @ts-check

import { red, yellow, bold, dim, blue } from "ansis";
import path from "node:path";

const TAB_WIDTH = 4;

const SEVERITY_STYLE = {
    error: { label: "Error", color: red },
    warning: { label: "Warning", color: yellow },
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
 * Renders a single diagnostic in a rustc/javac-inspired format:
 * a greppable header line, a source snippet with line-number gutter,
 * and a caret underline spanning the exact offending range.
 *
 * Coordinates are 1-based; endLine/endColumn are exclusive (one past
 * the last character of the span).
 *
 * @param {Diagnostic} diagnostic
 * @param {string} source Full original source text.
 * @param {string} filePath Path to display in the header line.
 * @returns {string}
 */
export function formatDiagnostic(diagnostic, source, filePath) {
    const style = SEVERITY_STYLE[diagnostic.type];
    const severityColor = style.color;

    const lines = source.split("\n");
    const rawLine = lines[diagnostic.startLine - 1] ?? "";
    const expandedLine = expandTabs(rawLine);

    const isMultiLine = diagnostic.endLine > diagnostic.startLine;
    const startCol = toExpandedColumn(rawLine, diagnostic.startColumn);
    // For a single-line span, endColumn is exclusive within the same line.
    // For a multi-line span we only render the start line, so the underline
    // just runs to the end of that line and we note it continues further.
    const endCol = isMultiLine
        ? expandedLine.length + 1
        : toExpandedColumn(rawLine, diagnostic.endColumn);

    const gutterWidth = String(diagnostic.startLine).length;
    const gutter = " ".repeat(gutterWidth) + " " + dim("|");
    const numberedGutter = dim(String(diagnostic.startLine).padStart(gutterWidth)) + " " + dim("|");

    const caretCount = Math.max(1, endCol - startCol);
    const carets = bold(severityColor("^".repeat(caretCount)));
    const underlinePadding = " ".repeat(Math.max(0, startCol - 1));

    const header =
        bold(severityColor(`${style.label}:`)) +
        " " +
        bold(diagnostic.message);

    const footer = createSourceLink(filePath, diagnostic.startLine, diagnostic.startColumn);

    const lines_out = [
        header,
        gutter,
        `${numberedGutter} ${expandedLine}`,
        `${gutter} ${underlinePadding}${carets}`,
        footer
    ];


    if (isMultiLine) {
        lines_out.push(
            `${gutter} ${dim(`(span continues to line ${diagnostic.endLine})`)}`
        );
    }

    return lines_out.join("\n");
}

/**
 * Formats and prints all diagnostics for a completed interpretation run,
 * sorted by source position, followed by a summary line.
 *
 * @param {Diagnostic[]} diagnostics
 * @param {string} source
 * @param {string} filePath
 */
export function report(diagnostics, source, filePath) {
    const sorted = [...diagnostics].sort((a, b) => {
        if (a.startLine !== b.startLine) return a.startLine - b.startLine;
        return a.startColumn - b.startColumn;
    });

    for (const diagnostic of sorted) {
        console.error(formatDiagnostic(diagnostic, source, filePath));
        console.error("");
    }

    const errorCount = diagnostics.filter((d) => d.type === "error").length;
    const warningCount = diagnostics.filter((d) => d.type === "warning").length;

    if (errorCount === 0 && warningCount === 0) return;

    const parts = [];
    if (errorCount > 0) {
        parts.push(bold(red(`${errorCount} error${errorCount === 1 ? "" : "s"}`)));
    }
    if (warningCount > 0) {
        parts.push(bold(yellow(`${warningCount} warning${warningCount === 1 ? "" : "s"}`)));
    }
    console.error(parts.join(", "));
}






/**
 * Formats a source range path like Node.js / Rust / TypeScript compilers.
 * Terminals natively detect and make this clickable without OS prompt dialogs.
 *
 * @param {string} filePath Absolute or relative file path
 * @param {number} line 1-based line number
 * @param {number} column 1-based column number
 * @returns {string}
 */
export function createSourceLink(filePath, line, column) {
    const absolutePath = path.resolve(filePath);
    return `${blue(absolutePath)}${dim(":")}${yellow(line)}${dim(":")}${yellow(column)}`;
}


