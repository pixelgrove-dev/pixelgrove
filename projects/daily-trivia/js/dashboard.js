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

const draftCount =
    document.getElementById("stat-drafts");

const publishedCount =
    document.getElementById("stat-published");

const updatedTodayCount =
    document.getElementById("stat-updated");
/*==================================================
    DASHBOARD RENDERING
==================================================*/

// Assigning the prepared values in one place keeps the markup free of storage
// concerns and makes each card's data source easy to trace.

topicCount.textContent = stats.totalTopics;

favoriteCount.textContent = stats.favoriteTopics;

categoryCount.textContent = stats.totalCategories;

questionCount.textContent = stats.totalQuestions;

paragraphCount.textContent = stats.totalParagraphs;

draftCount.textContent = stats.draftTopics;

publishedCount.textContent = stats.publishedTopics;

updatedTodayCount.textContent = stats.updatedToday;

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

/*==================================================
    CATEGORY BREAKDOWN
==================================================*/

const categoryBreakdownContainer =
    document.getElementById("category-breakdown");

renderCategoryBreakdown();

function renderCategoryBreakdown() {

    const categories =
        getCategoryBreakdown();

    categoryBreakdownContainer.innerHTML = "";

    if (categories.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No topics yet.";

        categoryBreakdownContainer.appendChild(
            emptyMessage
        );

        return;
    }

    const list =
        document.createElement("div");

    list.className =
        "breakdown-list";

    const highestCount =
        categories[0].count;

    categories.forEach(category => {

        const row =
            document.createElement("div");

        row.className =
            "breakdown-row";

        const label =
            document.createElement("span");

        label.className =
            "breakdown-label";

        label.textContent =
            category.category;

        const bar =
            document.createElement("div");

        bar.className =
            "breakdown-bar";

        const fill =
            document.createElement("div");

        fill.className =
            "breakdown-fill";

        fill.style.width =
            `${(category.count / highestCount) * 100}%`;

        bar.appendChild(fill);

        const value =
            document.createElement("span");

        value.className =
            "breakdown-value";

        value.textContent =
            category.count;

        row.appendChild(label);
        row.appendChild(bar);
        row.appendChild(value);

        list.appendChild(row);

    });

    categoryBreakdownContainer.appendChild(list);

}