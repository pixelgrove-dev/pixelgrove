/**
 * Calculates dashboard statistics from a supplied topic collection.
 *
 * @param {Object[]} topics Topics loaded by the dashboard.
 * @returns {{
 *   totalTopics: number,
 *   favoriteTopics: number,
 *   totalCategories: number,
 *   totalQuestions: number,
 *   totalParagraphs: number,
 *   draftTopics: number,
 *   publishedTopics: number,
 *   updatedToday: number
 * }}
 */
function getLibraryStats(topics = []) {

    if (!Array.isArray(topics)) {
        topics = [];
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

    const favoriteTopics =
        topics.filter(topic =>
            Boolean(topic.favorite)
        ).length;

    const draftTopics =
        topics.filter(topic =>
            (topic.status || "Draft") === "Draft"
        ).length;

    const publishedTopics =
        topics.filter(topic =>
            topic.status === "Published"
        ).length;

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    const updatedToday =
        topics.filter(topic => {

            const dateValue =
                topic.updatedAt ||
                topic.createdAt;

            if (!dateValue) {
                return false;
            }

            const topicDate =
                new Date(dateValue);

            if (
                Number.isNaN(
                    topicDate.getTime()
                )
            ) {
                return false;
            }

            topicDate.setHours(
                0,
                0,
                0,
                0
            );

            return (
                topicDate.getTime() ===
                today.getTime()
            );

        }).length;

    return {
        totalTopics: topics.length,
        favoriteTopics,
        totalCategories:
            new Set(categories).size,
        totalQuestions,
        totalParagraphs,
        draftTopics,
        publishedTopics,
        updatedToday
    };
}


/**
 * Returns topics ordered from newest to oldest.
 *
 * @param {Object[]} topics Topic collection.
 * @param {number} [limit=5] Maximum topics to return.
 * @returns {Object[]}
 */
function getRecentTopics(
    topics = [],
    limit = 5
) {

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


/**
 * Counts topics in each category.
 *
 * @param {Object[]} topics Topic collection.
 * @returns {{category: string, count: number}[]}
 */
function getCategoryBreakdown(
    topics = []
) {

    if (!Array.isArray(topics)) {
        return [];
    }

    const counts = {};

    topics.forEach(topic => {

        const category =
            topic.category ||
            "Uncategorized";

        counts[category] =
            (counts[category] || 0) + 1;

    });

    return Object.entries(counts)
        .map(([category, count]) => ({
            category,
            count
        }))
        .sort((a, b) =>
            b.count - a.count
        );
}
