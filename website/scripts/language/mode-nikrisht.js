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
                    token: "comment.line",
                    regex: "#.*$"
                },
                // Strings
                {
                    token: "string",
                    regex: '"',
                    push: [
                        { token: "string", regex: '"', next: "pop" },
                        { token: "constant.character.escape", regex: "\\\\." },
                        { defaultToken: "string" }
                    ]
                },
                // Numbers
                {
                    token: "constant.numeric",
                    regex: "\\b[0-9]+(\\.[0-9]+)?\\b"
                },
                // Boolean
                {
                    token: "constant.language.boolean",
                    regex: "\\b(true|false)\\b"
                },
                // Numeric constants
                {
                    token: "constant.language",
                    regex: "\\b(null|infinity|nan)\\b"
                },
                // Keywords
                {
                    token: "keyword",
                    regex: "\\b(else|loop|with|func|if|return|var|const|skip|exit)\\b"
                },
                // Function
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
        this.lineCommentStart = "#";
        this.blockComment = { start: "#*", end: "*#" };
    };
    oop.inherits(Mode, TextMode);

    (function () {
        this.$id = "ace/mode/nikrisht";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});