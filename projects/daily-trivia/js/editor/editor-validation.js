/**
 * Editor data collection and validation.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;
    const state = EditorApp.state;

    EditorApp.collectTopicData = function () {
        const paragraphs = Array.from(
            document.querySelectorAll(".reading-paragraph")
        )
            .map(textarea => textarea.value.trim())
            .filter(Boolean);

        const questions = Array.from(
            elements.questionContainer.querySelectorAll(".question-card")
        )
            .map(card => ({
                question:
                    card.querySelector(".question-input").value.trim(),

                answer:
                    card.querySelector(".answer-input").value.trim(),

                difficulty:
                    card.querySelector(".question-difficulty").value
            }))
            .filter(item => item.question);

        const now = new Date().toISOString();

        return {
            id: state.currentTopicId || crypto.randomUUID(),
            title: elements.topicTitleInput.value.trim(),
            category: elements.categorySelect.value,
            difficulty: elements.difficultySelect.value,
            status: elements.statusSelect.value,
            favorite: Boolean(state.currentTopic?.favorite),
            image: elements.imageUrlInput.value.trim(),
            youtube: elements.youtubeUrlInput.value.trim(),
            information: paragraphs,
            questions,
            createdAt: state.currentTopic?.createdAt || now,
            updatedAt: now
        };
    };

    EditorApp.validateTopic = function (topic) {
        if (!topic.title) {
            return "Please enter a topic title.";
        }

        if (topic.information.length === 0) {
            return "Please add at least one reading paragraph.";
        }

        if (topic.questions.length === 0) {
            return "Please add at least one question.";
        }

        return "";
    };
})();
