import { test } from "node:test";
import assert from "node:assert/strict";

import { createShortcutRegistry, normalizeShortcut } from "../src/core/keys.js";

// Minimal stand-in for an adapter's key primitives (docs/ADAPTERS.md, "Keys").
function fakeBinder(taken = {}) {
	const bound = { ...taken };
	return {
		bound,
		isTaken: (key) => !!bound[key],
		add: (key, handler) => { bound[key] = handler; },
		remove: (key) => { delete bound[key]; }
	};
}

test("normalizeShortcut lowercases and requires a modifier", () => {
	assert.equal(normalizeShortcut("Shift + D"), "shift+d");
	assert.equal(normalizeShortcut("alt+shift+left"), "alt+shift+left");
	assert.throws(() => normalizeShortcut("d"), /modifier/);
	assert.throws(() => normalizeShortcut("shift+"), /modifier/);
	assert.throws(() => normalizeShortcut("x+d"), /modifier/);
});

test("register binds the key and list() reports it", () => {
	const binder = fakeBinder();
	const registry = createShortcutRegistry(binder);
	const handler = () => {};
	registry.register({ id: "dependencies", key: "shift+d", description: "Dependencies", handler });
	assert.equal(binder.bound["shift+d"], handler);
	assert.deepEqual(registry.list(), [{ id: "dependencies", key: "shift+d", description: "Dependencies" }]);
	assert.equal(registry.keyOf("dependencies"), "shift+d");
	assert.equal(registry.keyOf("other"), null);
});

test("register refuses a key that is already taken and leaves it intact", () => {
	const existing = () => {};
	const binder = fakeBinder({ "shift+d": existing });
	const registry = createShortcutRegistry(binder);
	assert.throws(() => registry.register({ id: "dependencies", key: "shift+d", handler: () => {} }), /already used/);
	assert.equal(binder.bound["shift+d"], existing);
});

test("register refuses the same key twice", () => {
	const registry = createShortcutRegistry(fakeBinder());
	registry.register({ id: "a", key: "shift+d", handler: () => {} });
	assert.throws(() => registry.register({ id: "b", key: "Shift+D", handler: () => {} }), /used twice/);
});

test("clear removes only our shortcuts", () => {
	const other = () => {};
	const binder = fakeBinder({ "shift+x": other });
	const registry = createShortcutRegistry(binder);
	registry.register({ id: "a", key: "shift+d", handler: () => {} });
	registry.clear();
	assert.deepEqual(Object.keys(binder.bound), ["shift+x"]);
	assert.deepEqual(registry.list(), []);
});
