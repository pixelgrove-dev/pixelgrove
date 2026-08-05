/**
 * Live worksheet preview rendering.
 */
(function () {
    "use strict";

    const EditorApp = window.EditorApp;
    const elements = EditorApp.elements;

    EditorApp.getYouTubeEmbedUrl = function (url) {
        if (!url) {
            return "";
        }

        try {
            const parsedUrl = new URL(url);

            if (parsedUrl.hostname.includes("youtu.be")) {
                const videoId = parsedUrl.pathname.slice(1);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
            }

            if (parsedUrl.hostname.includes("youtube.com")) {
                const videoId = parsedUrl.searchParams.get("v");
                return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
            }
        } catch (error) {
            return "";
        }

        return "";
    };

    EditorApp.updatePreview = function () {
        elements.previewTitle.textContent =
            elements.topicTitleInput.value || "Your Topic Title";

        elements.previewCategory.textContent =
            elements.categorySelect.value;

        elements.previewReading.innerHTML = "";

        document.querySelectorAll(".reading-paragraph").forEach(textarea => {
            const value = textarea.value.trim();

            if (!value) {
                return;
            }

            const paragraph = document.createElement("p");
            paragraph.textContent = value;
            elements.previewReading.appendChild(paragraph);
        });

        elements.previewQuestions.innerHTML = "";
        elements.previewAnswers.innerHTML = "";

        elements.questionContainer
            .querySelectorAll(".question-card")
            .forEach(card => {
                const question =
                    card.querySelector(".question-input").value.trim();

                const answer =
                    card.querySelector(".answer-input").value.trim();

                const difficulty =
                    card.querySelector(".question-difficulty").value;

                if (question) {
                    const questionItem = document.createElement("li");

                    questionItem.appendChild(
                        document.createTextNode(`${question} `)
                    );

                    const difficultyBadge = document.createElement("span");
                    difficultyBadge.className = "preview-difficulty";
                    difficultyBadge.textContent = difficulty;

                    questionItem.appendChild(difficultyBadge);
                    elements.previewQuestions.appendChild(questionItem);
                }

                if (answer) {
                    const answerItem = document.createElement("li");
                    answerItem.textContent = answer;
                    elements.previewAnswers.appendChild(answerItem);
                }
            });

        elements.previewMedia.innerHTML = "";

        const imageUrl = elements.imageUrlInput.value.trim();
        const youtubeUrl = elements.youtubeUrlInput.value.trim();

        if (imageUrl) {
            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt =
                elements.topicTitleInput.value || "Trivia topic image";
            image.className = "preview-image";
            image.addEventListener("error", () => image.remove());

            elements.previewMedia.appendChild(image);
        }

        const embedUrl = EditorApp.getYouTubeEmbedUrl(youtubeUrl);

        if (embedUrl) {
            const videoFrame = document.createElement("iframe");
            videoFrame.src = embedUrl;
            videoFrame.title = "Related trivia video";
            videoFrame.className = "preview-video";
            videoFrame.loading = "lazy";
            videoFrame.allowFullscreen = true;

            elements.previewMedia.appendChild(videoFrame);
        }
    };
})();
