/*ace.define("ace/mode/utkrisht_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    const oop = require("../lib/oop");
    const TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    const UtkrishtHighlightRules = function () {
        const identifier = "[a-z](?:[a-z]|[0-9]|-(?!-))*[a-z0-9]?";
        const keywordMapper = this.createKeywordMapper({
            "keyword": "when|else|loop|with|stop|skip|import|export|try|fix|exit|give",
            "constant.language": "right|wrong|nan|infinity|-infinity"
        }, "identifier")

        this.$rules = {
            "start": [{
                token: "comment",
                regex: "#.*$"
            }, {
                token: "entity.name.function",
                regex: "[a-z](?:[a-z]|[0-9]|-(?!-))*[a-z0-9]?(?= -\\d| +\\d|!| [a-z0-9\"\\[\\(])(?! with)"
            }, {
                token: keywordMapper,
                regex: "[a-z](?:[a-z]|[0-9]|-(?!-))*[a-z0-9]?"
            }, { 
                token: "string", 
                regex: /"/, 
                next: "string" 
            }, {
                token: "keyword.operator",
                regex: "\\+|\\-|\\*|\\/|@|&|\\||\\^|~|<|>|="
            }, {
                token: "punctuation",
                regex: ",|:"
            }, {
                token: "paren.lparen",
                regex: "[\\[\\(\\{]"
            }, {
                token: "paren.rparen",
                regex: "[\\]\\)\\}]"
            }, {
                token: "text",
                regex: "\\s+"
            }],
            "string": [
                { token: "string", regex: /"/, next: "start" },
                { defaultToken: "string" }
            ],

        };
    };

    oop.inherits(UtkrishtHighlightRules, TextHighlightRules);
    exports.UtkrishtHighlightRules = UtkrishtHighlightRules;
}); */

