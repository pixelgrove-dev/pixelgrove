/**
 * Aggregates dashboard statistics from the topics currently in local storage.
 *
 * This function reads persisted data but does not modify it.
 *
 * @returns {{
 *   totalTopics: number,
 *   favoriteTopics: number,
 *   totalCategories: number,
 *   totalQuestions: number,
 *   totalParagraphs: number
 * }} Counts used by the dashboard summary cards.
 */
function getRecentTopics(limit = 5) {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return {
            totalTopics: 0,
            favoriteTopics: 0,
            totalCategories: 0,
            totalQuestions: 0,
            totalParagraphs: 0,
        };
    }

    const totalQuestions = topics.reduce((total, topic) => {
        const questions = Array.isArray(topic.questions) ? topic.questions : [];

        return total + questions.length;
    }, 0)

    const totalParagraphs =
        /**
         * Adds each topic's reading paragraph count to the library total.
         *
         * @param {number} total - Paragraph count accumulated so far.
         * @param {Object} topic - Topic currently being counted.
         * @returns {number} Updated paragraph total.
         */
        topics.reduce((total, topic) => {

            // Treat malformed reading data as empty to keep the dashboard available.
            const information =
                Array.isArray(topic.information)
                    ? topic.information
                    : [];

            return total + information.length;

        }, 0);

    const categories =
        topics
            /**
             * Extracts category names for unique-category counting.
             *
             * @param {Object} topic - Topic whose category is needed.
             * @returns {*} The stored category value.
             */
            .map(topic => topic.category)
            /**
             * Excludes missing categories so they do not count as a dashboard group.
             *
             * @param {*} category - Category candidate.
             * @returns {boolean} Whether the category has a usable value.
             */
            .filter(Boolean);

    return {
        totalTopics: topics.length,

        favoriteTopics:
            /**
             * Keeps only topics explicitly represented as favorites.
             *
             * @param {Object} topic - Topic being inspected.
             * @returns {boolean} Whether the topic is marked as a favorite.
             */
            topics.filter(topic =>
                Boolean(topic.favorite)
            ).length,

        totalCategories:
            new Set(categories).size,

        totalQuestions,

        totalParagraphs
    };

}


/**
 * Aggregates dashboard statistics from the topics currently in local storage.
 *
 * This function reads persisted data but does not modify it.
 *
 * @returns {{
 *   totalTopics: number,
 *   favoriteTopics: number,
 *   totalCategories: number,
 *   totalQuestions: number,
 *   totalParagraphs: number
 * }} Counts used by the dashboard summary cards.
 */
function getLibraryStats() {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return {
            totalTopics: 0,
            favoriteTopics: 0,
            totalCategories: 0,
            totalQuestions: 0,
            totalParagraphs: 0
        };
    }

    const totalQuestions =
        topics.reduce((total, topic) => {

            const questions =
                Array.isArray(topic.questions)
                    ? topic.questions
                    : [];

            return total + questions.length;

        }, 0);

    const totalParagraphs =
        topics.reduce((total, topic) => {

            const information =
                Array.isArray(topic.information)
                    ? topic.information
                    : [];

            return total + information.length;

        }, 0);

    const categories =
        topics
            .map(topic => topic.category)
            .filter(Boolean);

    return {
        totalTopics: topics.length,

        favoriteTopics:
            topics.filter(topic =>
                Boolean(topic.favorite)
            ).length,

        totalCategories:
            new Set(categories).size,

        totalQuestions,

        totalParagraphs
    };

}


/**
 * Returns the most recently created or edited topics.
 *
 * @param {number} [limit=5] - Maximum number of topics to return.
 * @returns {Object[]} Topics ordered from most recently updated to oldest.
 */
function getRecentTopics(limit = 5) {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return [];
    }

    return topics
        .slice()
        .sort((a, b) => {

            const dateA =
                new Date(
                    a.updatedAt ||
                    a.createdAt ||
                    0
                );

            const dateB =
                new Date(
                    b.updatedAt ||
                    b.createdAt ||
                    0
                );

            return dateB - dateA;

        })
        .slice(0, limit);

}