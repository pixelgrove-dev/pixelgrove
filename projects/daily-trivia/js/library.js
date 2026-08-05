/**
 * Connects cloud topic data to the searchable library interface.
 */

/*==================================================
    ELEMENT REFERENCES
==================================================*/

const topicGrid =
    document.getElementById("topic-grid");

const searchInput =
    document.getElementById("topic-search");

const categoryFilter =
    document.getElementById("category-filter");

const sortFilter =
    document.getElementById("sort-filter");

const statusFilter =
    document.getElementById("status-filter");


/*==================================================
    LIBRARY STATE
==================================================*/

let libraryTopics = [];


/*==================================================
    INITIALIZATION
==================================================*/

/**
 * Verifies authentication and loads the signed-in user's cloud topics.
 *
 * @returns {Promise<void>}
 */
async function initializeLibrary() {

    const user =
        await requireAuthenticatedUser();

    if (!user) {
        return;
    }

    showLibraryLoading();

    try {

        libraryTopics =
            await getTopics();

        populateCategoryFilter();
        applyFilters();

    } catch (error) {

        console.error(
            "Library loading failed:",
            error
        );

        showLibraryError(
            "Your topic library could not be loaded."
        );

    }

}


/*==================================================
    FEEDBACK STATES
==================================================*/

function showLibraryLoading() {

    topicGrid.innerHTML = `
        <div class="empty-state">
            <h2>Loading library...</h2>

            <p>
                Gathering your topics from the cloud.
            </p>
        </div>
    `;

}


function showLibraryError(message) {

    topicGrid.innerHTML = `
        <div class="empty-state">
            <h2>Library unavailable</h2>

            <p>${message}</p>
        </div>
    `;

}


/*==================================================
    TOPIC RENDERING
==================================================*/

/**
 * Renders topic cards and connects each card's actions.
 *
 * @param {Object[]} topicsToDisplay Topics to display.
 * @returns {void}
 */
function renderTopics(topicsToDisplay = libraryTopics) {

    topicGrid.innerHTML = "";

    if (topicsToDisplay.length === 0) {

        topicGrid.innerHTML = `
            <div class="empty-state">

                <h2>No matching topics</h2>

                <p>
                    Create a topic or adjust your current
                    search and filter settings.
                </p>

                <a
                    href="editor.html"
                    class="primary-button"
                >
                    Create Topic
                </a>

            </div>
        `;

        return;
    }

    topicsToDisplay.forEach(topic => {

        const information =
            Array.isArray(topic.information)
                ? topic.information
                : [];

        const questions =
            Array.isArray(topic.questions)
                ? topic.questions
                : [];

        const card =
            document.createElement("div");

        card.className =
            "topic-card";

        card.innerHTML = `
            <h2>
                📁 ${topic.title || "Untitled Topic"}
            </h2>

            <p>
                <strong>Category:</strong>
                ${topic.category || "Uncategorized"}
            </p>

            <p>
                <strong>Reading:</strong>
                ${information.length} paragraph(s)
            </p>

            <p>
                <strong>Questions:</strong>
                ${questions.length}
            </p>

            <div class="topic-actions">

                <span class="topic-status ${
                    topic.status === "Published"
                        ? "published"
                        : "draft"
                }">
                    ${topic.status || "Draft"}
                </span>

                <button
                    class="favorite-topic"
                    type="button"
                    aria-label="${
                        topic.favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }"
                >
                    ${topic.favorite ? "⭐" : "☆"}
                </button>

                <button
                    class="open-topic"
                    type="button"
                >
                    Open
                </button>

                <button
                    class="duplicate-topic"
                    type="button"
                >
                    Duplicate
                </button>

                <button
                    class="delete-topic"
                    type="button"
                >
                    Delete
                </button>

            </div>
        `;

        const favoriteButton =
            card.querySelector(".favorite-topic");

        const openButton =
            card.querySelector(".open-topic");

        const duplicateButton =
            card.querySelector(".duplicate-topic");

        const deleteButton =
            card.querySelector(".delete-topic");


        favoriteButton.addEventListener(
            "click",
            async () => {

                await toggleFavorite(
                    topic,
                    favoriteButton
                );

            }
        );


        openButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    `editor.html?topic=${
                        encodeURIComponent(topic.id)
                    }`;

            }
        );


        duplicateButton.addEventListener(
            "click",
            async () => {

                await duplicateTopic(
                    topic,
                    duplicateButton
                );

            }
        );


        deleteButton.addEventListener(
            "click",
            async () => {

                await removeTopic(
                    topic,
                    deleteButton
                );

            }
        );


        topicGrid.appendChild(card);

    });

}