ace.define("ace/mode/utkrisht_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    const oop = require("../lib/oop");
    const TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    const UtkrishtHighlightRules = function () {
        const identifier = "[a-z](?:[a-z]|[0-9]|-(?!-))*[a-z0-9]?";

        // 1. Define the keywords explicitly for the primary check
        const controlKeywords = "try|fix|crash|when|else|loop|with|return|skip|exit|import|export";
        const constants = "true|false|nan|infinity|-infinity";
        // const builtins = "webapp|shape|text|media|tag";
        const builtins = "gibberish-garbage-placeholder";

        this.$rules = {
            "start": [
                {
                    token: "comment",
                    regex: /##(?=\s)/,
                    push: "block_comment"
                },
                {
                    token: "comment",
                    regex: /# [^\n]*/
                },
                {
                    token: "comment",
                    regex: /#(?=\n|$)/
                },
                {
                    token: "punctuation.definition.string.begin",
                    regex: '"',
                    next: "string"
                },
                {
                    token: "constant.numeric",
                    regex: "-?\\d+(?:\\.\\d+)?(?=$|[^\\w-])"
                },
                // 2. KEYWORD PRIORITY: Catch keywords BEFORE function lookaheads
                {
                    token: "keyword.control",
                    regex: "\\b(?:" + controlKeywords + ")\\b"
                },
                {
                    token: "constant.language",
                    regex: "\\b(?:" + constants + ")\\b"
                },
                {
                    token: "support.function",
                    regex: "\\b(?:" + builtins + ")\\b"
                },
                // 3. FUNCTION LOOKAHEADS: Now these only catch non-keywords
                {
                    token: "entity.name.function",
                    regex: identifier + "(?= -\\d| +\\d|!| [a-z0-9\"\\[\\(])(?! with)"
                },
                {
                    token: "entity.name.function",
                    regex: "^\\s*" + identifier + "(?= ~ *\\{)"
                },
                {
                    token: "entity.name.function",
                    regex: identifier + "(?=\\()"
                },
                // 4. REMAINING IDENTIFIERS (Variables, Parameters, etc.)
                {
                    token: "variable.parameter",
                    regex: identifier + "(?=:)"
                },
                {
                    token: "identifier",
                    regex: identifier
                },
                {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\*|\\/|@|&|\\||\\^|~|<|>|="
                },
                {
                    token: "punctuation",
                    regex: ",|:|\\."
                },
                {
                    token: "paren.lparen",
                    regex: "[\\[\\(\\{]"
                },
                {
                    token: "paren.rparen",
                    regex: "[\\]\\)\\}]"
                },
                {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            "string": [
                // Escape characters
                {
                    token: "constant.character.escape.utkrisht",
                    regex: "\\\\(?:\"|\\\\|n|r|t|b|f|v|0|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\\{[0-9A-Fa-f]+\\})"
                },
                // Interpolation start: \(
                {
                    token: "punctuation.definition.template-expression.begin",
                    regex: "\\\\\\(",
                    push: "start", // Push back to start rules
                    next: [
                        { token: "punctuation.definition.template-expression.end", regex: "\\)", next: "pop" }
                    ]
                },
                // String end
                {
                    token: "punctuation.definition.string.end",
                    regex: '"',
                    next: "start"
                },
                {
                    defaultToken: "string"
                }
            ],
            block_comment: [
                // Nested ##
                {
                    token: "comment",
                    regex: /##(?=\s)/,
                    push: "block_comment"
                },

                // Closing ##
                {
                    token: "comment",
                    regex: /\s##/,
                    next: "pop"
                },

                {
                    token: "comment",
                    regex: /./
                },
                {
                    token: "comment",
                    regex: /$/
                }
            ]
        };

        this.normalizeRules();

    };

    oop.inherits(UtkrishtHighlightRules, TextHighlightRules);
    exports.UtkrishtHighlightRules = UtkrishtHighlightRules;
});

ace.define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function (require, exports, module) {
    "use strict";

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function (commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function () {

        this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
        this._getFoldWidgetBase = this.getFoldWidget;
        this.getFoldWidget = function (session, foldStyle, row) {
            var line = session.getLine(row);

            if (this.singleLineBlockCommentRe.test(line)) {
                if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                    return "";
            }

            var fw = this._getFoldWidgetBase(session, foldStyle, row);

            if (!fw && this.startRegionRe.test(line))
                return "start"; // lineCommentRegionStart

            return fw;
        };

        this.getFoldWidgetRange = function (session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if (this.startRegionRe.test(line))
                return this.getCommentRegionBlock(session, line, row);

            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;

                if (match[1])
                    return this.openingBracketBlock(session, match[1], row, i);

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);

                if (range && !range.isMultiLine()) {
                    if (forceMultiline) {
                        range = this.getSectionRange(session, row);
                    } else if (foldStyle != "all")
                        range = null;
                }

                return range;
            }

            if (foldStyle === "markbegin")
                return;

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1])
                    return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

        this.getSectionRange = function (session, row) {
            var line = session.getLine(row);
            var startIndent = line.search(/\S/);
            var startRow = row;
            var startColumn = line.length;
            row = row + 1;
            var endRow = row;
            var maxRow = session.getLength();
            while (++row < maxRow) {
                line = session.getLine(row);
                var indent = line.search(/\S/);
                if (indent === -1)
                    continue;
                if (startIndent > indent)
                    break;
                var subRange = this.getFoldWidgetRange(session, "all", row);

                if (subRange) {
                    if (subRange.start.row <= startRow) {
                        break;
                    } else if (subRange.isMultiLine()) {
                        row = subRange.end.row;
                    } else if (startIndent == indent) {
                        break;
                    }
                }
                endRow = row;
            }

            return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };
        this.getCommentRegionBlock = function (session, line, row) {
            var startColumn = line.search(/\s*$/);
            var maxRow = session.getLength();
            var startRow = row;

            var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
            var depth = 1;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth--;
                else depth++;

                if (!depth) break;
            }

            var endRow = row;
            if (endRow > startRow) {
                return new Range(startRow, startColumn, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});

ace.define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function (require, exports, module) {
    "use strict";

    var Range = require("../range").Range;

    var MatchingBraceOutdent = function () { };

    (function () {

        this.checkOutdent = function (line, input) {
            if (! /^\s+$/.test(line))
                return false;

            return /^\s*\}/.test(input);
        };

        this.autoOutdent = function (doc, row) {
            var line = doc.getLine(row);
            var match = line.match(/^(\s*\})/);

            if (!match) return 0;

            var column = match[1].length;
            var openBracePos = doc.findMatchingBracket({ row: row, column: column });

            if (!openBracePos || openBracePos.row == row) return 0;

            var indent = this.$getIndent(doc.getLine(openBracePos.row));
            doc.replace(new Range(row, 0, row, column - 1), indent);
        };

        this.$getIndent = function (line) {
            return line.match(/^\s*/)[0];
        };

    }).call(MatchingBraceOutdent.prototype);

    exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define("ace/mode/utkrisht", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/utkrisht_highlight_rules", "ace/mode/folding/cstyle", "ace/mode/matching_brace_outdent", "ace/range"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var UtkrishtHighlightRules = require("./utkrisht_highlight_rules").UtkrishtHighlightRules;
    var UtkrishtFoldMode = require("./folding/cstyle").FoldMode;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
    var Range = require("../range").Range;

    var Mode = function () {
        this.HighlightRules = UtkrishtHighlightRules;
        this.foldingRules = new UtkrishtFoldMode();
        this.$outdent = new MatchingBraceOutdent();
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);

    (function () {

        this.lineCommentStart = ";";
        this.blockComment = { start: "comment {", end: "}" };

        this.getNextLineIndent = function (state, line, tab) {
            var indent = this.$getIndent(line);

            var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
            var tokens = tokenizedLine.tokens;
            var endState = tokenizedLine.state;

            if (tokens.length && tokens[tokens.length - 1].type == "comment") {
                return indent;
            }

            if (state == "start") {
                var match = line.match(/^.*[\{\[\(]\s*$/);
                if (match) {
                    indent += tab;
                }
            } else if (state == "doc-start") {
                if (endState == "start") {
                    return "";
                }
                var match = line.match(/^\s*(\/?)\*/);
                if (match) {
                    if (match[1]) {
                        indent += " ";
                    }
                    indent += "* ";
                }
            }

            return indent;
        };

        this.checkOutdent = function (state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };

        this.autoOutdent = function (state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };

        this.$id = "ace/mode/utkrisht";
    }).call(Mode.prototype);

    exports.Mode = Mode;
}); (function () {
    ace.require(["ace/mode/utkrisht"], function (m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();