
import { setupAceEditor } from "./setup/setupAceEditor.js"
import { setupBottomSheets } from "./setup/setupBottomSheets.js"
import { setupResponsiveness } from "./setup/setupResponsiveness.js"
import { setupShortcutButtons } from "./setup/setupShortcutButtons.js"
import { setupActionButtons } from "./setup/setupActionButtons.js"
import { setupPaneButtons } from "./setup/setupPaneButtons.js"
import { setupDocumentation } from "./setup/setupDocumentation.js"


function main() {
    // debugger
    setupBottomSheets();
    const editor = ace.edit("editor");
    setupResponsiveness(editor);
    setupAceEditor(editor);
    setupShortcutButtons(editor);
    setupActionButtons(editor);
    setupPaneButtons();
    setupDocumentation();
}



main()























