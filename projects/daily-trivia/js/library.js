/**
 * Connects saved-topic data to the searchable library interface.
 *
 * Filtering and statistics remain separate services so this controller can
 * focus on rendering cards and responding to user actions.
 */

const topicGrid = document.getElementById("topic-grid");

const searchInput = document.getElementById("topic-search");

const categoryFilter = document.getElementById("category-filter");

const sortFilter = document.getElementById("sort-filter");

const statusFilter = document.getElementById("status-filter");

// Populate controls before the first render so the initial view follows the
// same filtering path as every later user interaction.
populateCategoryFilter();
applyFilters();

/**
 * Renders topic cards and connects each card's available actions.
 *
 * @param {Array<Object>} [topicsToDisplay=getTopics()] Topics to display in the library.
 * @returns {void}
 */
function renderTopics(topicsToDisplay = getTopics()) {

    topicGrid.innerHTML = "";

    // An explicit empty state reassures users that the library loaded successfully.
    if(topicsToDisplay.length === 0){
        topicGrid.innerHTML = `<p>no saved topics yet.</p>`;
        return;
    }

    topicsToDisplay.forEach(
    /**
     * Builds and appends the card for a saved topic.
     *
     * @param {Object} topic Topic represented by the card.
     * @returns {void}
     */
    topic => {

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
            
                <span class="topic-status ${topic.status === "Published" ? "published" : "draft"}">${topic.status || "Draft"}</span>

                <button class="favorite-topic" type="button" aria-label="Toggle favorite">
                    ${topic.favorite ? "⭐" : "☆"}
                </button>

                <button class="view-topic" type="button">
                    View
                </button>
                
                <button class="edit-topic" type="button">
                    Edit
                </button>

                <button class="duplicate-topic" type="button">
                    Duplicate
                </button>

                <button class="delete-topic" type="button">
                    Delete
                </button>
            </div>
        `;

        const viewButton = card.querySelector(".view-topic");
        const editButton = card.querySelector(".edit-topic");
        const duplicateButton = card.querySelector(".duplicate-topic");
        const deleteButton = card.querySelector(".delete-topic");
        const favoriteButton = card.querySelector(".favorite-topic");

        favoriteButton.addEventListener("click",
        /**
         * Toggles this topic's favorite status while preserving every other topic.
         *
         * @returns {void}
         */
        () => {
            const topics = getTopics();

            // Replacing the matching object avoids mutating data that may still be
            // referenced by the currently rendered card.
            const updatedTopics = topics.map(
            /**
             * Returns either the unchanged topic or an updated favorite copy.
             *
             * @param {Object} savedTopic Topic currently stored in the library.
             * @returns {Object} Topic to persist.
             */
            savedTopic => {
            if (savedTopic.id !== topic.id) {
                return savedTopic;
            }

            return {
                ...savedTopic,
                favorite: !savedTopic.favorite
            };

        });

        saveTopics(updatedTopics);
        applyFilters();
    });

        viewButton.addEventListener("click",
        /**
         * Opens the selected topic in the editor.
         *
         * @returns {void}
         */
        () => {

        // Encoding keeps generated URLs valid even when an ID contains reserved characters.
        window.location.href =
            `editor.html?topic=${encodeURIComponent(topic.id)}`;
        });

        editButton.addEventListener("click", () => {
            window.location.href = `editor.html?topic=${encodeURIComponent(topic.id)}`;
        });

        duplicateButton.addEventListener("click",
        /**
         * Creates an independent copy of the selected topic.
         *
         * @returns {void}
         */
        () => {
            const topics = getTopics();

            // A new ID prevents edits to the copy from overwriting the source topic;
            // favorites are reset so duplication does not alter the user's curated list.
            const duplicatedTopic = {
                ...topic,
                id: crypto.randomUUID(),
                title: `${topic.title} Copy`,
                favorite: false
            };



    topics.push(duplicatedTopic);

    saveTopics(topics);

    populateCategoryFilter();
    applyFilters();

});

        deleteButton.addEventListener("click",
        /**
         * Confirms and permanently removes the selected topic.
         *
         * @returns {void}
         */
        () => {
            const confirmed = confirm(
                `Delete "${topic.title}"?`
            );
            if (!confirmed) {
                return;
            }
            const topics = getTopics();

            // Persisting every nonmatching topic removes only the requested record.
            const updatedTopics = topics.filter(
            /**
             * Determines whether a saved topic should remain in the library.
             *
             * @param {Object} savedTopic Topic currently stored in the library.
             * @returns {boolean} Whether the topic should be retained.
             */
            savedTopic =>
                savedTopic.id !== topic.id
            );
            
            saveTopics(updatedTopics);
            
            populateCategoryFilter();
            applyFilters();
        });
        
        topicGrid.appendChild(card);
    });


}

/**
 * Applies the active search, category, and sorting controls before rendering.
 *
 * @returns {void}
 */
function applyFilters() {

    const topics = getTopics();

    const filteredTopics = filterTopics(
        topics,
        searchInput.value,
        categoryFilter.value,
        statusFilter.value
    );

    const sortedTopics = sortTopics(
        filteredTopics,
        sortFilter.value
    );

    renderTopics(sortedTopics);

}

/**
 * Rebuilds the category selector from the categories currently in storage.
 *
 * @returns {void}
 */
function populateCategoryFilter() {
    const topics = getTopics();

    const categories = getTopicCategories(topics);

    categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;

    categories.forEach(
    /**
     * Adds one selectable option for a stored category.
     *
     * @param {string} category Category label to add.
     * @returns {void}
     */
    category => {
        const option = document.createElement("option");

        option.value = category.toLowerCase();

        option.textContent = category;

        categoryFilter.appendChild(option)
    });
}

/*==================================================
    FILTER EVENTS
==================================================*/

searchInput.addEventListener(
    "input",
    applyFilters
);

categoryFilter.addEventListener(
    "change",
    applyFilters
);

sortFilter.addEventListener(
    "change",
    applyFilters
)

statusFilter.addEventListener(
    "change",
    applyFilters
)
