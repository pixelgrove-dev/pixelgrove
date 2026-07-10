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

function fillTopicSelector() {
  triviaTopics.forEach(topic => {
    const option = document.createElement("option");

    option.value = topic.id;
    option.textContent = topic.title;

    topicSelect.appendChild(option);
  });
}

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

  topic.information.forEach(paragraph => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    information.appendChild(p);
  });

  topic.questions.forEach(question => {
    const li = document.createElement("li");
    li.textContent = question;
    questionList.appendChild(li);
  });

  topic.answers.forEach(answer => {
    const li = document.createElement("li");
    li.textContent = answer;
    answerList.appendChild(li);
  });
}

function getSelectedTopic() {
  return triviaTopics.find(topic => topic.id === topicSelect.value);
}

function buildTopicLibrary() {

    topicLibrary.innerHTML = "";

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

loadTopicButton.addEventListener("click", () => {
  const selectedTopic = getSelectedTopic();
  renderWorksheet(selectedTopic);
});

printButton.addEventListener("click", () => {
  window.print();
});
