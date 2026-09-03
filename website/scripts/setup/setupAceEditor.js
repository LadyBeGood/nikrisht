
import { elements } from "../elements.js"
import { examples } from "../language/examples.js"

function showSettingsMenu() {
    elements.settingsOverlay.style.display = "block"
    elements.settingsMenu.style.display = "grid"
}

function hideSettingsMenu() {
    elements.settingsOverlay.style.display = "none"
    elements.settingsMenu.style.display = "none"
}


function spacesToTab(editor, tabWidth, value) {
    const source = value ?? editor.getValue();

    const updatedSource = source.replace(/^( +)/gm, (match) => {
        const count = match.length;
        const tabs = "\t".repeat(Math.floor(count / tabWidth));
        const remainingSpaces = " ".repeat(count % tabWidth);

        return tabs + remainingSpaces;
    });

    editor.setValue(updatedSource, 0);
    editor.clearSelection();
}

function tabToSpaces(editor, tabWidth, value) {
    const source = value ?? editor.getValue();
    const spaceString = " ".repeat(tabWidth);

    const updatedSource = source.replace(/\t/g, spaceString);

    editor.setValue(updatedSource, 0);
    editor.clearSelection();
}


function setupExampleSelection(editor) {
    function setText() {
        let source = examples[elements.examples.value];
        const tabWidth = Number(elements.settingsTabSize.value);
        const insertSpaces = elements.settingsInsertSpaces.checked;

        // For safety
        if (tabWidth < 1) {
            tabWidth = 1;
        }

        if (insertSpaces) {
            source = source.replaceAll("\t", " ".repeat(tabWidth));
        }

        editor.setValue(source);
        editor.clearSelection()
        editor.session.setTabSize(tabWidth);
        editor.session.setUseSoftTabs(insertSpaces);
    }

    setText();
    elements.examples.addEventListener("change", setText);
}


function setupSettings(editor) {
    elements.settings.addEventListener("click", function () {
        showSettingsMenu();
    });

    elements.settingsOverlay.addEventListener("click", function () {
        hideSettingsMenu();
    })


    /* Theme */
    editor.setTheme(elements.settingsTheme.value);
    elements.settingsTheme.addEventListener("change", function () {
        editor.setTheme(elements.settingsTheme.value)
    });


    /* Keybindings */
    const currentKeybinding = document.querySelector("[data-settings-keybinding='active']").value;
    editor.setKeyboardHandler(currentKeybinding !== "null" ? currentKeybinding : null);

    elements.settingsKeybindingList.forEach(function (element) {
        element.addEventListener("click", function () {

            elements.settingsKeybindingList.forEach(function (button) {
                if (button === element) {
                    button.dataset.settingsKeybinding = "active"
                    editor.setKeyboardHandler(button.value !== "null" ? button.value : null);
                } else {
                    button.dataset.settingsKeybinding = ""
                }
            })
        })
    })


    /* Font size */
    editor.setFontSize(Number(elements.settingsFontSize.value));
    elements.settingsFontSize.addEventListener("change", function () {
        editor.setFontSize(Number(elements.settingsFontSize.value))
    });


    /* Cursor style */
    elements.settingsCursorStyle.addEventListener("change", function () {
        editor.setOption("cursorStyle", elements.settingsCursorStyle.value)
    })


    /* Tab size */
    elements.settingsTabSize.addEventListener("change", function () {
        const newSize = Number(this.value);
        const oldSize = editor.session.getTabSize();

        if (elements.settingsInsertSpaces.checked && oldSize !== newSize && newSize > 0) {
            const source = editor.getValue();
            const updatedSource = source.replace(/^( +)/gm, (match) => {
                return " ".repeat(Math.round(match.length / oldSize) * newSize);
            });
            editor.setValue(updatedSource, 0);
            editor.clearSelection();
        }

        editor.session.setTabSize(newSize);

    })


    /* Insert spaces */
    elements.settingsInsertSpaces.addEventListener("click", function () {
        editor.session.setUseSoftTabs(elements.settingsInsertSpaces.checked);
        if (elements.settingsInsertSpaces.checked) {
            tabToSpaces(editor, Number(elements.settingsTabSize.value))
        } else {
            spacesToTab(editor, Number(elements.settingsTabSize.value))
        }
    })


    /* Show invisible characters */
    editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked)
    elements.settingsShowInvisibleCharacters.addEventListener("change", function () {
        editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked);
    })


    /* Settings keyboard accessibility mode */
    editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    elements.settingsKeyboardAccessibilityMode.addEventListener("change", function () {
        editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    })
}


export function setupAceEditor(editor) {
    editor.getSession().setMode("ace/mode/nikrisht");

    // source: https://groups.google.com/g/ace-discuss/c/FDyNuFJCvTw?pli=1
    editor.setOption("scrollPastEnd", 0.7);
    editor.setOption("showPrintMargin", false);

    // Adds 200 pixels of extra scrollable space to the right of the last column
    editor.renderer.setScrollMargin(0, 0, 0, 50);

    // Target the internal scroller element of Ace
    editor.renderer.scroller.style.touchAction = "pan-x pan-y";


    // Disbale highlighting selected word
    editor.setOption('highlightSelectedWord', false);

    setupExampleSelection(editor);
    setupSettings(editor);
}

