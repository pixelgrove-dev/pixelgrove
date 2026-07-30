/**
 * Manages topic editing, validation, persistence, and the live worksheet preview.
 *
 * Keeping these interactions together ensures form changes and preview output
 * remain synchronized through one browser-side controller.
 */

/*==================================================
    ELEMENT REFERENCES
==================================================*/

const urlParameters = new URLSearchParams(window.location.search);
const topicId = urlParameters.get("topic");

let currentTopicId = topicId;

const difficultySelect = document.getElementById("difficulty");
const saveTopicButton = document.getElementById("save-topic");
const saveMessage = document.getElementById("save-message");

const topicTitleInput = document.getElementById("topic-title-input");
const categorySelect = document.getElementById("category");

const imageUrlInput = document.getElementById("image-url");
const youtubeUrlInput = document.getElementById("youtube-url");
const previewMedia = document.getElementById("preview-media");

const previewTitle = document.getElementById("preview-title");
const previewCategory = document.getElementById("preview-category");

const previewQuestions = document.getElementById("preview-questions");
const previewAnswers = document.getElementById("preview-answers");

const paragraphContainer = document.getElementById("paragraph-container");
const addParagraphButton = document.getElementById("add-paragraph");

const questionContainer = document.getElementById("question-container");
const addQuestionButton = document.getElementById("add-question");


const previewReading = document.getElementById("preview-reading");


/*==================================================
    PARAGRAPH CREATION
==================================================*/

/**
 * Builds an editable reading paragraph with preview and removal behavior.
 *
 * @param {string} [placeholder="Enter another paragraph..."] - Guidance shown
 * when the paragraph is empty.
 * @returns {HTMLDivElement} The complete paragraph editor row.
 */
function createParagraph(placeholder = "Enter another paragraph...") {

    const wrapper = document.createElement("div");
    wrapper.className = "paragraph-wrapper";

    const textarea = document.createElement("textarea");
    textarea.className = "reading-paragraph";
    textarea.placeholder = placeholder;
    textarea.addEventListener("input", updatePreview);

    const removeButton = document.createElement("button");
    removeButton.type = "button"
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";

    /**
     * Removes this paragraph and immediately reconciles the preview.
     *
     * @returns {void}
     */
    removeButton.addEventListener("click", () => {
        wrapper.remove();
        updatePreview();
    });

    wrapper.appendChild(textarea);
    wrapper.appendChild(removeButton);

    return wrapper;
}

/*==================================================
    QUESTION CARD
==================================================*/

/**
 * Builds a question editor card and connects it to the live preview.
 *
 * @returns {HTMLDivElement} The complete question editor card.
 */
function createQuestionCard() {
    const wrapper = document.createElement("div");
    wrapper.className = "question-card";

    const number = questionContainer.children.length + 1;

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

    questionInput.addEventListener("input", updatePreview);
    answerInput.addEventListener("input", updatePreview);
    difficultySelect.addEventListener("change", updatePreview);

    /**
     * Removes this card and restores sequential numbering for the remaining cards.
     *
     * @returns {void}
     */
    removeButton.addEventListener("click", () => {
        wrapper.remove();
        renumberQuestions();
        updatePreview();
    });

    return wrapper;
}

/**
 * Updates question headings so their displayed order matches their DOM order.
 *
 * @returns {void}
 */
function renumberQuestions() {

    const cards = questionContainer.querySelectorAll(".question-card");

    /**
     * Assigns a human-friendly, one-based label after cards are removed or added.
     *
     * @param {Element} card - Question card being relabeled.
     * @param {number} index - Zero-based position of the card.
     * @returns {void}
     */
    cards.forEach((card, index) => {

        card.querySelector("h4").textContent =
            `Question ${index + 1}`;

    });

}

/**
 * Converts a supported YouTube watch or short URL into an embeddable URL.
 *
 * Invalid and unsupported URLs intentionally produce an empty string so the
 * preview can omit the video without interrupting editor input.
 *
 * @param {string} url - User-provided YouTube URL.
 * @returns {string} An embed URL, or an empty string when none can be derived.
 */
