const authForm =
    document.getElementById("auth-form");

const emailInput =
    document.getElementById("auth-email");

const passwordInput =
    document.getElementById("auth-password");

const signUpButton =
    document.getElementById("sign-up");

const authMessage =
    document.getElementById("auth-message");


function showAuthMessage(message, type = "") {
    authMessage.textContent = message;

    authMessage.className =
        type
            ? `save-message ${type}`
            : "save-message";
}


/**
 * Signs an existing user into Activity Studio.
 *
 * @param {SubmitEvent} event
 * @returns {Promise<void>}
 */
async function signIn(event) {
    event.preventDefault();

    showAuthMessage("Signing in...");

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        showAuthMessage(
            error.message,
            "error"
        );

        return;
    }

    window.location.href =
        "dashboard.html";
}


/**
 * Creates a new Activity Studio account.
 *
 * @returns {Promise<void>}
 */
async function signUp() {
    showAuthMessage("Creating account...");

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || password.length < 8) {
        showAuthMessage(
            "Enter a valid email and a password of at least eight characters.",
            "error"
        );

        return;
    }

    const { data, error } =
        await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo:
                    `${window.location.origin}${window.location.pathname}`
            }
        });

    if (error) {
        showAuthMessage(
            error.message,
            "error"
        );

        return;
    }

    if (data.session) {
        showAuthMessage(
            "Account created and signed in.",
            "success"
        );

        window.location.href =
            "dashboard.html";

        return;
    }

    showAuthMessage(
        "Account created. Check your email to confirm your address.",
        "success"
    );
}


authForm.addEventListener(
    "submit",
    signIn
);

signUpButton.addEventListener(
    "click",
    signUp
);