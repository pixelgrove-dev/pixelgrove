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