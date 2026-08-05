/**
 * Editor UI helpers and dynamic field creation.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;

    EditorApp.showSaveStatus = function (message, type = "") {
        elements.saveMessage.textContent = message;
        elements.saveMessage.className =
            type ? `save-message ${type}` : "save-message";
    };

    EditorApp.renumberQuestions = function () {
        const cards = elements.questionContainer.querySelectorAll(".question-card");

        cards.forEach((card, index) => {
            const heading = card.querySelector("h4");

            if (heading) {
                heading.textContent = `Question ${index + 1}`;
            }
        });
    };

    EditorApp.createParagraph = function (
        placeholder = "Enter another paragraph..."
    ) {
        const wrapper = document.createElement("div");
        wrapper.className = "paragraph-wrapper";

        const textarea = document.createElement("textarea");
        textarea.className = "reading-paragraph";
        textarea.placeholder = placeholder;
        textarea.addEventListener("input", EditorApp.handleEditorChange);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            wrapper.remove();
            EditorApp.updatePreview();
            EditorApp.scheduleAutosave();
        });

        wrapper.appendChild(textarea);
        wrapper.appendChild(removeButton);

        return wrapper;
    };

    EditorApp.createQuestionCard = function () {
        const wrapper = document.createElement("div");
        wrapper.className = "question-card";

        const number = elements.questionContainer.children.length + 1;

        wrapper.innerHTML = `
            <h4>Question ${number}</h4>

            <label>Question</label>
            <input
                class="question-input"
                type="text"
                placeholder="Enter the question..."
            >

            <label>Answer</label>
            <input
                class="answer-input"
                type="text"
                placeholder="Enter the answer..."
            >

            <label>Difficulty</label>
            <select class="question-difficulty">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
            </select>

            <button class="remove-button" type="button">
                Remove Question
            </button>
        `;

        const questionInput = wrapper.querySelector(".question-input");
        const answerInput = wrapper.querySelector(".answer-input");
        const difficultySelect = wrapper.querySelector(".question-difficulty");
        const removeButton = wrapper.querySelector(".remove-button");

        questionInput.addEventListener("input", EditorApp.handleEditorChange);
        answerInput.addEventListener("input", EditorApp.handleEditorChange);
        difficultySelect.addEventListener("change", EditorApp.handleEditorChange);

        removeButton.addEventListener("click", () => {
            wrapper.remove();
            EditorApp.renumberQuestions();
            EditorApp.updatePreview();
            EditorApp.scheduleAutosave();
        });

        return wrapper;
    };
})();
