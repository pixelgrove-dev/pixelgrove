/**
 * Manual save, autosave, cloud status, and offline recovery.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;
    const state = EditorApp.state;

    function savePendingDraft(topic) {
        localStorage.setItem(
            EditorApp.pendingDraftKey(topic.id),
            JSON.stringify({
                ...topic,
                recoverySavedAt:
                    new Date().toISOString()
            })
        );
    }

    function removePendingDraft(topicId) {
        localStorage.removeItem(
            EditorApp.pendingDraftKey(topicId)
        );
    }

    EditorApp.getPendingDraft = function () {
        if (!state.currentTopicId) {
            return null;
        }

        const rawDraft =
            localStorage.getItem(
                EditorApp.pendingDraftKey(
                    state.currentTopicId
                )
            );

        if (!rawDraft) {
            return null;
        }

        try {
            return JSON.parse(rawDraft);
        } catch (error) {
            console.error(
                "Recovery draft could not be read:",
                error
            );

            return null;
        }
    };

    EditorApp.saveTopic = async function ({
        isAutosave = false
    } = {}) {
        if (!isAutosave) {
            clearTimeout(state.autosaveTimer);
        }

        const topic =
            EditorApp.collectTopicData();

        const validationMessage =
            EditorApp.validateTopic(topic);

        if (validationMessage) {
            if (!isAutosave) {
                EditorApp.showSaveStatus(
                    validationMessage,
                    "error"
                );
            }

            return null;
        }

        if (state.isSaving) {
            state.pendingSave = true;
            return null;
        }

        state.isSaving = true;
        state.pendingSave = false;
        elements.saveTopicButton.disabled = true;
        state.currentTopicId = topic.id;

        if (!navigator.onLine) {
            savePendingDraft(topic);

            state.currentTopic = topic;

            EditorApp.setSyncStatus(
                "offline",
                "Offline"
            );

            EditorApp.showSaveStatus(
                "Changes saved locally and queued for cloud sync.",
                "warning"
            );

            state.isSaving = false;
            elements.saveTopicButton.disabled = false;

            return topic;
        }

        EditorApp.setSyncStatus(
            "saving",
            "Saving"
        );

        EditorApp.showSaveStatus(
            "Saving..."
        );

        try {
            const savedTopic =
                await saveTopicToStorage(topic);

            state.currentTopicId =
                savedTopic.id;

            state.currentTopic =
                savedTopic;

            removePendingDraft(
                savedTopic.id
            );

            EditorApp.markSavedNow();

            EditorApp.setSyncStatus(
                "synced",
                "Synced"
            );

            EditorApp.showSaveStatus(
                isAutosave
                    ? "Cloud synced."
                    : `"${savedTopic.title}" was saved successfully.`,
                "success"
            );

            const nextUrl =
                new URL(window.location.href);

            nextUrl.searchParams.set(
                "topic",
                savedTopic.id
            );

            window.history.replaceState(
                {},
                "",
                nextUrl
            );

            EditorApp.recordHistorySnapshot({
                immediate: true
            });

            return savedTopic;
        } catch (error) {
            console.error(
                "Topic save failed:",
                error
            );

            savePendingDraft(topic);

            EditorApp.setSyncStatus(
                "error",
                "Sync error"
            );

            EditorApp.showSaveStatus(
                "Cloud save failed. A local recovery copy was kept.",
                "error"
            );

            return null;
        } finally {
            state.isSaving = false;
            elements.saveTopicButton.disabled = false;

            if (state.pendingSave) {
                state.pendingSave = false;

                await EditorApp.saveTopic({
                    isAutosave: true
                });
            }
        }
    };

    EditorApp.scheduleAutosave = function () {
        clearTimeout(state.autosaveTimer);

        if (
            !state.currentTopicId ||
            !state.hasLoaded
        ) {
            return;
        }

        EditorApp.setSyncStatus(
            navigator.onLine
                ? "unsaved"
                : "offline",
            navigator.onLine
                ? "Unsaved changes"
                : "Offline"
        );

        EditorApp.showSaveStatus(
            navigator.onLine
                ? "Unsaved changes..."
                : "Offline changes are being kept locally."
        );

        state.autosaveTimer =
            setTimeout(
                () => {
                    EditorApp.saveTopic({
                        isAutosave: true
                    });
                },
                state.autosaveDelay
            );
    };

    EditorApp.handleEditorChange = function () {
        EditorApp.updatePreview();
        EditorApp.recordHistorySnapshot();
        EditorApp.scheduleAutosave();
    };

    EditorApp.syncPendingDraft = async function ({
        promptBeforeRestore = false
    } = {}) {
        if (
            !navigator.onLine ||
            !state.currentTopicId
        ) {
            return;
        }

        const draft =
            EditorApp.getPendingDraft();

        if (!draft) {
            return;
        }

        const syncDraft = async () => {
            EditorApp.loadTopicIntoEditor(
                draft,
                {
                    preserveHistory: true
                }
            );

            EditorApp.setSyncStatus(
                "saving",
                "Syncing recovery copy"
            );

            const savedTopic =
                await saveTopicToStorage(draft);

            state.currentTopic =
                savedTopic;

            removePendingDraft(
                savedTopic.id
            );

            EditorApp.markSavedNow();

            EditorApp.setSyncStatus(
                "synced",
                "Synced"
            );

            EditorApp.showSaveStatus(
                "Recovery copy restored and synced.",
                "success"
            );

            EditorApp.recordHistorySnapshot({
                immediate: true
            });
        };

        const discardDraft = () => {
            removePendingDraft(
                state.currentTopicId
            );

            EditorApp.setSyncStatus(
                "synced",
                "Synced"
            );

            EditorApp.showSaveStatus(
                "Recovery copy discarded."
            );
        };

        try {
            if (promptBeforeRestore) {
                EditorApp.showRecoveryPrompt(
                    draft,
                    syncDraft,
                    discardDraft
                );

                return;
            }

            await syncDraft();
        } catch (error) {
            console.error(
                "Pending draft sync failed:",
                error
            );

            EditorApp.setSyncStatus(
                "error",
                "Sync error"
            );

            EditorApp.showSaveStatus(
                "Unable to sync the local recovery copy.",
                "error"
            );
        }
    };
})();
