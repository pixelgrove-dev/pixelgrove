/*==================================================
    ELEMENT REFERENCES
==================================================*/

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


paragraphContainer.innerHTML = "";

paragraphContainer.appendChild(
    createParagraph("Enter the first paragraph...")
);

questionContainer.appendChild(
    createQuestionCard()
);

/*==================================================
    PARAGRAPH CREATION
==================================================*/

function createParagraph(placeholder = "Enter another paragraph...") {

    const wrapper = document.createElement("div");
    wrapper.className = "paragraph-wrapper";

    const textarea = document.createElement("textarea");
    textarea.className = "reading-paragraph";
    textarea.placeholder = placeholder;
    textarea.addEventListener("input", updatePreview);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
        wrapper.remove();
    });

    wrapper.appendChild(textarea);
    wrapper.appendChild(removeButton);

    return wrapper;
}

/*==================================================
    QUESTION CARD
==================================================*/

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

    removeButton.addEventListener("click", () => {
        wrapper.remove();
        renumberQuestions();
        updatePreview();
    });

    return wrapper;
}

function renumberQuestions() {

    const cards = questionContainer.querySelectorAll(".question-card");

    cards.forEach((card, index) => {

        card.querySelector("h4").textContent =
            `Question ${index + 1}`;

    });

}

function getYouTubeEmbedUrl(url) {
    if (!url) {
        return "";
    }

    try {
        const parsedUrl = new URL(url);

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
        return "";
    }

    return "";
}

function updatePreview() {

    previewTitle.textContent =
        topicTitleInput.value || "Your Topic Title";

    previewCategory.textContent =
        categorySelect.value;

    previewReading.innerHTML = "";

    const paragraphs =
        document.querySelectorAll(".reading-paragraph");

    paragraphs.forEach(textarea => {

        if(textarea.value.trim() === "")
            return;

        const p =
            document.createElement("p");

        p.textContent =
            textarea.value;

        previewReading.appendChild(p);

        previewQuestions.innerHTML = "";
        previewAnswers.innerHTML = "";
        
        const questionCards = questionContainer.querySelectorAll(".question-card");
        
        questionCards.forEach(card => {
            const question =
            card.querySelector(".question-input").value.trim();

            const answer =
            card.querySelector(".answer-input").value.trim();
            
            const difficulty =
            card.querySelector(".question-difficulty").value;
            
            if (question !== "") {
                const questionItem = document.createElement("li");
                questionItem.innerHTML = `${question}
                <span class="preview-difficulty">
                ${difficulty}
                </span>
                `;
                previewQuestions.appendChild(questionItem);
            }
            if (answer !== "") {
                const answerItem = document.createElement("li");
                answerItem.textContent = answer;
                previewAnswers.appendChild(answerItem);
            }
        });

    });
        previewMedia.innerHTML = "";
        const imageUrl = imageUrlInput.value.trim();
        const youtubeUrl = youtubeUrlInput.value.trim();
    
        if (imageUrl !== "") {
            const image = document.createElement("img");

            image.src = imageUrl;
            image.alt = topicTitleInput.value || "Trivia topic image";
            image.className = "preview-image";

            image.addEventListener("error", () => {
            image.remove();
        });

        previewMedia.appendChild(image);
    }
    
    const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);
    
    if (youtubeEmbedUrl !== "") {
        const videoFrame = document.createElement("iframe");

        videoFrame.src = youtubeEmbedUrl;
        videoFrame.title = "Related trivia video";
        videoFrame.className = "preview-video";
        videoFrame.loading = "lazy";
        videoFrame.allowFullscreen = true;

        previewMedia.appendChild(videoFrame);
    }
}

function collectTopicData() {
    const paragraphs = Array.from(
        document.querySelectorAll(".reading-paragraph")
    )
        .map(textarea => textarea.value.trim())
        .filter(paragraph => paragraph !== "");

    const questions = Array.from(
        document.querySelectorAll(".question-card")
    )
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
        .filter(item => item.question !== "");

    return {
        id: crypto.randomUUID(),
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

function saveTopic() {
    const topic = collectTopicData();
    const validationMessage = validateTopic(topic);

    if (validationMessage) {
        saveMessage.textContent = validationMessage;
        saveMessage.className = "save-message error";
        return;
    }

    const savedTopics =
        JSON.parse(localStorage.getItem("groveTopics")) || [];

    savedTopics.push(topic);

    localStorage.setItem(
        "groveTopics",
        JSON.stringify(savedTopics)
    );

    saveMessage.textContent = `"${topic.title}" was saved successfully.`;
    saveMessage.className = "save-message success";
}
/*==================================================
    EVENTS
==================================================*/
saveTopicButton.addEventListener("click", saveTopic);

addParagraphButton.addEventListener("click", () => {

    paragraphContainer.appendChild(
        createParagraph()
    );

});

addQuestionButton.addEventListener("click", () => {

    questionContainer.appendChild(
        createQuestionCard()
    );

});

topicTitleInput.addEventListener("input", updatePreview);

categorySelect.addEventListener("change", updatePreview);

updatePreview();

addQuestionButton.addEventListener("click", () => {
    questionContainer.appendChild(
        createQuestionCard()
    );

    updatePreview();
});

imageUrlInput.addEventListener("input", updatePreview);
youtubeUrlInput.addEventListener("input", updatePreview);