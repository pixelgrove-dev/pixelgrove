const topicGrid = document.getElementById("topic-grid");

renderTopics();

function renderTopics() {

    const topics = getTopics();

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
                ${topic.information.length} paragraph(s)
            </p>

            <p>
                <strong>Questions:</strong>
                ${topic.questions.length}
            </p>

            <div class="topic-actions">
                <button class="open-topic" type="button">
                    Open
                </button>
                <button class="delete-topic" type="button">
                    Delete
                </button>
        `;

        const openButton = card.querySelector(".open-topic");
        const deleteButton = card.querySelector(".delete-topic");
        
        openButton.addEventListener("click", () => {

        window.location.href =
            `editor.html?topic=${encodeURIComponent(topic.id)}`;
        });

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                `Delete "${topic.title}"?`
            );
            if (!confirmed) {
                return;
            }
            const topics = getTopics();
            const updatedTopics =
            topics.filter(savedTopic =>
                savedTopic.id !== topic.id
            );
            
            saveTopics(updatedTopics);
            
            renderTopics();
        });
        
        topicGrid.appendChild(card);
    });
}