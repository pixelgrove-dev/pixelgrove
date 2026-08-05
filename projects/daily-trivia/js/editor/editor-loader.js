/**
 * Loads blank or existing topics into the editor.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;
    const state = EditorApp.state;

    EditorApp.loadTopicIntoEditor = function (
        topic,
        {
            preserveHistory = false
        } = {}
    ) {
        state.currentTopic = topic;
        state.currentTopicId = topic.id;

        elements.topicTitleInput.value =
            topic.title || "";

        elements.categorySelect.value =
            topic.category || "Animals";

        elements.difficultySelect.value =
            topic.difficulty || "Easy";

        elements.statusSelect.value =
            topic.status || "Draft";

        elements.imageUrlInput.value =
            topic.image || "";

        elements.youtubeUrlInput.value =
            topic.youtube || "";

        elements.editorStatus.textContent =
            `Editing: ${
                topic.title || "Untitled Topic"
            }`;

        elements.paragraphContainer.innerHTML = "";

        const paragraphs =
            Array.isArray(topic.information) &&
            topic.information.length > 0
                ? topic.information
                : [""];

        paragraphs.forEach(paragraphText => {
            const paragraph =
                EditorApp.createParagraph();

            paragraph.querySelector(
                ".reading-paragraph"
            ).value =
                typeof paragraphText === "string"
                    ? paragraphText
                    : paragraphText?.text || "";

            elements.paragraphContainer
                .appendChild(paragraph);
        });

        elements.questionContainer.innerHTML = "";

        const questions =
            Array.isArray(topic.questions) &&
            topic.questions.length > 0
                ? topic.questions
                : [
                    {
                        question: "",
                        answer: "",
                        difficulty: "Easy"
                    }
                ];

        questions.forEach(
            (questionData, index) => {
                const card =
                    EditorApp.createQuestionCard();

                const isLegacyQuestion =
                    typeof questionData === "string";

                card.querySelector(
                    ".question-input"
                ).value =
                    isLegacyQuestion
                        ? questionData
                        : questionData.question || "";

                card.querySelector(
                    ".answer-input"
                ).value =
                    isLegacyQuestion
                        ? topic.answers?.[index] || ""
                        : questionData.answer || "";

                card.querySelector(
                    ".question-difficulty"
                ).value =
                    isLegacyQuestion
                        ? topic.difficulty || "Easy"
                        : questionData.difficulty || "Easy";

                elements.questionContainer
                    .appendChild(card);
            }
        );

        EditorApp.renumberQuestions();
        EditorApp.updatePreview();

        if (!preserveHistory) {
            state.history = [];
            state.historyIndex = -1;

            EditorApp.recordHistorySnapshot({
                immediate: true
            });
        }
    };

    EditorApp.prepareBlankEditor = function () {
        state.currentTopic = null;

        elements.paragraphContainer.innerHTML = "";
        elements.questionContainer.innerHTML = "";

        elements.paragraphContainer.appendChild(
            EditorApp.createParagraph(
                "Enter the first paragraph..."
            )
        );

        elements.questionContainer.appendChild(
            EditorApp.createQuestionCard()
        );

        EditorApp.updatePreview();
    };

    EditorApp.initializeEditor = async function () {
        const user =
            await requireAuthenticatedUser();

        if (!user) {
            return;
        }

        EditorApp.setSyncStatus(
            "loading",
            "Loading"
        );

        EditorApp.showSaveStatus(
            "Loading editor..."
        );

        try {
            if (state.currentTopicId) {
                const savedTopic =
                    await getTopicById(
                        state.currentTopicId
                    );

                if (savedTopic) {
                    EditorApp.loadTopicIntoEditor(
                        savedTopic
                    );

                    if (savedTopic.updatedAt) {
                        state.lastSavedAt =
                            new Date(
                                savedTopic.updatedAt
                            );
                    }
                } else {
                    EditorApp.prepareBlankEditor();

                    EditorApp.showSaveStatus(
                        "That topic could not be found. A blank editor was opened.",
                        "warning"
                    );
                }
            } else {
                EditorApp.prepareBlankEditor();
                EditorApp.showSaveStatus("");
            }

            state.hasLoaded = true;

            EditorApp.setSyncStatus(
                navigator.onLine
                    ? "synced"
                    : "offline",
                navigator.onLine
                    ? "Synced"
                    : "Offline"
            );

            EditorApp.updateLastSavedLabel();

            EditorApp.recordHistorySnapshot({
                immediate: true
            });

            await EditorApp.syncPendingDraft({
                promptBeforeRestore: true
            });
        } catch (error) {
            console.error(
                "Editor initialization failed:",
                error
            );

            EditorApp.prepareBlankEditor();
            state.hasLoaded = true;

            EditorApp.setSyncStatus(
                "error",
                "Load error"
            );

            EditorApp.showSaveStatus(
                "The editor could not load the cloud topic.",
                "error"
            );
        }
    };
})();
