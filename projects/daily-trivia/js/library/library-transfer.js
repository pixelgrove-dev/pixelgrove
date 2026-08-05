const exportLibraryButton = document.getElementById("export-library");

const importLibraryInput = document.getElementById("import-library");

const transferMessage = document.getElementById("transfer-message");


function exportLibrary() {
    const topics = getTopics();

    const exportData = {
        app: "Activity Studio",
        version: 1,
        exportedAt: new Date().toISOString(),
        topics
    };

    const json = JSON.stringify(exportData, null, 2);

    const blob = new Blob([json],{
        type: "application/json"
    });

    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const date = new Date().toISOString().slice(0, 10);

    link.href = downloadUrl;

    link.download = `studio-library-${date}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(downloadUrl);

    transferMessage.textContent = `${topics.length} topic(s) exported successfully.`;

    transferMessage.className =  "save-message success";
}

function getImportedTopics(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if ( data && Array.isArray(data.topics)) {
        return data.topics;
    }

    return null;
}

function normalizedImportedTopic(topic) {
    if (!topic || typeof topic !== "object") {
        return null;
    }

    const title = typeof topic.title === "string" ? topic.title.trim() : "";

    if(!title) {
        return null;
    }

    return {
        ...topic,

        id: topic.id || crypto.randomUUID(),

        title,

        category: topic.category || "Uncategorized",

        difficulty: topic.difficulty || "Easy",

        status: topic.status || "Draft",

        favorite: Boolean(topic.favorite),

        information: Array.isArray(topic.information) ? topic.information : [],

        questions: Array.isArray(topic.questions) ? topic.questions : [],

        createdAt: topic.createdAt || new Date().toISOString(),

        updatedAT: topic.updatedAt || topic.createdAt || new Date().toISOString()
    };

}

async function importLibrary(file) {

    try {

        const fileText = await file.text();

        const parsedData = JSON.parse(fileText);

        const importedTopics = getImportedTopics(parsedData);

        if(!importedTopics) {
            throw new Error("This file does not contain a valid topic library!");
        }

        const normalizedTopics = importedTopics.map(normalizedImportedTopic).filter(Boolean);

        if (normalizedTopics.length === 0) {
            throw new Error("No usable topics were fond in the file.");
        }

        const savedTopics = getTopics();

        const savedIds = new Set(savedTopics.map(topic => String(topic.id)));

        const newTopics = normalizedTopics.filter(topic => !savedIds.has(String(topic.id)));

        const skippedCount = normalizedTopics.length - newTopics.length;

        const combinedTopics = [...savedTopics, ...newTopics];
        
        saveTopics(combinedTopics);

        populateCategoryFilter();
        applyFilters();

        transferMessage.textContent = `${newTopics.length} topic(s) imported. ` + `${skippedCount} duplicate(s) skipped.`;

        transferMessage.className = "save-message success";
    } catch (error) {
        ///transferMessage.textContent = error.mesage || "The library could not be imported";

        ///transferMessage.className = "save-message error";
        console.error("Library import failed:",error);
        transferMessage.textContent = error instanceof Error ? error.message : "The library could not be imported.";
        transferMessage.className = "save-message error";
    }
    
}


exportLibraryButton.addEventListener("click", exportLibrary);

importLibraryInput.addEventListener("change", async event => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    await importLibrary(file);

    event.target.value = "";
});