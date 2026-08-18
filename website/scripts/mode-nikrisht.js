ace.define("ace/mode/nikrisht_highlight_rules", [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text_highlight_rules"
], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var NikrishtHighlightRules = function () {
        // Nikrisht Language Keywords

        this.$rules = {
            "start": [
                // Multi-line comments
                {
                    token: "comment.block",
                    regex: "#\\*",
                    push: [
                        { token: "comment.block", regex: "\\*#", next: "pop" },
                        { defaultToken: "comment.block" }
                    ]
                },
                // Single-line comments
                {
                    token: "comment.line.double-slash",
                    regex: "#.*$"
                },
                // Double-quoted strings
                {
                    token: "string",
                    regex: '"',
                    push: [
                        { token: "string", regex: '"', next: "pop" },
                        { token: "constant.character.escape", regex: "\\\\." },
                        { defaultToken: "string" }
                    ]
                },
                // Numbers (Integers & Decimals)
                {
                    token: "constant.numeric",
                    regex: "\\b[0-9]+(\\.[0-9]+)?\\b"
                },
                {
                    token: "constant.language.boolean",
                    regex: "\\b(true|false)\\b"
                },
                {
                    token: "constant.language",
                    regex: "\\b(null|infinity|nan)\\b"
                },
                // Keywords
                {
                    token: "keyword",
                    regex: "\\b(else|loop|with|func|if|return|var|const)\\b"
                },
                // function
                {
                    token: "entity.name.function",
                    regex: "[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*\\()",
                },
                // Identifiers 
                {
                    token: "identifier",
                    regex: "[a-zA-Z_][a-zA-Z0-9_]*\\b"
                },
                // Operators
                {
                    token: "keyword.operator",
                    regex: "!|!=|=|==|<|<=|>|>=|\\+|\\-|\\*|/"
                },
                // Punctuation
                {
                    token: "punctuation.operator",
                    regex: "\\(|\\)|\\{|\\}|;|\\."
                },
                // Whitespace
                {
                    token: "text",
                    regex: "\\s+"
                }
            ]
        };

        this.normalizeRules();
    };

    oop.inherits(NikrishtHighlightRules, TextHighlightRules);
    exports.NikrishtHighlightRules = NikrishtHighlightRules;
});





ace.define("ace/mode/nikrisht", [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text",
    "ace/mode/nikrisht_highlight_rules"
], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var NikrishtHighlightRules = require("./nikrisht_highlight_rules").NikrishtHighlightRules;

    var Mode = function () {
        this.HighlightRules = NikrishtHighlightRules;
        this.lineCommentStart = "//";
        this.blockComment = { start: "/*", end: "*/" };
    };
    oop.inherits(Mode, TextMode);

    (function () {
        this.$id = "ace/mode/nikrisht";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});