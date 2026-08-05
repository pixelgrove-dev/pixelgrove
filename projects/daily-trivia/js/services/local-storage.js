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
function getLocalTopics() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];
}


/**
 * Replaces the persisted trivia topic collection.
 *
 * @param {Array<Object>} topics Complete topic collection to persist.
 * @returns {void}
 */
function saveLocalTopics(topics) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(topics)
    );
}


/**
 * Finds a persisted topic by its unique identifier.
 *
 * @param {string} id Identifier of the topic to retrieve.
 * @returns {Object|undefined} Matching topic, or undefined.
 */
function getLocalTopicById(id) {
    const topics =
        getLocalTopics();

    return topics.find(topic =>
        topic.id === id
    );
}


/**
 * Creates or updates one topic in localStorage.
 *
 * @param {Object} topic Topic to persist.
 * @returns {Object} Saved topic.
 */
function saveLocalTopic(topic) {
    const topics =
        getLocalTopics();

    const existingIndex =
        topics.findIndex(savedTopic =>
            savedTopic.id === topic.id
        );

    if (existingIndex >= 0) {
        topics[existingIndex] = topic;
    } else {
        topics.push(topic);
    }

    saveLocalTopics(topics);

    return topic;
}


/**
 * Deletes one topic from localStorage.
 *
 * @param {string} id Topic identifier.
 * @returns {void}
 */
function deleteLocalTopic(id) {
    const topics =
        getLocalTopics();

    const updatedTopics =
        topics.filter(topic =>
            topic.id !== id
        );

    saveLocalTopics(updatedTopics);
}