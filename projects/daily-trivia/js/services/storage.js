/**
 * Central storage service.
 *
 * Every page in Grove Activity Studio should communicate with storage
 * through this file only.
 */

const STORAGE_MODE = "cloud";
// Future options:
// "local"
// "cloud"
// "hybrid"


/**
 * Retrieves all topics from the active storage provider.
 *
 * @returns {Promise<Object[]>}
 */
async function getTopics() {

    switch (STORAGE_MODE) {

        case "cloud":
            return await getCloudTopics();

        case "local":
        default:
            return getLocalTopics();

    }

}


/**
 * Retrieves one topic by its identifier.
 *
 * @param {string} id Topic identifier.
 * @returns {Promise<Object|null|undefined>}
 */
async function getTopicById(id) {

    switch (STORAGE_MODE) {

        case "cloud":
            return await getCloudTopicById(id);

        case "local":
        default:
            return getLocalTopicById(id);

    }

}


/**
 * Creates or updates one topic using the active storage provider.
 *
 * @param {Object} topic Topic to persist.
 * @returns {Promise<Object>}
 */
async function saveTopicToStorage(topic) {

    switch (STORAGE_MODE) {

        case "cloud":
            return await saveCloudTopic(topic);

        case "local":
        default:
            return saveLocalTopic(topic);

    }

}


/**
 * Deletes one topic using the active storage provider.
 *
 * @param {string} id Topic identifier.
 * @returns {Promise<void>}
 */
async function deleteTopicFromStorage(id) {

    switch (STORAGE_MODE) {

        case "cloud":
            await deleteCloudTopic(id);
            return;

        case "local":
        default:
            deleteLocalTopic(id);

    }

}