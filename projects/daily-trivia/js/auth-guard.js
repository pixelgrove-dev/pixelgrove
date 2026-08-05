/**
 * Protects pages that require an authenticated Supabase user.
 */

async function requireAuthenticatedUser() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.replace("login.html");
        return null;
    }

    return user;
}