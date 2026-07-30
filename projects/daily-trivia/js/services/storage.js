/**
 * Defines the browser-storage boundary for user-created trivia topics.
 *
 * Centralizing serialization here prevents interface code from depending on
 * localStorage's string-only data format.
 */

const STORAGE_KEY = "groveTopics";

/**
 * Retrieves all persisted trivia topics.
 *
 * @returns {Array<Object>} Stored topics, or an empty array when none exist.
 */
function getTopics() {

    // New users have no stored value, so callers receive an iterable collection by default.
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

}

/**
 * Replaces the persisted trivia topic collection.
 *
 * @param {Array<Object>} topics - Complete topic collection to persist.
 * @returns {void}
 */
function saveTopics(topics) {

    // Local storage accepts strings only, so the collection crosses the boundary as JSON.
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(topics)
    );

}

/**
 * Finds a persisted topic by its unique identifier.
 *
 * @param {string} id - Identifier of the topic to retrieve.
 * @returns {Object|undefined} Matching topic, or `undefined` when it is not found.
 */
function getTopicById(id) {
    const topics = getTopics();

    /**
     * Uses exact ID equality to avoid treating distinct identifiers as interchangeable.
     *
     * @param {Object} topic - Stored topic being inspected.
     * @returns {boolean} Whether the topic has the requested identifier.
     */
    return topics.find(topic => topic.id === id);
}
