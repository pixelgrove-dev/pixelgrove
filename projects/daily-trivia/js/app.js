/**
 * Coordinates the legacy topic catalog with the interactive worksheet view.
 *
 * Topic data must load before this script because the page intentionally keeps
 * static content separate from rendering behavior.
 */

/*==================================================
    ELEMENT REFERENCES
==================================================*/

const topicSelect = document.getElementById("topic-select");
const loadTopicButton = document.getElementById("load-topic");
const printButton = document.getElementById("print-worksheet");

const topicLibrary = document.getElementById("topic-library");
const mediaContent = document.getElementById("media-content");
const topicTitle = document.getElementById("topic-title");
const topicDate = document.getElementById("topic-date");
const information = document.getElementById("information");
const questionList = document.getElementById("question-list");
const answerList = document.getElementById("answer-list");

const includeAnswersCheckbox = document.getElementById("include-answers");

const answersSection = document.getElementById("worksheet-answers");


/*==================================================
    FUNCTIONS
==================================================*/

/*==================================================
    TOPIC DATA
==================================================*/

let topics = [];

/**
 * Loads user-created topics from localStorage and merges in any
 * legacy topics from data.js that have not already been imported.
 *
 * @returns {void}
 */
function loadTopics() {
    const savedTopics = getTopics();

    const legacyTopics =
        typeof triviaTopics !== "undefined" &&
        Array.isArray(triviaTopics)
            ? triviaTopics
            : [];

    const savedTopicIds = new Set(
        savedTopics.map(topic => String(topic.id))
    );

    const missingLegacyTopics = legacyTopics.filter(topic => {
        return !savedTopicIds.has(String(topic.id));
    });

    topics = [
        ...savedTopics,
        ...missingLegacyTopics
    ];

    if (missingLegacyTopics.length > 0) {
        saveTopics(topics);
    }
}

/**
 * Populates the topic selector from the available trivia data.
 *
 * @returns {void}
 */
function fillTopicSelector() {
    topicSelect.innerHTML = "";

    topics.forEach(topic => {
        const option = document.createElement("option");

        option.value = String(topic.id);
        option.textContent =
            topic.title || "Untitled Topic";

        topicSelect.appendChild(option);
    });
}

/**
 * Displays one topic in the printable worksheet.
 *
 * Supports both legacy data.js topics and topics created in the editor.
 *
 * @param {Object} topic - Topic to display.
 * @returns {void}
 */
function renderWorksheet(topic) {
    if (!topic) {
        console.warn("No worksheet topic was provided.");
        return;
    }

    /* --------------------------------------------------
       Title and date
    -------------------------------------------------- */

    topicTitle.textContent =
        topic.title || "Untitled Topic";

    const topicDateValue =
        topic.date ||
        topic.updatedAt ||
        topic.createdAt ||
        "";

    if (topicDateValue) {
        const parsedDate = new Date(topicDateValue);

        topicDate.textContent = Number.isNaN(parsedDate.getTime())
            ? String(topicDateValue).replace(/^Date:\s*/i, "")
            : parsedDate.toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
    } else {
        topicDate.textContent = "";
    }

    /* --------------------------------------------------
       Media
    -------------------------------------------------- */

    mediaContent.innerHTML = "";

    if (topic.image) {
        const image = document.createElement("img");

        image.src = topic.image;
        image.alt = topic.title
            ? `Image for ${topic.title}`
            : "Worksheet topic image";

        image.className = "topic-image";

        mediaContent.appendChild(image);
    }

    if (topic.youtube) {
        const videoLink = document.createElement("a");

        videoLink.href = topic.youtube;
        videoLink.textContent = "Watch Short Video";
        videoLink.target = "_blank";
        videoLink.rel = "noopener noreferrer";
        videoLink.className = "video-link";

        mediaContent.appendChild(videoLink);
    }

    if (!topic.image && !topic.youtube) {
        const placeholder = document.createElement("div");

        placeholder.className = "media-placeholder";
        placeholder.textContent =
            "No picture or video has been added for this topic.";

        mediaContent.appendChild(placeholder);
    }

    /* --------------------------------------------------
       Clear previous worksheet content
    -------------------------------------------------- */

    information.innerHTML = "";
    questionList.innerHTML = "";
    answerList.innerHTML = "";

    /* --------------------------------------------------
       Reading paragraphs
    -------------------------------------------------- */

    const paragraphs = Array.isArray(topic.information)
        ? topic.information
        : [];

    let addParagraphBreak = false;

    paragraphs.forEach(entry => {
        const text =
            typeof entry === "string"
                ? entry
                : entry?.text || "";

        if (text.trim() === "") {
            addParagraphBreak = true;
            return;
        }

        const paragraph = document.createElement("p");

        paragraph.textContent = text;

        if (addParagraphBreak) {
            paragraph.classList.add("paragraph-break");
            addParagraphBreak = false;
        }

        information.appendChild(paragraph);
    });

    if (paragraphs.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent =
            "No reading information has been added.";

        information.appendChild(emptyMessage);
    }

    /* --------------------------------------------------
       Questions and answers
    -------------------------------------------------- */

    const questions = Array.isArray(topic.questions)
        ? topic.questions
        : [];

    questions.forEach(questionItem => {
        const questionText =
            typeof questionItem === "string"
                ? questionItem
                : questionItem?.question ||
                  questionItem?.text ||
                  "";

        if (!questionText.trim()) {
            return;
        }

        const listItem = document.createElement("li");

        listItem.textContent = questionText;

        questionList.appendChild(listItem);
    });

    const legacyAnswers = Array.isArray(topic.answers)
        ? topic.answers
        : [];

    const embeddedAnswers = questions
        .map(questionItem => {
            if (
                typeof questionItem === "object" &&
                questionItem !== null
            ) {
                return questionItem.answer || "";
            }

            return "";
        })
        .filter(answer => answer.trim() !== "");

    const answers =
        legacyAnswers.length > 0
            ? legacyAnswers
            : embeddedAnswers;

    answers.forEach(answerItem => {
        const answerText =
            typeof answerItem === "string"
                ? answerItem
                : answerItem?.answer ||
                  answerItem?.text ||
                  "";

        if (!answerText.trim()) {
            return;
        }

        const listItem = document.createElement("li");

        listItem.textContent = answerText;

        answerList.appendChild(listItem);
    });

    if (questionList.children.length === 0) {
        const listItem = document.createElement("li");

        listItem.textContent =
            "No comprehension questions have been added.";

        questionList.appendChild(listItem);
    }

    if (answerList.children.length === 0) {
        const listItem = document.createElement("li");

        listItem.textContent =
            "No answers have been added.";

        answerList.appendChild(listItem);
    }

    /* --------------------------------------------------
       Keep selector synchronized
    -------------------------------------------------- */

    if (topicSelect && topic.id !== undefined) {
        topicSelect.value = String(topic.id);
    }
}

