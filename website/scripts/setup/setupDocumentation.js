
import { elements } from "../elements.js"


export async function setupDocumentation() {
    const fileContentCache = {};
    const fileTextCache = {}; // Pre-stripped clean text cache for fast searching
    let searchMatches = [];
    let currentMatchIndex = -1;


    // Clean, minimalist custom renderer for marked blockquotes
    marked.use({
        renderer: {
            blockquote(token) {
                let body = this.parser.parse(token.tokens);

                // Look for [!NOTE], [!WARNING], or [!TIP] tokens at the start of the blockquote
                const alertRegex = /^<p>\[!(NOTE|WARNING|TIP)\]\s*(?:<br\s*\/?>)?\s*/i;
                const match = body.match(alertRegex);

                if (match) {
                    const type = match[1].toLowerCase(); // 'note', 'warning', or 'tip'

                    // Format token to standard title casing (e.g., "Note", "Warning", "Tip")
                    const titleText = type.charAt(0).toUpperCase() + type.slice(1);

                    // Strip the raw markdown token tag string from the inner body text
                    body = body.replace(alertRegex, '<p>');

                    // Return clean semantic wrappers with class assignments
                    return `<blockquote class="${type}">
                    <span class="title">${titleText}</span>
                    ${body}
                </blockquote>`;
                }

                // Default standard blockquote return rule fallback
                return `<blockquote>${body}</blockquote>`;
            },
            code(token) {
                return `<pre><code class="language-nikrisht">${token.text}</code></pre>`;
            }
        }
    });


    // Load the active item on startup, or fall back to the first available sub-topic item
    const initialActiveSubtopic =
        elements.documentationSidebar.querySelector("[data-sub-topic].active") ??
        elements.documentationSubTopicList[0];

    // ==========================================
    // PRELOAD MATRIX (Load everything concurrently)
    // ==========================================
    async function preloadAllFiles() {
        const fetchPromises = Array.from(elements.documentationSubTopicList).map(async (button) => {
            const fileKey = button.dataset.fileName;
            const filePath = `./documentation/${fileKey}.md`;

            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`Could not fetch ${filePath}`);

                const markdownText = await response.text();
                const htmlText = marked.parse(markdownText);

                // Cache the HTML for structural rendering
                fileContentCache[fileKey] = htmlText;

                // Cache a clean text version instantly to keep memory operations light
                fileTextCache[fileKey] = htmlText.replace(/<\/?[^>]+(>|$)/g, "");
            } catch (error) {
                console.error(`Preload failed for ${fileKey}:`, error);
                fileContentCache[fileKey] = `<div style="padding: 20px; color: #ff6b6b;">Error: Failed to load document.</div>`;
                fileTextCache[fileKey] = "";
            }
        });

        // Wait for all files to be downloaded and parsed into memory
        await Promise.all(fetchPromises);

        // Once fully loaded, render the initial view
        if (initialActiveSubtopic) {
            renderDocument(initialActiveSubtopic.dataset.fileName);
        }
    }

    function renderDocument(fileKey, scrollTo) {
        if (!fileKey || fileContentCache[fileKey] === undefined) return;
        elements.documentationContent.innerHTML = fileContentCache[fileKey];
        elements.documentationContent.scrollTop = scrollTo;

        Prism.highlightAll();
    }

    // Trigger the global preload sequence immediately
    await preloadAllFiles();

    // ==========================================
    // SIDEBAR INTERACTION LISTENERS
    // ==========================================

    // Handle switching between sub-topics (Instant from cache)
    elements.documentationSubTopicList.forEach(subTopic => {
        subTopic.addEventListener("click", () => {
            elements.documentationSubTopicList.forEach(item => item.classList.remove("active"));
            subTopic.classList.add("active");

            const fileKey = subTopic.dataset.fileName;
            renderDocument(fileKey);
        });
    });

    // Handle opening and closing folder directories
    elements.documentationTopicNameList.forEach(heading => {
        heading.addEventListener("click", () => {
            const parentTopicElement = heading.closest("[data-topic]");
            if (parentTopicElement) {
                parentTopicElement.classList.toggle("open");
            }
        });
    });

    // ==========================================
    // ZERO-REGEX STRING SEARCH ENGINE 
    // ==========================================
    function executeSearch() {
        const rawQuery = elements.documentationSearchField.value.trim();
        const searchQuery = rawQuery.toLowerCase();

        // Safety Gate: If the query is empty or just spaces, completely reset and exit
        if (!searchQuery) {
            elements.documentationSearchControls.style.display = "none";
            elements.documentationSearchResults.style.display = "none";
            elements.documentationTopics.style.display = "block";

            const currentActiveButton = elements.documentationSidebar.querySelector("[data-sub-topic].active");
            if (currentActiveButton) {
                renderDocument(currentActiveButton.dataset.fileName, elements.documentationContent.scrollTop);
            }

            searchMatches = [];
            currentMatchIndex = -1;
            return;
        }

        elements.documentationTopics.style.display = "none";
        elements.documentationSearchResults.style.display = "block";
        elements.documentationSearchResults.innerHTML = "";
        searchMatches = [];

        // Scan the pre-rendered text cache using rapid string indexing
        elements.documentationSubTopicList.forEach(button => {
            const fileKey = button.dataset.fileName;
            const textContent = fileTextCache[fileKey] || "";
            const lowerTextContent = textContent.toLowerCase();
            const pageTitle = button.textContent.trim();

            let position = lowerTextContent.indexOf(searchQuery);

            // loop through all matching indices via direct index tracking offset
            while (position !== -1) {
                const windowStart = Math.max(0, position - 40);
                const windowEnd = Math.min(textContent.length, position + searchQuery.length + 45);

                let snippetText = textContent.substring(windowStart, windowEnd);
                if (windowStart > 0) snippetText = "..." + snippetText;
                if (windowEnd < textContent.length) snippetText = snippetText + "...";

                // Highlight using basic string manipulation instead of an unsafe execution pattern
                const queryLength = searchQuery.length;
                const matchIndex = snippetText.toLowerCase().indexOf(searchQuery);
                const originalValue = snippetText.substring(matchIndex, matchIndex + queryLength);

                const highlightedSnippetHTML = snippetText.substring(0, matchIndex) +
                    `<mark>${originalValue}</mark>` +
                    snippetText.substring(matchIndex + queryLength);

                searchMatches.push({
                    fileKey: fileKey,
                    metaText: pageTitle,
                    snippetHTML: highlightedSnippetHTML,
                    subTopicButton: button
                });

                // Advance position index past the current match length to find next match
                position = lowerTextContent.indexOf(searchQuery, position + queryLength);
            }
        });

        // Display results
        if (searchMatches.length > 0) {
            elements.documentationSearchControls.style.display = "flex";
            currentMatchIndex = 0;

            const fragment = document.createDocumentFragment();

            searchMatches.forEach((match, index) => {
                const resultCard = document.createElement("div");
                resultCard.className = "utk-search-card";
                resultCard.innerHTML = `
                    <div class="utk-search-card__meta">${match.metaText}</div>
                    <div class="utk-search-card__snippet">${match.snippetHTML}</div>
                `;

                resultCard.addEventListener("click", () => {
                    currentMatchIndex = index;
                    syncSearchNavigationState();
                });

                fragment.appendChild(resultCard);
            });

            elements.documentationSearchResults.appendChild(fragment);
            syncSearchNavigationState();
        } else {
            elements.documentationSearchControls.style.display = "flex";
            elements.documentationSearchResultCount.textContent = "0/0";
            elements.documentationSearchResults.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 13px; color: #a9b2c3;">No matches found.</div>`;
            currentMatchIndex = -1;
        }
    }

    function syncSearchNavigationState() {
        if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

        const currentMatch = searchMatches[currentMatchIndex];

        elements.documentationSubTopicList.forEach(item => item.classList.remove("active"));
        currentMatch.subTopicButton.classList.add("active");

        const sourceHTML = fileContentCache[currentMatch.fileKey];
        const rawQuery = elements.documentationSearchField.value.trim();

        // Highlight active page elements using primitive split/join mechanics to preserve system safety
        const searchParts = sourceHTML.split(new RegExp(`(${rawQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi"));
        elements.documentationContent.innerHTML = searchParts.map(part => {
            return part.toLowerCase() === rawQuery.toLowerCase() ? `<mark class="utk-mark">${part}</mark>` : part;
        }).join("");

        const pageHighlightMarks = elements.documentationContent.querySelectorAll(".utk-mark");
        if (pageHighlightMarks.length > 0) {
            let relativeMatchCount = 0;
            for (let i = 0; i < currentMatchIndex; i++) {
                if (searchMatches[i].fileKey === currentMatch.fileKey) {
                    relativeMatchCount++;
                }
            }

            const activeMarkElement = pageHighlightMarks[relativeMatchCount] || pageHighlightMarks[0];
            if (activeMarkElement) {
                activeMarkElement.classList.add("utk-mark--active");
                activeMarkElement.scrollIntoView({ behavior: "smooth", block: "center" });

                // To solve a bug in Firefox
                elements.documentation.scrollTop = 0;
            }
        }

        const resultCards = elements.documentationSearchResults.querySelectorAll(".utk-search-card");
        resultCards.forEach((card, index) => {
            if (index === currentMatchIndex) {
                card.classList.add("utk-search-card--active");
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });

                // To solve a bug in Firefox
                elements.documentation.scrollTop = 0;
            } else {
                card.classList.remove("utk-search-card--active");
            }
        });

        elements.documentationSearchResultCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length}`;
    }

    function navigateToNextMatch() {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        syncSearchNavigationState();
    }

    function navigateToPreviousMatch() {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        syncSearchNavigationState();
    }

    function clearSearchField() {
        elements.documentationSearchField.value = "";
        executeSearch();
    }

    // ==========================================
    // EVENTS
    // ==========================================
    elements.documentationSearchField.addEventListener("input", executeSearch);
    elements.documentationSearchNextButton.addEventListener("click", navigateToNextMatch);
    elements.documentationSearchPreviousButton.addEventListener("click", navigateToPreviousMatch);
    elements.documentationSearchClearButton.addEventListener("click", clearSearchField)

    elements.documentationSearchField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (event.shiftKey) {
                navigateToPreviousMatch();
            } else {
                navigateToNextMatch();
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            clearSearchField()
        }
    });
}

