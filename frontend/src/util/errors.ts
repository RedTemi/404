const FALLBACK_ERROR = "An unknown error occured!"

function normalizeError(input?: string) {

    if (!input) {
        return FALLBACK_ERROR;
    }

    if (input === `pq: duplicate key value violates unique constraint "newusers_pk"`) {
        return 'A user with these details already exists...'
    }

    if (input === "sql: no rows in result set") {
        return "Search returned no results."
    }

    return FALLBACK_ERROR;
}

export { normalizeError }
