const topicGrid =
    document.getElementById("topic-grid");

const topics = getTopics();

renderTopics();

function renderTopics() {

    topicGrid.innerHTML = "";

    if(topics.length === 0){
        topicGrid.innerHTML = `<p>no saved topics yet.</p>`;
        return;
    }

    topics.forEach(topic => {
        const card = document.createElement("div");

        card.className = "topic-card";

        card.innerHTML = `
        <h2>📁 ${topic.title}</h2>
        
        <p>
            <strong>Category:</strong>
            ${topic.category}
        </p>

        <p>
            <strong>Reading:</strong>
            ${topic.information.length}
            paragraph(s)
        </p>

        p>
            <strong>Questions:</strong>
            ${topic.questions.length}
        </p>

        <button class="open-topic" type="button">
            Open Topic
        </button>
    `;

    const openButton = card.querySelector(".open-topic");

    openButton.addEventListener("click", () => {
        window.location.href = `editor.html?topic=${encodeURIComponent(topic.id)}`
    });

    topicGrid.appendChild(card);
        
    });

}