export type Loc = { lat: number; lng: number } | null;

const KEY = "app:lastLocation";
const BC_NAME = "app:location";

const hasWindow = typeof window !== "undefined";
const bc: BroadcastChannel | null = hasWindow && "BroadcastChannel" in window ? new BroadcastChannel(BC_NAME) : null;

export function getLocation(): Loc {
    if (!hasWindow) return null;
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Loc) : null;
    } catch {
        return null;
    }
}

export function setLocation(loc: Loc) {
    if (!hasWindow) return;
    try {
        if (loc === null) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, JSON.stringify(loc));
    } catch {
        // ignore
    }

    try {
        bc?.postMessage(loc);
    } catch {
        // ignore
    }

    try {
        // dispatch a custom event as a further fallback
        window.dispatchEvent(new CustomEvent("app:location:update", { detail: loc }));
        // debug
        try { console.debug && console.debug('locationStore.setLocation', loc); } catch (e) { }
    } catch {
        // ignore
    }
}

export function clearLocation() {
    setLocation(null);
}

export function subscribe(cb: (loc: Loc) => void) {
    if (!hasWindow) return () => { };

    const onBC = (e: MessageEvent) => {
        cb(e.data as Loc);
    };

    const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
            try {
                cb(e.newValue ? (JSON.parse(e.newValue) as Loc) : null);
            } catch {
                cb(null);
            }
        }
    };

    const onCustom = (e: Event) => {
        // @ts-ignore
        cb((e as CustomEvent).detail as Loc);
    };

    bc?.addEventListener("message", onBC);
    window.addEventListener("storage", onStorage);
    window.addEventListener("app:location:update", onCustom as EventListener);

    // immediately emit current value
    cb(getLocation());

    return () => {
        bc?.removeEventListener("message", onBC);
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("app:location:update", onCustom as EventListener);
    };
}
