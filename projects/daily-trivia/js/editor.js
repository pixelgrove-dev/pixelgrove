/*==================================================
    ELEMENT REFERENCES
==================================================*/

const topicTitleInput = document.getElementById("topic-title-input");
const categorySelect = document.getElementById("category");

const previewTitle = document.getElementById("preview-title");
const previewCategory = document.getElementById("preview-category");

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
            type="text"
            placeholder="Enter the question..."
        >

        <label>Answer</label>

        <input
            type="text"
            placeholder="Enter the answer..."
        >

        <label>Difficulty</label>

        <select>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
        </select>

        <button class="remove-button">
            Remove Question
        </button>
    `;

    const removeButton = wrapper.querySelector(".remove-button");

    removeButton.addEventListener("click", () => {

        wrapper.remove();

        renumberQuestions();

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

    });

}

/*==================================================
    EVENTS
==================================================*/

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