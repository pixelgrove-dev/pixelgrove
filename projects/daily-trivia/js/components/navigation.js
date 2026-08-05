/**
 * Builds the shared application navigation.
 *
 * The current page is detected automatically so the matching
 * navigation link can receive aria-current="page".
 *
 * @returns {void}
 */
function renderAppNavigation() {

    const navigationContainer =
        document.getElementById("app-navigation");

    if (!navigationContainer) {
        return;
    }

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "dashboard.html";

    const navigationLinks = [
        {
            label: "Dashboard",
            href: "dashboard.html"
        },
        {
            label: "Library",
            href: "library.html"
        },
        {
            label: "Create Topic",
            href: "editor.html"
        },
        {
            label: "Worksheets",
            href: "worksheet.html"
        }
    ];

    const navigation =
        document.createElement("nav");

    navigation.className =
        "app-navigation";

    navigation.setAttribute(
        "aria-label",
        "Main navigation"
    );

    navigationLinks.forEach(linkData => {

        const link =
            document.createElement("a");

        link.href =
            linkData.href;

        link.textContent =
            linkData.label;

        if (currentPage === linkData.href) {
            link.setAttribute(
                "aria-current",
                "page"
            );
        }

        navigation.appendChild(link);

    });

    navigationContainer.appendChild(
        navigation
    );

}

renderAppNavigation();