/**
 * Persistent cloud status bar, last-saved clock, and recovery prompt.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const state = EditorApp.state;
    const elements = EditorApp.elements;

    const statusBar = document.createElement("section");
    statusBar.className = "editor-sync-bar";
    statusBar.setAttribute("aria-live", "polite");

    statusBar.innerHTML = `
        <div class="editor-sync-main">
            <span
                id="editor-sync-dot"
                class="editor-sync-dot ready"
                aria-hidden="true"
            ></span>

            <strong id="editor-sync-label">
                Ready
            </strong>
        </div>

        <span id="editor-last-saved">
            Not saved yet
        </span>

        <div class="editor-history-actions">
            <button
                id="editor-undo"
                class="secondary-button editor-history-button"
                type="button"
                disabled
            >
                Undo
            </button>

            <button
                id="editor-redo"
                class="secondary-button editor-history-button"
                type="button"
                disabled
            >
                Redo
            </button>
        </div>
    `;

    const insertionTarget =
        elements.saveMessage?.parentElement ||
        elements.saveTopicButton?.parentElement;

    if (insertionTarget) {
        insertionTarget.appendChild(statusBar);
    }

    EditorApp.statusElements = {
        bar: statusBar,
        dot: statusBar.querySelector("#editor-sync-dot"),
        label: statusBar.querySelector("#editor-sync-label"),
        lastSaved: statusBar.querySelector("#editor-last-saved"),
        undoButton: statusBar.querySelector("#editor-undo"),
        redoButton: statusBar.querySelector("#editor-redo")
    };

    EditorApp.setSyncStatus = function (
        status,
        label
    ) {
        const statusElements =
            EditorApp.statusElements;

        statusElements.dot.className =
            `editor-sync-dot ${status}`;

        statusElements.label.textContent =
            label;
    };

    EditorApp.markSavedNow = function () {
        state.lastSavedAt = new Date();
        EditorApp.updateLastSavedLabel();
    };

    EditorApp.updateLastSavedLabel = function () {
        const output =
            EditorApp.statusElements.lastSaved;

        if (!state.lastSavedAt) {
            output.textContent =
                "Not saved yet";
            return;
        }

        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (Date.now() -
                        state.lastSavedAt.getTime()) /
                    1000
                )
            );

        if (elapsedSeconds < 5) {
            output.textContent =
                "Saved just now";
        } else if (elapsedSeconds < 60) {
            output.textContent =
                `Saved ${elapsedSeconds} seconds ago`;
        } else {
            const minutes =
                Math.floor(elapsedSeconds / 60);

            output.textContent =
                `Saved ${minutes} minute${
                    minutes === 1 ? "" : "s"
                } ago`;
        }
    };

    setInterval(
        EditorApp.updateLastSavedLabel,
        1000
    );

    EditorApp.showRecoveryPrompt = function (
        draft,
        onRestore,
        onDiscard
    ) {
        const overlay =
            document.createElement("div");

        overlay.className =
            "draft-recovery-overlay";

        overlay.innerHTML = `
            <section
                class="draft-recovery-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="draft-recovery-title"
            >
                <p class="app-label">
                    Recovery copy found
                </p>

                <h2 id="draft-recovery-title">
                    Restore unsynced changes?
                </h2>

                <p>
                    Grove Activity Studio found a local recovery
                    copy that may be newer than the cloud version.
                </p>

                <p class="draft-recovery-topic">
                    ${draft.title || "Untitled Topic"}
                </p>

                <div class="draft-recovery-actions">
                    <button
                        class="secondary-button"
                        id="discard-recovery"
                        type="button"
                    >
                        Discard
                    </button>

                    <button
                        class="primary-button"
                        id="restore-recovery"
                        type="button"
                    >
                        Restore Draft
                    </button>
                </div>
            </section>
        `;

        document.body.appendChild(overlay);

        const restoreButton =
            overlay.querySelector(
                "#restore-recovery"
            );

        const discardButton =
            overlay.querySelector(
                "#discard-recovery"
            );

        restoreButton.addEventListener(
            "click",
            async () => {
                overlay.remove();
                await onRestore();
            }
        );

        discardButton.addEventListener(
            "click",
            () => {
                overlay.remove();
                onDiscard();
            }
        );

        restoreButton.focus();
    };
})();
