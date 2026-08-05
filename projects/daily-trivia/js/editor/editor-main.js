/**
 * Editor event wiring, account controls, shortcuts, and startup.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;

    elements.saveTopicButton.addEventListener(
        "click",
        () => EditorApp.saveTopic()
    );

    elements.addParagraphButton.addEventListener(
        "click",
        () => {
            elements.paragraphContainer
                .appendChild(
                    EditorApp.createParagraph()
                );

            EditorApp.updatePreview();
            EditorApp.recordHistorySnapshot({
                immediate: true
            });
            EditorApp.scheduleAutosave();
        }
    );

    elements.addQuestionButton.addEventListener(
        "click",
        () => {
            elements.questionContainer
                .appendChild(
                    EditorApp.createQuestionCard()
                );

            EditorApp.updatePreview();
            EditorApp.recordHistorySnapshot({
                immediate: true
            });
            EditorApp.scheduleAutosave();
        }
    );

    elements.topicTitleInput.addEventListener(
        "input",
        EditorApp.handleEditorChange
    );

    elements.categorySelect.addEventListener(
        "change",
        EditorApp.handleEditorChange
    );

    elements.difficultySelect.addEventListener(
        "change",
        EditorApp.handleEditorChange
    );

    elements.statusSelect.addEventListener(
        "change",
        EditorApp.handleEditorChange
    );

    elements.imageUrlInput.addEventListener(
        "input",
        EditorApp.handleEditorChange
    );

    elements.youtubeUrlInput.addEventListener(
        "input",
        EditorApp.handleEditorChange
    );

    document.addEventListener(
        "keydown",
        event => {
            const modifier =
                event.ctrlKey ||
                event.metaKey;

            if (
                modifier &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                EditorApp.saveTopic();
                return;
            }

            if (
                event.ctrlKey &&
                event.altKey &&
                event.key.toLowerCase() === "n"
            ) {
                event.preventDefault();
                window.location.href =
                    "editor.html";
                return;
            }

            const activeTag =
                document.activeElement
                    ?.tagName
                    ?.toLowerCase();

            const isTyping =
                activeTag === "input" ||
                activeTag === "textarea" ||
                activeTag === "select";

            if (
                modifier &&
                !isTyping &&
                event.key.toLowerCase() === "z"
            ) {
                event.preventDefault();

                if (event.shiftKey) {
                    EditorApp.redoEditorChange();
                } else {
                    EditorApp.undoEditorChange();
                }
            }
        }
    );

    window.addEventListener(
        "online",
        () => {
            EditorApp.setSyncStatus(
                "saving",
                "Reconnected"
            );

            EditorApp.syncPendingDraft();
        }
    );

    window.addEventListener(
        "offline",
        () => {
            EditorApp.setSyncStatus(
                "offline",
                "Offline"
            );

            EditorApp.showSaveStatus(
                "Offline. Changes will be kept locally until you reconnect.",
                "warning"
            );
        }
    );

    EditorApp.initializeEditor();
})();
