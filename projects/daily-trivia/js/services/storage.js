const STORAGE_KEY = "groveTopics";

function getTopics() {

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

}

function saveTopics(topics) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(topics)
    );

}

function getTopicById(id) {
    const topics = getTopics();

    return topics.find(topic => topic.id === id);
}