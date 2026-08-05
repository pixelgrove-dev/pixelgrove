/**
 * Shared editor state and element references.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp = window.EditorApp || {};
    const urlParameters = new URLSearchParams(window.location.search);
    const topicId = urlParameters.get("topic");

    EditorApp.state = {
        currentTopicId: topicId,
        currentTopic: null,
        autosaveTimer: null,
        autosaveDelay: 1500,
        isSaving: false,
        pendingSave: false,
        hasLoaded: false,
        lastSavedAt: null,

        history: [],
        historyIndex: -1,
        historyTimer: null,
        historyDelay: 350,
        historyLimit: 50,
        isApplyingHistory: false
    };

    EditorApp.elements = {
        difficultySelect: document.getElementById("difficulty"),
        statusSelect: document.getElementById("status"),
        saveTopicButton: document.getElementById("save-topic"),
        saveMessage: document.getElementById("save-message"),
        editorStatus: document.getElementById("editor-status"),
        topicTitleInput: document.getElementById("topic-title-input"),
        categorySelect: document.getElementById("category"),
        imageUrlInput: document.getElementById("image-url"),
        youtubeUrlInput: document.getElementById("youtube-url"),
        previewMedia: document.getElementById("preview-media"),
        previewTitle: document.getElementById("preview-title"),
        previewCategory: document.getElementById("preview-category"),
        previewQuestions: document.getElementById("preview-questions"),
        previewAnswers: document.getElementById("preview-answers"),
        paragraphContainer: document.getElementById("paragraph-container"),
        addParagraphButton: document.getElementById("add-paragraph"),
        questionContainer: document.getElementById("question-container"),
        addQuestionButton: document.getElementById("add-question"),
        previewReading: document.getElementById("preview-reading")
    };

    EditorApp.pendingDraftKey = function (topicIdValue) {
        return `grovePendingTopic:${topicIdValue || "new"}`;
    };
})();
