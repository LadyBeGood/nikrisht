
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export const elements = {
    left: $("[data-left]"),
    right: $("[data-right]"),

    examples: $("[data-examples]"),

    settings: $("[data-settings]"),
    settingsMenu: $("[data-settings-menu]"),
    settingsOverlay: $("[data-settings-overlay]"),
    settingsTheme: $("[data-settings-theme]"),
    settingsKeybindingCollection: $$("[data-settings-keybinding]"),
    settingsFontSize: $("[data-settings-font-size]"),
    settingsCursorStyle: $("[data-settings-cursor-style]"),
    settingsTabSize: $("[data-settings-tab-size]"),
    settingsInsertSpaces: $("[data-settings-insert-spaces]"),
    settingsShowInvisibleCharacters: $("[data-settings-show-invisible-characters]"),
    settingsKeyboardAccessibilityMode: $("[data-settings-keyboard-accessibility-mode]"),

    shortcutButtons: $("[data-shortcut-buttons]"),
    shortcutButtonsToggler: $("[data-shortcut-buttons-toggler]"),
    shortcutButtonTab: $("[data-shortcut-button-tab]"),
    shortcutButtonUndo: $("[data-shortcut-button-undo]"),
    shortcutButtonRedo: $("[data-shortcut-button-redo]"),
    shortcutButtonSearch: $("[data-shortcut-button-search]"),
    shortcutButtonUp: $("[data-shortcut-button-up]"),
    shortcutButtonMore: $("[data-shortcut-button-more]"),
    shortcutButtonControl: $("[data-shortcut-button-control]"),
    shortcutButtonShift: $("[data-shortcut-button-shift]"),
    shortcutButtonAlt: $("[data-shortcut-button-alt]"),
    shortcutButtonLeft: $("[data-shortcut-button-left]"),
    shortcutButtonDown: $("[data-shortcut-button-down]"),
    shortcutButtonRight: $("[data-shortcut-button-right]"),

    documentationSidebar: $("[data-documentation-sidebar]"),
    documentationContent: $("[data-documentation-content]"),
    documentationTopics: $("[data-topics]"),
    documentationTopicNameCollection: $$("[data-topic-name]"),
    documentationSubTopicCollection: $$("[data-sub-topic]"),
    documentationSearchPreviousButton: $("[data-documentation-search-previous-button]"),
    documentationSearchNextButton: $("[data-documentation-search-next-button]"),
    documentationSearchResultCount: $("[data-documentation-search-result-count]"),
    documentationSearchControls: $("[data-documentation-search-controls]"),
    documentationSearchField: $("[data-documentation-search-field]"),
    documentationSearchResults: $("[data-documentation-search-results]"),

}

