const exportLibraryButton =
    document.getElementById("export-library");

const importLibraryInput =
    document.getElementById("import-library");

const transferMessage =
    document.getElementById("transfer-message");


/*==================================================
    EXPORT
==================================================*/

async function exportLibrary() {

    try {

        transferMessage.textContent =
            "Preparing export...";

        transferMessage.className =
            "save-message";

        const topics =
            await TopicService.getAll();

        const exportData = {
            app: "Activity Studio",
            version: 1,
            exportedAt:
                new Date().toISOString(),
            topics
        };

        const json =
            JSON.stringify(
                exportData,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );

        const downloadUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        link.href =
            downloadUrl;

        link.download =
            `studio-library-${date}.json`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(
            downloadUrl
        );

        transferMessage.textContent =
            `${topics.length} topic(s) exported successfully.`;

        transferMessage.className =
            "save-message success";

    } catch (error) {

        console.error(
            "Library export failed:",
            error
        );

        transferMessage.textContent =
            error instanceof Error
                ? error.message
                : "The library could not be exported.";

        transferMessage.className =
            "save-message error";

    }

}


/*==================================================
    IMPORT HELPERS
==================================================*/

function getImportedTopics(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (
        data &&
        Array.isArray(data.topics)
    ) {
        return data.topics;
    }

    return null;
}


function normalizeImportedTopic(topic) {

    if (
        !topic ||
        typeof topic !== "object"
    ) {
        return null;
    }

    const title =
        typeof topic.title === "string"
            ? topic.title.trim()
            : "";

    if (!title) {
        return null;
    }

    const now =
        new Date().toISOString();

    return {
        ...topic,

        id:
            topic.id ||
            crypto.randomUUID(),

        title,

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
            Array.isArray(
                topic.information
            )
                ? topic.information
                : [],

        questions:
            Array.isArray(
                topic.questions
            )
                ? topic.questions
                : [],

        createdAt:
            topic.createdAt ||
            now,

        updatedAt:
            topic.updatedAt ||
            topic.createdAt ||
            now
    };

}


/*==================================================
    IMPORT
==================================================*/

async function importLibrary(file) {

    try {

        transferMessage.textContent =
            "Importing topics...";

        transferMessage.className =
            "save-message";

        const fileText =
            await file.text();

        const parsedData =
            JSON.parse(fileText);

        const importedTopics =
            getImportedTopics(
                parsedData
            );

        if (!importedTopics) {
            throw new Error(
                "This file does not contain a valid topic library."
            );
        }

        const normalizedTopics =
            importedTopics
                .map(
                    normalizeImportedTopic
                )
                .filter(Boolean);

        if (
            normalizedTopics.length === 0
        ) {
            throw new Error(
                "No usable topics were found in the file."
            );
        }

        const savedTopics =
            await TopicService.getAll();

        const savedIds =
            new Set(
                savedTopics.map(topic =>
                    String(topic.id)
                )
            );

        const newTopics =
            normalizedTopics.filter(
                topic =>
                    !savedIds.has(
                        String(topic.id)
                    )
            );

        const skippedCount =
            normalizedTopics.length -
            newTopics.length;

        let importedCount = 0;

        for (const topic of newTopics) {

            await TopicService.save(
                topic
            );

            importedCount += 1;

        }

        /*
         * Refresh the library's in-memory data
         * from the cloud after importing.
         */
        if (
            typeof libraryTopics !==
            "undefined"
        ) {
            libraryTopics =
                await TopicService.getAll();
        }

        if (
            typeof populateCategoryFilter ===
            "function"
        ) {
            populateCategoryFilter();
        }

        if (
            typeof applyFilters ===
            "function"
        ) {
            applyFilters();
        }

        transferMessage.textContent =
            `${importedCount} topic(s) imported. ` +
            `${skippedCount} duplicate(s) skipped.`;

        transferMessage.className =
            "save-message success";

    } catch (error) {

        console.error(
            "Library import failed:",
            error
        );

        transferMessage.textContent =
            error instanceof Error
                ? error.message
                : "The library could not be imported.";

        transferMessage.className =
            "save-message error";

    }

}


/*==================================================
    EVENTS
==================================================*/

exportLibraryButton.addEventListener(
    "click",
    exportLibrary
);

importLibraryInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        await importLibrary(file);

        event.target.value = "";

    }
);