function getYouTubeEmbedUrl(url) {
    if (!url) {
        return "";
    }

    try {
        const parsedUrl = new URL(url);

        // Short links store the video ID in the path instead of a query parameter.
        if (parsedUrl.hostname.includes("youtu.be")) {
            const videoId = parsedUrl.pathname.slice(1);
            return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsedUrl.hostname.includes("youtube.com")) {
            const videoId = parsedUrl.searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
    } catch (error) {
        // URLs are entered incrementally, so malformed intermediate values are expected.
        return "";
    }

    return "";
}

// A topic query parameter switches the editor from creation mode to edit mode.
if (topicId) {
  const savedTopic = getTopicById(topicId);

  if (savedTopic) {
    loadTopicIntoEditor(savedTopic);
  } else {
    paragraphContainer.appendChild(
      createParagraph("Enter the first paragraph...")
    );

    questionContainer.appendChild(
      createQuestionCard()
    );

    updatePreview();
  }
} else {
  paragraphContainer.appendChild(
    createParagraph("Enter the first paragraph...")
  );

  questionContainer.appendChild(
    createQuestionCard()
  );

  updatePreview();
}

/**
 * Rebuilds the visible topic preview from the current editor field values.
 *
 * @returns {void}
 */
function updatePreview() {

    previewTitle.textContent =
        topicTitleInput.value || "Your Topic Title";

    previewCategory.textContent =
        categorySelect.value;

    /*
        Reading preview
    */

    previewReading.innerHTML = "";

    const paragraphs =
        document.querySelectorAll(".reading-paragraph");

    /**
     * Adds only meaningful paragraphs so blank editor rows do not create gaps.
     *
     * @param {HTMLTextAreaElement} textarea - Paragraph input to render.
     * @returns {void}
     */
    paragraphs.forEach(textarea => {

        if (textarea.value.trim() === "") {
            return;
        }

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            textarea.value;

        previewReading.appendChild(paragraph);

    });

    /*
        Question and answer preview
    */

    previewQuestions.innerHTML = "";
    previewAnswers.innerHTML = "";

    const questionCards =
        questionContainer.querySelectorAll(".question-card");

    /**
     * Renders independently populated questions and answers in their previews.
     *
     * @param {Element} card - Question card whose current values are rendered.
     * @returns {void}
     */
    questionCards.forEach(card => {

        const question =
            card.querySelector(".question-input")
                .value
                .trim();

        const answer =
            card.querySelector(".answer-input")
                .value
                .trim();

        const difficulty =
            card.querySelector(".question-difficulty")
                .value;

        // Questions and answers are independent so partially completed cards remain useful.
        if (question !== "") {

            const questionItem =
                document.createElement("li");

            questionItem.innerHTML = `
                ${question}
                <span class="preview-difficulty">
                    ${difficulty}
                </span>
            `;

            previewQuestions.appendChild(questionItem);

        }

        if (answer !== "") {

            const answerItem =
                document.createElement("li");

            answerItem.textContent = answer;

            previewAnswers.appendChild(answerItem);

        }

    });

    /*
        Media preview
    */

    previewMedia.innerHTML = "";

    const imageUrl =
        imageUrlInput.value.trim();

    const youtubeUrl =
        youtubeUrlInput.value.trim();

    if (imageUrl !== "") {

        const image =
            document.createElement("img");

        image.src = imageUrl;

        image.alt =
            topicTitleInput.value ||
            "Trivia topic image";

        image.className = "preview-image";

        /**
         * Hides broken images rather than leaving a failed-media icon in the preview.
         *
         * @returns {void}
         */
        image.addEventListener("error", () => {
            image.remove();
        });

        previewMedia.appendChild(image);

    }

    const youtubeEmbedUrl =
        getYouTubeEmbedUrl(youtubeUrl);

    if (youtubeEmbedUrl !== "") {

        const videoFrame =
            document.createElement("iframe");

        videoFrame.src = youtubeEmbedUrl;
        videoFrame.title = "Related trivia video";
        videoFrame.className = "preview-video";
        videoFrame.loading = "lazy";
        videoFrame.allowFullscreen = true;

        previewMedia.appendChild(videoFrame);

    }

}

/**
 * Serializes the editor state into the topic shape used by persistent storage.
 *
 * @returns {Object} A normalized topic ready for validation and storage.
 */
function collectTopicData() {
    const paragraphs = Array.from(
        document.querySelectorAll(".reading-paragraph")
    )
        /**
         * Normalizes paragraph whitespace before empty entries are discarded.
         *
         * @param {HTMLTextAreaElement} textarea - Paragraph input to normalize.
         * @returns {string} Trimmed paragraph text.
         */
        .map(textarea => textarea.value.trim())
        /**
         * Prevents unused paragraph rows from being persisted.
         *
         * @param {string} paragraph - Normalized paragraph text.
         * @returns {boolean} Whether the paragraph contains content.
         */
        .filter(paragraph => paragraph !== "");

    const questions = Array.from(
        document.querySelectorAll(".question-card")
    )
        /**
         * Converts a question card into the storage representation.
         *
         * @param {Element} card - Question card to serialize.
         * @returns {{question: string, answer: string, difficulty: string}} Serialized question.
         */
        .map(card => {
            const question = card
                .querySelector(".question-input")
                .value
                .trim();

            const answer = card
                .querySelector(".answer-input")
                .value
                .trim();

            const difficulty = card
                .querySelector(".question-difficulty")
                .value;

            return {
                question,
                answer,
                difficulty
            };
        })
        /**
         * Excludes unfinished cards because a question is the minimum usable entry.
         *
         * @param {{question: string}} item - Serialized question candidate.
         * @returns {boolean} Whether the entry includes a question.
         */
        .filter(item => item.question !== "");

    return {
        // Reusing the ID is what makes saving an edited topic replace the original.
        id: currentTopicId || crypto.randomUUID(),
        title: topicTitleInput.value.trim(),
        category: categorySelect.value,
        difficulty: difficultySelect.value,
        image: imageUrlInput.value.trim(),
        youtube: youtubeUrlInput.value.trim(),
        information: paragraphs,
        questions,
        createdAt: new Date().toISOString()
    };
}

/**
 * Checks whether a topic contains the minimum content required for saving.
 *
 * @param {Object} topic - Normalized topic data to validate.
 * @returns {string} A user-facing validation message, or an empty string if valid.
 */
function validateTopic(topic) {
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
}

/**
 * Validates and persists the current topic, then reports the result to the user.
 *
 * @returns {void}
 */
function saveTopic() {
    const topic = collectTopicData();

    const validationMessage = validateTopic(topic);

    if (validationMessage) {
        saveMessage.textContent = validationMessage;
        saveMessage.className = "save-message error";
        return;
    }

    const savedTopics = getTopics();

    /**
     * Locates an existing record so edits do not create duplicate topics.
     *
     * @param {Object} saved - Previously persisted topic.
     * @returns {boolean} Whether the stored topic has the current topic's ID.
     */
    const existingIndex = savedTopics.findIndex(saved =>
        saved.id === topic.id
    );

    const currentTime = new Date().toISOString();
    // Preserve the original creation timestamp when editing.

    if (existingIndex >= 0) {

        const existingTopic = savedTopics[existingIndex];
        topic.createdAt = existingTopic.createdAt || currentTime;

        topic.updatedAt = currentTime;

        savedTopics[existingIndex] = topic;
    } else {

        topic.createdAt = currentTime;

    topic.updatedAt = currentTime;

    savedTopics.push(topic);

    currentTopicId = topic.id;
}

saveTopics(savedTopics);

saveMessage.textContent = `"${topic.title}" was saved successfully.`;
saveMessage.className = "save-message success";
}

/**
 * Populates the editor from a stored topic while providing safe empty defaults.
 *
 * @param {Object} topic - Stored topic to edit.
 * @returns {void}
 */
function loadTopicIntoEditor(topic) {
    topicTitleInput.value = topic.title || "";
    categorySelect.value = topic.category || "Animals";
    difficultySelect.value = topic.difficulty || "Easy";
    imageUrlInput.value = topic.image || "";
    youtubeUrlInput.value = topic.youtube || "";

    paragraphContainer.innerHTML = "";
    document.getElementById("editor-status").textContent =
    "Editing Existing Topic";
    
    // Keep one editable row available even when older data has no reading content.
    const paragraphs =
    topic.information && topic.information.length > 0 
    ? topic.information
    : [""];
    
    /**
     * Recreates a paragraph editor row from stored text.
     *
     * @param {string} paragraphText - Stored paragraph content.
     * @returns {void}
     */
    paragraphs.forEach(paragraphText => {
        const paragraph = createParagraph();
        const textarea = paragraph.querySelector(".reading-paragraph");
        
        textarea.value = paragraphText;

        paragraphContainer.appendChild(paragraph);
    });
    
    questionContainer.innerHTML = "";
    
    // A default card keeps the editor usable for topics saved without questions.
    const questions = topic.questions && topic.questions.length > 0
      ? topic.questions
      : [
          {
            question: "",
            answer: "",
            difficulty: "Easy"
          }
        ];

        /**
         * Recreates a question card from its stored representation.
         *
         * @param {Object} questionData - Stored question values.
         * @returns {void}
         */
        questions.forEach(questionData => {
            const card = createQuestionCard();

        card.querySelector(".question-input").value = questionData.question || "";
        card.querySelector(".answer-input").value = questionData.answer || "";
        
        card.querySelector(".question-difficulty").value = questionData.difficulty || "Easy";
        questionContainer.appendChild(card);
    });

  renumberQuestions();
  updatePreview();
}

/*==================================================
    EVENTS
==================================================*/
saveTopicButton.addEventListener("click", saveTopic);

/**
 * Adds another reading input while leaving preview updates to subsequent input.
 *
 * @returns {void}
 */
addParagraphButton.addEventListener("click", () => {

    paragraphContainer.appendChild(
        createParagraph()
    );

});


topicTitleInput.addEventListener("input", updatePreview);

categorySelect.addEventListener("change", updatePreview);

updatePreview();

/**
 * Adds a question card and refreshes the preview to keep both views synchronized.
 *
 * @returns {void}
 */
addQuestionButton.addEventListener("click", () => {
    questionContainer.appendChild(
        createQuestionCard()
    );

    updatePreview();
});

imageUrlInput.addEventListener("input", updatePreview);
youtubeUrlInput.addEventListener("input", updatePreview);
