/** 
 * Central topic-domain service.
 * 
 * UI code should use TopicService instead of talking directly
 * to the storage layer.
 */

const TopicService = {
    /**
     * Returns every topic for the active user.
     * 
     * @returns {promise<Object[]>}
     */

    async getAll(){
        return await getTopics();
    },

    /**
     * Returns one topic by ID.
     * 
     * @param {string} id Topic identifier.
     * @returns {Promise<Object|null|undefined>}
     */

    async getById(id) {
        return await getTopicById(id);
    },

    /**
     * Normalizes a topic before persistence.
     *
     * @param {Object} topic Topic data.
     * @returns {Object}
     */

    normalize(topic) {
        const now = new Date().toISOString();

        return {
            ...topic,
            id:
                topic.id ||
                crypto.randomUUID(),

            title:
                    typeof topic.title === "string"
                    ? topic.title.trim()
                    : "",

            category:
                topic.category ||
                "Uncategorized",

            difficulty:
                topic.difficulty ||
                "Easy",

            status:
                topic.status ||
                "Draft",

            favorite:
                Boolean(topic.favorite),

            image:
                topic.image || "",

            youtube:
                topic.youtube || "",

            information:
                Array.isArray(topic.information)
                    ? topic.information
                    : [],

            questions:
                Array.isArray(topic.questions)
                    ? topic.questions
                    : [],

            createdAt:
                topic.createdAt ||
                now,

            updatedAt:
                now
        };
    },

    /**
     * Creates or updates a topic.
     *
     * @param {Object} topic Topic data.
     * @returns {Promise<Object>}
     */

    async save(topic) {

        const normalizedTopic =
            this.normalize(topic);

        return await saveTopicToStorage(
            normalizedTopic
        );
    },

    /**
     * Deletes a topic.
     *
     * @param {string} id Topic identifier.
     * @returns {Promise<void>}
     */
    async delete(id) {
        await deleteTopicFromStorage(id);
    },

     /**
     * Creates a duplicate with a new ID.
     *
     * @param {Object} topic Topic to duplicate.
     * @returns {Promise<Object>}
     */
    async duplicate(topic) {

        const now =
            new Date().toISOString();

        const duplicate = {
            ...topic,

            id:
                crypto.randomUUID(),

            title:
                `${topic.title || "Untitled Topic"} Copy`,

            favorite:
                false,

            createdAt:
                now,

            updatedAt:
                now
        };

        return await this.save(duplicate);
    },
/**
     * Toggles favorite state.
     *
     * @param {Object} topic Topic to update.
     * @returns {Promise<Object>}
     */
    async toggleFavorite(topic) {

        return await this.save({
            ...topic,
            favorite:
                !Boolean(topic.favorite)
        });
    },


    /**
     * Marks a topic as published.
     *
     * @param {Object} topic Topic to update.
     * @returns {Promise<Object>}
     */
    async publish(topic) {

        return await this.save({
            ...topic,
            status: "Published"
        });
    },


    /**
     * Marks a topic as a draft.
     *
     * @param {Object} topic Topic to update.
     * @returns {Promise<Object>}
     */
    async moveToDraft(topic) {

        return await this.save({
            ...topic,
            status: "Draft"
        });
    }

};