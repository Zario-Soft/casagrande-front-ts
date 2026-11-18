import axios from 'axios';

export const AUTOMATION_BLOCKED_HEADER = 'X-Automation-Blocked';

type Listener = () => void;

const listeners = new Set<Listener>();
let blocked = false;

/** True once any response in this page session was flagged. */
export const isAutomationBlocked = () => blocked;

export function subscribeAutomationBlocked(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

/** Fires on every flagged response, so the warning reopens each time. */
function notifyAutomationBlocked() {
    blocked = true;
    listeners.forEach(l => l());
}

function hasBlockedHeader(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    const normalized = String(value).trim().toLowerCase();
    return normalized !== '' && normalized !== 'false' && normalized !== '0';
}

/** Checks a header bag (axios headers object or fetch Headers) for the automation flag. */
export function checkAutomationHeaders(headers: any) {
    if (!headers) return;
    const value = typeof headers.get === 'function'
        ? headers.get(AUTOMATION_BLOCKED_HEADER)
        : headers[AUTOMATION_BLOCKED_HEADER.toLowerCase()] ?? headers[AUTOMATION_BLOCKED_HEADER];

    if (hasBlockedHeader(value)) notifyAutomationBlocked();
}

/** fetch wrapper for RTK Query's fetchBaseQuery({ fetchFn }). */
export const automationGuardFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    checkAutomationHeaders(response.headers);
    return response;
};

// Registered once at module load (HttpClient registers its own interceptor per instance).
axios.interceptors.response.use(
    response => {
        checkAutomationHeaders(response?.headers);
        return response;
    },
    error => {
        checkAutomationHeaders(error?.response?.headers);
        return Promise.reject(error);
    }
);
