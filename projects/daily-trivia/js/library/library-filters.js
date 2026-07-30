/**
 * Supplies side-effect-free filtering and sorting helpers for the topic library.
 *
 * Pure helpers keep display decisions testable without depending on the DOM or
 * browser storage.
 */

/**
 * Returns topics that satisfy both the text search and category selection.
 *
 * @param {Array<Object>} topics - Topics available for filtering.
 * @param {string} searchTerm - Text entered in the library search field.
 * @param {string} selectedCategory - Lowercase category name or `"all"`.
 * @returns {Array<Object>} Topics matching the active filters.
 */
function filterTopics(
    topics,
    searchTerm,
    selectedCategory
) {
    // Normalization makes matching insensitive to capitalization and incidental spaces.
    const normalizedSearch =
        searchTerm.trim().toLowerCase();

    /**
     * Determines whether a topic satisfies every active library filter.
     *
     * @param {Object} topic - Topic being evaluated.
     * @returns {boolean} Whether the topic should remain visible.
     */
    return topics.filter(topic => {

        const title =
            (topic.title || "").toLowerCase();

        const category =
            (topic.category || "").toLowerCase();

        const matchesSearch =
            title.includes(normalizedSearch) ||
            category.includes(normalizedSearch);

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        return matchesSearch && matchesCategory;

    });
}


/**
 * Returns topics in the requested order without mutating the source array.
 *
 * @param {Array<Object>} topics - Topics available for sorting.
 * @param {string} selectedSort - Sort mode selected by the user.
 * @returns {Array<Object>} A new array ordered according to the selected mode.
 */
function sortTopics(topics, selectedSort) {

    // Library data may be reused elsewhere, so sorting is performed on a shallow copy.
    const sortedTopics = [...topics];

    switch (selectedSort) {

        case "newest":

            sortedTopics.sort((a, b) =>
                getTopicDate(b) - getTopicDate(a)
            );
            break;

        case "oldest":

            sortedTopics.sort((a, b) => 
                getTopicDate(a) - getTopicDate(b)
            );

            break;

        case "az":

            sortedTopics.sort((a, b) =>
                (a.title || "").localeCompare(
                    b.title || ""
                )
            );

            break;

        case "za":

            sortedTopics.sort((a, b) =>
                (b.title || "").localeCompare(
                    a.title || ""
                )
            );

            break;

        case "favorites":

            sortedTopics.sort((a, b) =>
                Number(Boolean(b.favorite)) -
                Number(Boolean(a.favorite))
            );

            break;

    }

    return sortedTopics;
}


/**
 * Collects the unique, non-empty category names represented by the topics.
 *
 * @param {Array<Object>} topics - Topics from which categories are derived.
 * @returns {Array<string>} Alphabetically sorted category names.
 */
function getTopicCategories(topics) {

    // A Set removes duplicates before sorting the values presented in the filter UI.
    const categories = [
        ...new Set(
            topics
                /**
                 * Extracts the category value used to populate the filter.
                 *
                 * @param {Object} topic - Topic whose category is needed.
                 * @returns {*} The topic's category value.
                 */
                .map(topic => topic.category)
                /**
                 * Removes missing category values so the UI has no blank option.
                 *
                 * @param {*} category - Category candidate.
                 * @returns {boolean} Whether the category has a usable value.
                 */
                .filter(Boolean)
        )
    ];

    return categories.sort();

}
