async function checkConnection() {
    try {
        const response = await fetch("https://www.google.com", {
            method: "HEAD",
            cache: "no-cache",
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

export default checkConnection;