
import { elements } from "../elements.js"
import { toggleShortcutButtonsVisibility } from "./setupShortcutButtons.js"

export function setupResponsiveness() {
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const tabletQuery = window.matchMedia("(max-width: 1150px)");

    function handleMobileChange(event) {
        let fontSize;
        let tabSize;

        if (event.matches) {
            fontSize = 14;
            tabSize = 2;

            // we are setting `isVisible` to be "false" because
            // `toggleShortcutButtonsVisibility` function will 
            // invert the visibility to "true"
            elements.shortcutButtons.dataset.isVisible = "false";
        } else {
            fontSize = 16;
            tabSize = 4;

            // we are setting `isVisible` to be "true" because
            // `toggleShortcutButtonsVisibility` function will 
            // invert the visibility to "false"
            elements.shortcutButtons.dataset.isVisible = "true";
        }

        elements.settingsFontSize.value = fontSize;
        elements.settingsTabSize.value = tabSize;
        toggleShortcutButtonsVisibility();

        const changeEvent = new Event('change', { bubbles: true });
        elements.settingsFontSize.dispatchEvent(changeEvent);
        elements.settingsTabSize.dispatchEvent(changeEvent);
    }

    function handleTabletChange(event) {
        if (event.matches) {
            elements.documentation.classList.add("narrow");
            elements.documentationTopbar.appendChild(elements.documentationSearchBox);
        } else {
            elements.documentation.classList.remove("narrow");
            elements.documentationSidebar.prepend(elements.documentationSearchBox);
        }
    }

    mobileQuery.addEventListener("change", handleMobileChange);
    handleMobileChange(mobileQuery);

    tabletQuery.addEventListener("change", handleTabletChange);
    handleTabletChange(tabletQuery);
}
