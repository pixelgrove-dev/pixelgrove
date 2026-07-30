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

/*==================================================
    FUNCTIONS
==================================================*/

/**
 * Populates the topic selector from the available trivia data.
 *
 * @returns {void}
 */
function fillTopicSelector() {
  /**
   * Adds one selectable option for a trivia topic.
   *
   * @param {Object} topic - Topic represented by the option.
   * @returns {void}
   */
  triviaTopics.forEach(topic => {
    const option = document.createElement("option");

    option.value = topic.id;
    option.textContent = topic.title;

    topicSelect.appendChild(option);
  });
}

/**
 * Replaces the worksheet contents with data from the selected topic.
 *
 * @param {Object} topic - Trivia topic to display.
 * @returns {void}
 */
function renderWorksheet(topic) {
  topicTitle.textContent = topic.title;
  topicDate.textContent = topic.date;

  mediaContent.innerHTML = "";
  
  if (topic.image) {
    const img = document.createElement("img");
    img.src = topic.image;
    img.alt = topic.title;
    img.className = "topic-image";

    mediaContent.appendChild(img);
}

    if (topic.youtube) {
        const videoLink = document.createElement("a");
        videoLink.href = topic.youtube;
        videoLink.textContent = "Watch Short Video";
        videoLink.target = "_blank";
        videoLink.className = "video-link";

        mediaContent.appendChild(videoLink);
}

    if (!topic.image && !topic.youtube) {
        mediaContent.textContent = "No picture or video added for this topic yet.";
}

  information.innerHTML = "";
  questionList.innerHTML = "";
  answerList.innerHTML = "";

  // Empty entries act as formatting markers, allowing source data to separate
  // paragraph groups without rendering blank DOM elements.
  let addParagraphBreak = false;

  /**
   * Renders a reading paragraph or records a break for the next paragraph.
   *
   * @param {string} text - Reading entry from the topic.
   * @returns {void}
   */
  topic.information.forEach(text => {
    if (text.trim() === "") {
      addParagraphBreak = true;
      return;
    }
    const p = document.createElement("p");
    p.textContent = text;
    
    if (addParagraphBreak) {
      p.classList.add("paragraph-break");
      addParagraphBreak = false;
    }

    information.appendChild(p);
});

  /**
   * Adds a question to the printable worksheet.
   *
   * @param {string} question - Question text to display.
   * @returns {void}
   */
  topic.questions.forEach(question => {
    const li = document.createElement("li");
    li.textContent = question;
    questionList.appendChild(li);
  });

  /**
   * Adds an answer to the worksheet's answer key.
   *
   * @param {string} answer - Answer text to display.
   * @returns {void}
   */
  topic.answers.forEach(answer => {
    const li = document.createElement("li");
    li.textContent = answer;
    answerList.appendChild(li);
  });
}

/**
 * Resolves the currently selected topic from the shared trivia data.
 *
 * @returns {Object|undefined} Selected topic, or `undefined` when no ID matches.
 */
function getSelectedTopic() {
  /**
   * Matches selector values to topic identifiers without type coercion.
   *
   * @param {Object} topic - Topic being considered.
   * @returns {boolean} Whether the topic is currently selected.
   */
  return triviaTopics.find(topic => topic.id === topicSelect.value);
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
    triviaTopics.forEach(topic => {

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

fillTopicSelector();

buildTopicLibrary();

renderWorksheet(triviaTopics[0]);

/**
 * Loads the selector's current topic into the worksheet.
 *
 * @returns {void}
 */
loadTopicButton.addEventListener("click", () => {
  const selectedTopic = getSelectedTopic();
  renderWorksheet(selectedTopic);
});

/**
 * Opens the browser print workflow for the rendered worksheet.
 *
 * @returns {void}
 */
printButton.addEventListener("click", () => {
  window.print();
});