/*==================================================
    TOPIC ACTIONS
==================================================*/

/**
 * Toggles a topic's favorite status in cloud storage.
 *
 * @param {Object} topic Topic being changed.
 * @param {HTMLButtonElement} button Triggering button.
 * @returns {Promise<void>}
 */
async function toggleFavorite(topic, button) {

    button.disabled = true;

    const updatedTopic = {
        ...topic,
        favorite: !topic.favorite
    };

    try {

        const savedTopic =
            await saveTopicToStorage(
                updatedTopic
            );

        replaceTopicInState(savedTopic);

        applyFilters();

    } catch (error) {

        console.error(
            "Favorite update failed:",
            error
        );

        button.disabled = false;

    }

}


/**
 * Creates an independent cloud copy of a topic.
 *
 * @param {Object} topic Topic to duplicate.
 * @param {HTMLButtonElement} button Triggering button.
 * @returns {Promise<void>}
 */
async function duplicateTopic(topic, button) {

    button.disabled = true;
    button.textContent = "Duplicating...";

    const currentTime =
        new Date().toISOString();

    const duplicatedTopic = {
        ...topic,

        id:
            crypto.randomUUID(),

        title:
            `${topic.title} Copy`,

        favorite:
            false,

        createdAt:
            currentTime,

        updatedAt:
            currentTime
    };

    try {

        const savedTopic =
            await saveTopicToStorage(
                duplicatedTopic
            );

        libraryTopics.push(savedTopic);

        populateCategoryFilter();
        applyFilters();

    } catch (error) {

        console.error(
            "Topic duplication failed:",
            error
        );

        button.disabled = false;
        button.textContent = "Duplicate";

    }

}


/**
 * Confirms and deletes a topic from cloud storage.
 *
 * @param {Object} topic Topic to remove.
 * @param {HTMLButtonElement} button Triggering button.
 * @returns {Promise<void>}
 */
async function removeTopic(topic, button) {

    const confirmed =
        window.confirm(
            `Delete "${topic.title}"?`
        );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        await deleteTopicFromStorage(
            topic.id
        );

        libraryTopics =
            libraryTopics.filter(savedTopic =>
                savedTopic.id !== topic.id
            );

        populateCategoryFilter();
        applyFilters();

    } catch (error) {

        console.error(
            "Topic deletion failed:",
            error
        );

        button.disabled = false;
        button.textContent = "Delete";

    }

}


/**
 * Replaces one topic in the in-memory library state.
 *
 * @param {Object} updatedTopic Newly saved topic.
 * @returns {void}
 */
function replaceTopicInState(updatedTopic) {

    libraryTopics =
        libraryTopics.map(topic =>
            topic.id === updatedTopic.id
                ? updatedTopic
                : topic
        );

}


/*==================================================
    FILTERING AND SORTING
==================================================*/

function applyFilters() {

    const filteredTopics =
        filterTopics(
            libraryTopics,
            searchInput.value,
            categoryFilter.value,
            statusFilter.value
        );

    const sortedTopics =
        sortTopics(
            filteredTopics,
            sortFilter.value
        );

    renderTopics(sortedTopics);

}


function populateCategoryFilter() {

    const previouslySelectedCategory =
        categoryFilter.value || "all";

    const categories =
        getTopicCategories(
            libraryTopics
        );

    categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.toLowerCase();

        option.textContent =
            category;

        categoryFilter.appendChild(
            option
        );

    });

    const optionStillExists =
        Array.from(categoryFilter.options)
            .some(option =>
                option.value ===
                previouslySelectedCategory
            );

    categoryFilter.value =
        optionStillExists
            ? previouslySelectedCategory
            : "all";

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
);

statusFilter.addEventListener(
    "change",
    applyFilters
);


/*==================================================
    START APPLICATION
==================================================*/

initializeLibrary();