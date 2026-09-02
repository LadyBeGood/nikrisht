
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export const elements = {
    left: $("[data-left]"),
    right: $("[data-right]"),

    examples: $("[data-examples]"),

    screen: $("[data-screen]"),
    documentation: $("[data-documentation]"),

    settings: $("[data-settings]"),
    settingsMenu: $("[data-settings-menu]"),
    settingsOverlay: $("[data-settings-overlay]"),
    settingsTheme: $("[data-settings-theme]"),
    settingsKeybindingList: $$("[data-settings-keybinding]"),
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

    documentationTopbar: $("[data-documentation-topbar]"),
    documentationTopbarSidebar: $("[data-documentation-topbar-sidebar]"),
    documentationSidebar: $("[data-documentation-sidebar]"),
    documentationContent: $("[data-documentation-content]"),
    documentationSearchBox: $("[data-documentation-search-box]"),
    documentationTopics: $("[data-documentation-topics]"),
    toggleTopicsButton: $("[data-toggle-topics]"),
    documentationTopicNameList: $$("[data-topic-name]"),
    documentationSubTopicList: $$("[data-sub-topic]"),
    documentationSearchPreviousButton: $("[data-documentation-search-previous-button]"),
    documentationSearchNextButton: $("[data-documentation-search-next-button]"),
    documentationSearchClearButton: $("[data-documentation-search-clear-button]"),
    documentationSearchResultCount: $("[data-documentation-search-result-count]"),
    documentationSearchControls: $("[data-documentation-search-controls]"),
    documentationSearchField: $("[data-documentation-search-field]"),
    documentationSearchResults: $("[data-documentation-search-results]"),

    screenDisplay: $("[data-screen-display]"),
    paneButtonList: $$("[data-pane-button]"),
    paneContentList: $$("[data-pane-content]"),
    logTarget: $("[data-log-target]"),
    errorCount: $("[data-error-count]"),
    warningCount: $("[data-warning-count]"),
    consoleError: $("[data-console-error]"),
    consoleWarning: $("[data-console-warning]"),
    consoleSuccess: $("[data-console-success]"),
    initialScreenList: $$("[data-initial-screen]"),


    actionPlay: $("[data-action-play]"),

    bottomSheetScreen: $("[data-bottom-sheet-screen]"),
    bottomSheetDocumentation: $("[data-bottom-sheet-documentation]"),
    bottomSheetOpenerList: $$("[data-open-sheet]"),
    bottomSheetCloserList: $$("[data-close-sheet]"),
}