/**
 * Resolves the currently selected topic from the shared trivia data.
 *
 * @returns {Object|undefined} Selected topic, or `undefined` when no ID matches.
 */
function getSelectedTopic() {
    return topics.find(topic => {
        return String(topic.id) === topicSelect.value;
    });
}

/**
 * Builds the collection of topic cards shown in the library.
 *
 * @returns {void}
 */
function buildTopicLibrary() {

    // Rebuilding from an empty container prevents duplicate cards on repeated calls.
    topicLibrary.innerHTML = "";

    /**
     * Creates an interactive library card for a trivia topic.
     *
     * @param {Object} topic - Topic represented by the card.
     * @returns {void}
     */
    topics.forEach(topic => {

        const card = document.createElement("div");

        card.className = "topic-card";

        card.innerHTML = `
            <div class="topic-info">
                <h3>${topic.title}</h3>
                <p>${topic.category}</p>
            </div>

            <button class="open-topic">
                Open
            </button>
        `;

        const button = card.querySelector("button");

        /**
         * Opens the topic associated with this card in the shared worksheet view.
         *
         * @returns {void}
         */
        button.addEventListener("click", () => {

            renderWorksheet(topic);

        });

        topicLibrary.appendChild(card);

    });

}

/*==================================================
    APPLICATION STARTUP
==================================================*/
loadTopics();

fillTopicSelector();

buildTopicLibrary();

if (topics.length > 0) {
  renderWorksheet(topics[0]);
} else {
  console.warn("No worksheet topics are available.");
}

/**
 * Loads the selector's current topic into the worksheet.
 *
 * @returns {void}
 */
loadTopicButton.addEventListener("click", () => {
  const selectedTopic = getSelectedTopic();

  if (!selectedTopic) {
    console.warn("The selected topic could not be found.");
    return;
  }
  
  renderWorksheet(selectedTopic);
});

/**
 * Applies the selected print settings.
 *
 * @returns {void}
 */
function applyPrintOptions() {
  const includeAnswersCheckbox =
    document.getElementById("include-answers");

  const answersSection =
    document.getElementById("worksheet-answers");

  if (!includeAnswersCheckbox || !answersSection) {
    console.warn("Print option elements could not be found.");
    return;
  }

  answersSection.classList.toggle(
    "exclude-from-print",
    !includeAnswersCheckbox.checked
  );
}

/**
 * Applies the print settings and opens the browser print dialog.
 *
 * @returns {void}
 */
printButton.addEventListener("click", () => {
  applyPrintOptions();
  window.print();
});

/**
 * Rechecks the print settings immediately before printing.
 *
 * This also covers printing with Ctrl + P.
 *
 * @returns {void}
 */
window.addEventListener("beforeprint", () => {
  applyPrintOptions();
});

/**
 * Restores the answer key after the print dialog closes.
 *
 * @returns {void}
 */
window.addEventListener("afterprint", () => {
  const answersSection =
    document.getElementById("worksheet-answers");

  if (answersSection) {
    answersSection.classList.remove(
      "exclude-from-print"
    );
  }
});


