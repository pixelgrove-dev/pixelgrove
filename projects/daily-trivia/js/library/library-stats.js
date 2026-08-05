/**
 * Calculates dashboard statistics from the topics stored in localStorage.
 *
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
function getLibraryStats() {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return {
            totalTopics: 0,
            favoriteTopics: 0,
            totalCategories: 0,
            totalQuestions: 0,
            totalParagraphs: 0,
            draftTopics: 0,
            publishedTopics: 0,
            updatedToday: 0
        };
    }

    const totalQuestions = topics.reduce(
        (total, topic) => {

            const questions =
                Array.isArray(topic.questions)
                    ? topic.questions
                    : [];

            return total + questions.length;

        },
        0
    );

    const totalParagraphs = topics.reduce(
        (total, topic) => {

            const information =
                Array.isArray(topic.information)
                    ? topic.information
                    : [];

            return total + information.length;

        },
        0
    );

    const categories = topics
        .map(topic => topic.category)
        .filter(Boolean);

    const favoriteTopics = topics.filter(
        topic => Boolean(topic.favorite)
    ).length;

    const draftTopics = topics.filter(
        topic => (topic.status || "Draft") === "Draft"
    ).length;

    const publishedTopics = topics.filter(
        topic => topic.status === "Published"
    ).length;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const updatedToday = topics.filter(topic => {

        if (!topic.updatedAt) {
            return false;
        }

        const updatedDate =
            new Date(topic.updatedAt);

        if (Number.isNaN(updatedDate.getTime())) {
            return false;
        }

        updatedDate.setHours(0, 0, 0, 0);

        return updatedDate.getTime() === today.getTime();

    }).length;

    return {
        totalTopics: topics.length,
        favoriteTopics,
        totalCategories: new Set(categories).size,
        totalQuestions,
        totalParagraphs,
        draftTopics,
        publishedTopics,
        updatedToday
    };

}


/**
 * Returns the most recently created or edited topics.
 *
 * @param {number} [limit=5] Maximum number of topics to return.
 * @returns {Object[]} Topics ordered from newest to oldest.
 */
function getRecentTopics(limit = 5) {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return [];
    }

    return topics
        .slice()
        .sort((a, b) => {

            const dateA = new Date(
                a.updatedAt ||
                a.createdAt ||
                0
            );

            const dateB = new Date(
                b.updatedAt ||
                b.createdAt ||
                0
            );

            return dateB - dateA;

        })
        .slice(0, limit);

}

function getCategoryBreakdown() {

    const topics = getTopics();

    if (!Array.isArray(topics)) {
        return [];
    }

    const counts = {};

    topics.forEach(topic => {

        const category =
            topic.category || "Uncategorized";

        counts[category] =
            (counts[category] || 0) + 1;

    });

    return Object.entries(counts)

        .map(([category,count]) => ({

            category,

            count

        }))

        .sort((a,b)=>b.count-a.count);

}
