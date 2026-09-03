
import { elements } from "../elements.js"


export function toggleShortcutButtonsVisibility() {
    if (elements.shortcutButtons.dataset.isVisible === "true") {
        elements.shortcutButtons.style.transform = "translateY(100%)";
        elements.left.style.paddingBottom = "0";
        elements.shortcutButtonsToggler.querySelector("img").style.transform = "rotate(180deg)";
    } else {
        elements.shortcutButtons.style.transform = "translateY(0%)"
        elements.left.style.paddingBottom = "72px";
        elements.shortcutButtonsToggler.querySelector("img").style.transform = "rotate(0deg)";
    }

    elements.shortcutButtons.dataset.isVisible = elements.shortcutButtons.dataset.isVisible === "true" ? "false" : "true";

    // Prevents engine from batching this styling
    setTimeout(() => elements.left.style.setProperty("--transition-duration", "0.25s"));
}



export function setupShortcutButtons(editor) {
    elements.shortcutButtonsToggler.addEventListener("click", function () {
        toggleShortcutButtonsVisibility();
    });

    [
        elements.shortcutButtonTab,
        elements.shortcutButtonUndo,
        elements.shortcutButtonRedo,
        elements.shortcutButtonSearch,
        elements.shortcutButtonUp,
        elements.shortcutButtonDown,
        elements.shortcutButtonLeft,
        elements.shortcutButtonRight,
    ].forEach(button => {
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault()
        });
    });

    elements.shortcutButtonTab.addEventListener("pointerdown", () => {
        if (!elements.settingsInsertSpaces.checked) {
            editor.insert("\t");
        } else {
            editor.insert(" ".repeat(editor.session.getTabSize()))
        }
    });

    elements.shortcutButtonUndo.addEventListener("pointerdown", () => {
        editor.undo();
    });

    elements.shortcutButtonRedo.addEventListener("pointerdown", () => {
        editor.redo();
    });

    elements.shortcutButtonSearch.addEventListener("pointerdown", () => {
        editor.execCommand("replace");
    });

    elements.shortcutButtonUp.addEventListener("pointerdown", () => {
        editor.navigateUp();
    });

    elements.shortcutButtonDown.addEventListener("pointerdown", () => {
        editor.navigateDown();
    });

    elements.shortcutButtonLeft.addEventListener("pointerdown", () => {
        editor.navigateLeft();
    });

    elements.shortcutButtonRight.addEventListener("pointerdown", () => {
        editor.navigateRight();
    });
}
