/**
 * Renders persisted library totals into the dashboard summary cards.
 *
 * Aggregation remains in the statistics service so this file only coordinates
 * data with its corresponding interface elements.
 */

// Dashboard data flows from localStorage through the statistics service, keeping
// this presentation layer responsible only for displaying the computed totals.
const stats = getLibraryStats();

/*==================================================
    STATISTIC ELEMENTS
==================================================*/

const topicCount =
    document.getElementById("stat-topics");

const favoriteCount =
    document.getElementById("stat-favorites");

const categoryCount =
    document.getElementById("stat-categories");

const questionCount =
    document.getElementById("stat-questions");

const paragraphCount =
    document.getElementById("stat-paragraphs");

/*==================================================
    DASHBOARD RENDERING
==================================================*/

// Assigning the prepared values in one place keeps the markup free of storage
// concerns and makes each card's data source easy to trace.
topicCount.textContent =
    stats.totalTopics;

favoriteCount.textContent =
    stats.favoriteTopics;

categoryCount.textContent =
    stats.totalCategories;

questionCount.textContent =
    stats.totalQuestions;

paragraphCount.textContent =
    stats.totalParagraphs;


/*==================================================
    RECENT TOPICS
==================================================*/

const recentTopicsContainer =
    document.getElementById("recent-topics");

const recentTopics =
    getRecentTopics(5);

renderRecentTopics(recentTopics);

/*==================================================
    RECENT TOPICS RENDERING
==================================================*/

function renderRecentTopics(topics = []) {

     recentTopicsContainer.innerHTML = "";

    if (topics.length === 0) {

        recentTopicsContainer.innerHTML = `
            <div class="recent-topics-empty">
                <p>No topics yet.</p>

                <a href="editor.html">
                    Create your first topic
                </a>
            </div>
        `;

        return;
    }

    topics.forEach(topic => {

        const link =
            document.createElement("a");

        link.className =
            "recent-topic-card";

        link.href =
            `editor.html?topic=${encodeURIComponent(topic.id)}`;

        link.innerHTML = `
            <span class="recent-topic-icon">
                ${topic.favorite ? "⭐" : "📄"}
            </span>

            <div>
                <h3>${topic.title}</h3>
                <p>${topic.category}</p>
            </div>
        `;

        recentTopicsContainer.appendChild(link);

    });

}