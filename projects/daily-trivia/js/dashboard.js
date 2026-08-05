/**
 * Loads the signed-in user's cloud topics and renders dashboard analytics.
 */

/*==================================================
    ELEMENT REFERENCES
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

const recentTopicsContainer =
    document.getElementById("recent-topics");

const categoryBreakdownContainer =
    document.getElementById(
        "category-breakdown"
    );

const userEmail =
    document.getElementById(
        "current-user-email"
    );

const signOutButton =
    document.getElementById("sign-out");


/*==================================================
    INITIALIZATION
==================================================*/

async function initializeDashboard() {

    const user =
        await requireAuthenticatedUser();

    if (!user) {
        return;
    }

    initializeAccountControls(user);

    showDashboardLoading();

    try {

        const topics =
            await getTopics();

        renderStatistics(topics);
        renderRecentTopics(
            getRecentTopics(
                topics,
                5
            )
        );

        renderCategoryBreakdown(
            getCategoryBreakdown(
                topics
            )
        );

    } catch (error) {

        console.error(
            "Dashboard loading failed:",
            error
        );

        showDashboardError();

    }

}


/*==================================================
    ACCOUNT CONTROLS
==================================================*/

function initializeAccountControls(user) {

    if (!userEmail || !signOutButton) {

        console.error(
            "Dashboard account controls could not be found."
        );

        return;
    }

    userEmail.textContent =
        user.email ||
        "Signed-in user";

    signOutButton.addEventListener(
        "click",
        async () => {

            signOutButton.disabled = true;

            signOutButton.textContent =
                "Signing out...";

            const { error } =
                await supabaseClient
                    .auth
                    .signOut();

            if (error) {

                console.error(
                    "Sign-out failed:",
                    error
                );

                signOutButton.disabled = false;

                signOutButton.textContent =
                    "Sign Out";

                return;
            }

            window.location.replace(
                "login.html"
            );

        }
    );

}


/*==================================================
    STATISTICS
==================================================*/

function renderStatistics(topics) {

    const stats =
        getLibraryStats(topics);

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

    draftCount.textContent =
        stats.draftTopics;

    publishedCount.textContent =
        stats.publishedTopics;

    updatedTodayCount.textContent =
        stats.updatedToday;

}


/*==================================================
    RECENT TOPICS
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
            `editor.html?topic=${
                encodeURIComponent(topic.id)
            }`;

        const icon =
            document.createElement("span");

        icon.className =
            "recent-topic-icon";

        icon.textContent =
            topic.favorite
                ? "⭐"
                : "📄";

        const content =
            document.createElement("div");

        const heading =
            document.createElement("h3");

        heading.textContent =
            topic.title ||
            "Untitled Topic";

        const category =
            document.createElement("p");

        category.textContent =
            topic.category ||
            "Uncategorized";

        content.appendChild(heading);
        content.appendChild(category);

        link.appendChild(icon);
        link.appendChild(content);

        recentTopicsContainer.appendChild(
            link
        );

    });

}


/*==================================================
    CATEGORY BREAKDOWN
==================================================*/

function renderCategoryBreakdown(
    categories = []
) {

    categoryBreakdownContainer.innerHTML =
        "";

    if (categories.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No topics yet.";

        categoryBreakdownContainer
            .appendChild(emptyMessage);

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
            `${
                (
                    category.count /
                    highestCount
                ) * 100
            }%`;

        bar.appendChild(fill);

        const value =
            document.createElement("span");

        value.className =
            "breakdown-value";

        value.textContent =
            String(category.count);

        row.appendChild(label);
        row.appendChild(bar);
        row.appendChild(value);

        list.appendChild(row);

    });

    categoryBreakdownContainer.appendChild(
        list
    );

}


/*==================================================
    FEEDBACK STATES
==================================================*/

function showDashboardLoading() {

    recentTopicsContainer.innerHTML = `
        <div class="recent-topics-empty">
            <p>Loading cloud topics...</p>
        </div>
    `;

    categoryBreakdownContainer.innerHTML =
        "<p>Loading breakdown...</p>";

}


function showDashboardError() {

    recentTopicsContainer.innerHTML = `
        <div class="recent-topics-empty">
            <p>
                The dashboard could not load
                your cloud topics.
            </p>
        </div>
    `;

    categoryBreakdownContainer.innerHTML =
        "<p>Breakdown unavailable.</p>";

}


/*==================================================
    START APPLICATION
==================================================*/

initializeDashboard();