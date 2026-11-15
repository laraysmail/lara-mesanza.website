// Release time for the "Checklist mochila gratuito" product (moved earlier: live from Sunday 15 Nov 2026).
// Before this moment its cards and page stay hidden; src/scripts/launch-gate.js reveals them in the
// browser at the exact time, and any deploy after it renders them visible straight away.
export const MOCHILA_LAUNCH = '2026-11-15T00:00:00+01:00';
export const mochilaLaunched = () => Date.now() >= Date.parse(MOCHILA_LAUNCH);
