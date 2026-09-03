
import { elements } from "../elements.js"


export function setupPaneButtons() {
    elements.paneButtonList.forEach(paneButton => {
        paneButton.addEventListener("click", () => {
            const targetPane = paneButton.dataset.paneButton;

            // Toggle active class on buttons
            elements.paneButtonList.forEach(btn => {
                btn.classList.toggle("active", btn === paneButton);
            });

            // Toggle pane content visibility based on target key
            elements.paneContentList.forEach(paneContent => {
                const isMatch = paneContent.dataset.paneContent === targetPane;
                paneContent.style.display = isMatch ? "block" : "none";
            });
        })
    });
}

