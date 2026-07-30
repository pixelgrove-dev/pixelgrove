/**
 * Returns the most recent meaningful timestamp for a topic.
 *
 * @param {Object} topic
 * @returns {Date}
 */
function getTopicDate(topic) {

    return new Date(

        topic.updatedAt ||

        topic.createdAt ||

        0

    );

}