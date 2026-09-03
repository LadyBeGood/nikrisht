
import { elements } from "../elements.js"

export function setupBottomSheets() {

    /**
     * Relocate UI elements according to window width
     */
    function applyLayout(isMobile) {
        if (isMobile) {
            elements.bottomSheetScreen.appendChild(elements.screen);
            elements.bottomSheetDocumentation.appendChild(elements.documentation);
            elements.documentation.classList.add("narrow");
            elements.documentationTopbar.appendChild(elements.documentationSearchBox);
        } else {
            // Restore original desktop order: .screen then .documentation
            elements.right.appendChild(elements.screen);
            elements.right.appendChild(elements.documentation);
            elements.documentation.classList.remove("narrow");
            elements.documentationSidebar.prepend(elements.documentationSearchBox);


            // Sheets are meaningless on desktop — make sure they're closed
            elements.bottomSheetScreen.open = false;
            elements.bottomSheetDocumentation.open = false;
        }
    }

    const media = window.matchMedia("(max-width: 768px)");
    applyLayout(media.matches);
    media.addEventListener("change", (event) => applyLayout(event.matches));



    /* Opening and closing bottomsheets */

    elements.bottomSheetOpenerList.forEach((bottomSheetOpener) => {
        bottomSheetOpener.addEventListener("click", () => {
            if (window.innerWidth > 768) return;
            const bottomSheet = document.querySelector(`[data-bottom-sheet-${bottomSheetOpener.dataset.openSheet}]`);
            if (bottomSheet) bottomSheet.open = true;
        });
    });

    elements.bottomSheetCloserList.forEach((bottomSheetCloser) => {
        bottomSheetCloser.addEventListener("click", () => {
            const bottomSheet = bottomSheetCloser.closest("bottom-sheet");
            if (bottomSheet) bottomSheet.open = false;
        });
    });

    elements.toggleTopicsButton.addEventListener("click", () => {
        elements.documentationSidebar.classList.toggle("active");
        elements.documentationContent.classList.toggle("dim")
    })

    elements.documentationContent.addEventListener("click", () => {
        if (!elements.documentationSidebar.classList.contains("active")) return;

        elements.documentationSidebar.classList.remove("active");
        elements.documentationContent.classList.remove("dim");
    })

}