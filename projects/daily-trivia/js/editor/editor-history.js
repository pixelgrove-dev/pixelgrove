/**
 * Lightweight editor undo/redo snapshots.
 *
 * Native text-field undo remains available while typing. These controls are
 * especially useful after adding, removing, or restructuring editor sections.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const state = EditorApp.state;

    function snapshotToString() {
        return JSON.stringify(
            EditorApp.collectTopicData()
        );
    }

    function updateHistoryButtons() {
        const statusElements =
            EditorApp.statusElements;

        statusElements.undoButton.disabled =
            state.historyIndex <= 0;

        statusElements.redoButton.disabled =
            state.historyIndex >=
            state.history.length - 1;
    }

    EditorApp.recordHistorySnapshot = function ({
        immediate = false
    } = {}) {
        if (
            state.isApplyingHistory ||
            !state.hasLoaded
        ) {
            return;
        }

        clearTimeout(state.historyTimer);

        const record = () => {
            const snapshot =
                snapshotToString();

            if (
                state.history[
                    state.historyIndex
                ] === snapshot
            ) {
                return;
            }

            state.history =
                state.history.slice(
                    0,
                    state.historyIndex + 1
                );

            state.history.push(snapshot);

            if (
                state.history.length >
                state.historyLimit
            ) {
                state.history.shift();
            }

            state.historyIndex =
                state.history.length - 1;

            updateHistoryButtons();
        };

        if (immediate) {
            record();
            return;
        }

        state.historyTimer =
            setTimeout(
                record,
                state.historyDelay
            );
    };

    EditorApp.applyHistorySnapshot = function (
        snapshot
    ) {
        if (!snapshot) {
            return;
        }

        state.isApplyingHistory = true;

        try {
            const topic =
                JSON.parse(snapshot);

            EditorApp.loadTopicIntoEditor(
                topic,
                {
                    preserveHistory: true
                }
            );

            EditorApp.updatePreview();
            EditorApp.scheduleAutosave();
        } finally {
            state.isApplyingHistory = false;
            updateHistoryButtons();
        }
    };

    EditorApp.undoEditorChange = function () {
        if (state.historyIndex <= 0) {
            return;
        }

        state.historyIndex -= 1;

        EditorApp.applyHistorySnapshot(
            state.history[
                state.historyIndex
            ]
        );
    };

    EditorApp.redoEditorChange = function () {
        if (
            state.historyIndex >=
            state.history.length - 1
        ) {
            return;
        }

        state.historyIndex += 1;

        EditorApp.applyHistorySnapshot(
            state.history[
                state.historyIndex
            ]
        );
    };

    EditorApp.statusElements.undoButton
        .addEventListener(
            "click",
            EditorApp.undoEditorChange
        );

    EditorApp.statusElements.redoButton
        .addEventListener(
            "click",
            EditorApp.redoEditorChange
        );
})();
