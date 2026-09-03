
import { elements } from "../elements.js"
import { run } from "../../../runner/run.js";
import { colors, log, escape } from "../language/host.js"

export function setupActionButtons(editor) {
    elements.actionPlay.addEventListener("click", () => {
        const source = editor.getValue();
        elements.logTarget.innerHTML = "";
        const interpreter = run({
            source,
            path: "Playground",
            colors,
            host: { log },
            escape
        });

        // Padding at the bottom
        elements.logTarget.innerHTML += "\n";

        let numberOfErrors = 0;
        let numberOfWarnings = 0;
        for (const diagnostic of interpreter.diagnostics) {
            if (diagnostic.type === "error") {
                numberOfErrors++;
            } else {
                numberOfWarnings++;
            }
        }

        if (numberOfErrors === 0 && numberOfWarnings === 0) {
            elements.consoleSuccess.style.display = "flex";
            elements.consoleError.style.display = "none";
            elements.consoleWarning.style.display = "none";
        } else {
            elements.consoleSuccess.style.display = "none";

            if (numberOfErrors > 0) {
                elements.consoleError.style.display = "flex";
                elements.errorCount.textContent = numberOfErrors + " " + (numberOfErrors === 1 ? "error" : "errors");
            }

            if (numberOfWarnings > 0) {
                elements.consoleWarning.style.display = "flex";
                elements.warningCount.textContent = numberOfWarnings + " " + (numberOfWarnings === 1 ? "warning" : "warnings");
            }
        }

        elements.initialScreenList.forEach(initialScreen => {
            initialScreen.style.display = "none";
        })

        // TEMPORARY
        document.querySelector(`[data-tree-log]`).textContent = JSON.stringify(interpreter.statements, null, 4);
    });
}

