/**
 * Provides cloud persistence for Grove Activity Studio topics.
 *
 * This service intentionally uses cloud-specific function names while
 * localStorage remains active during migration.
 */

/**
 * Converts a database row into the topic shape used by the interface.
 *
 * @param {Object} row Supabase topics-table row.
 * @returns {Object} Topic formatted for Grove Activity Studio.
 */
function mapRowToTopic(row) {
    return {
        id: row.id,
        title: row.title,
        category: row.category || "Uncategorized",
        difficulty: row.difficulty || "Easy",
        status: row.status || "Draft",
        favorite: Boolean(row.favorite),
        image: row.image || "",
        youtube: row.youtube || "",
        information:
            Array.isArray(row.information)
                ? row.information
                : [],
        questions:
            Array.isArray(row.questions)
                ? row.questions
                : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}


/**
 * Converts an interface topic into the topics-table column format.
 *
 * @param {Object} topic Grove Activity Studio topic.
 * @param {string} userId Authenticated user's ID.
 * @returns {Object} Database-ready topic row.
 */
function mapTopicToRow(topic, userId) {
    const currentTime =
        new Date().toISOString();

    return {
        id: topic.id,
        user_id: userId,
        title: topic.title,
        category:
            topic.category || "Uncategorized",
        difficulty:
            topic.difficulty || "Easy",
        status:
            topic.status || "Draft",
        favorite:
            Boolean(topic.favorite),
        image:
            topic.image || null,
        youtube:
            topic.youtube || null,
        information:
            Array.isArray(topic.information)
                ? topic.information
                : [],
        questions:
            Array.isArray(topic.questions)
                ? topic.questions
                : [],
        created_at:
            topic.createdAt || currentTime,
        updated_at:
            currentTime
    };
}


/**
 * Returns the currently authenticated user.
 *
 * @returns {Promise<Object>} Authenticated Supabase user.
 * @throws {Error} When no authenticated user exists.
 */
async function getCloudUser() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        throw error;
    }

    if (!user) {
        throw new Error(
            "You must be signed in to access cloud topics."
        );
    }

    return user;
}


/**
 * Retrieves all topics belonging to the signed-in user.
 *
 * @returns {Promise<Object[]>} Cloud topics.
 */
async function getCloudTopics() {
    const { data, error } =
        await supabaseClient
            .from("topics")
            .select("*")
            .order("updated_at", {
                ascending: false
            });

    if (error) {
        throw error;
    }

    return (data || []).map(
        mapRowToTopic
    );
}


/**
 * Retrieves one cloud topic by ID.
 *
 * @param {string} id Topic UUID.
 * @returns {Promise<Object|null>} Matching topic, or null.
 */
async function getCloudTopicById(id) {
    const { data, error } =
        await supabaseClient
            .from("topics")
            .select("*")
            .eq("id", id)
            .maybeSingle();

    if (error) {
        throw error;
    }

    return data
        ? mapRowToTopic(data)
        : null;
}


/**
 * Creates or updates one cloud topic.
 *
 * @param {Object} topic Topic to persist.
 * @returns {Promise<Object>} Saved topic returned by Supabase.
 */
async function saveCloudTopic(topic) {
    const user =
        await getCloudUser();

    const row =
        mapTopicToRow(topic, user.id);

    const { data, error } =
        await supabaseClient
            .from("topics")
            .upsert(row, {
                onConflict: "id"
            })
            .select()
            .single();

    if (error) {
        throw error;
    }

    return mapRowToTopic(data);
}


/**
 * Deletes one cloud topic by ID.
 *
 * @param {string} id Topic UUID.
 * @returns {Promise<void>}
 */
async function deleteCloudTopic(id) {
    const { error } =
        await supabaseClient
            .from("topics")
            .delete()
            .eq("id", id);

    if (error) {
        throw error;
    }
}