# @sygnal/create-webflow-stack

Interactive scaffolder for Sygnal's Webflow-oriented Claude Code project setups. Pick a variant and the tool wires up the right MCP servers, Claude Code plugins, and project files so you can `claude` your way through Webflow work without hand-editing `.mcp.json` or chasing install commands.

Built for use inside an **existing project directory** — it augments the current folder, it does not create a new one.

## Quick start

```bash
npm create @sygnal/webflow-stack
```

That's it. The scaffolder will:

1. Verify Claude Code is installed on your PATH.
2. Prompt you to pick a variant (see below).
3. Ask any variant-specific questions (server name, beta endpoint, etc.).
4. Run the right `claude mcp add` / `claude plugin install` commands for you.
5. Print a short list of next steps.

After it finishes, restart Claude Code so newly installed plugins activate, then `claude` in the same directory.

## Requirements

- **Node.js ≥ 18**
- **Claude Code CLI** on your PATH — install instructions at [claude.com/claude-code](https://www.claude.com/product/claude-code). The scaffolder shells out to `claude mcp add` and `claude plugin install`, so it can't proceed without it.
- A directory you want to scaffold into. Run the command from inside it.

## Variants

| Variant | What it installs | When to use |
|---|---|---|
| **Webflow** | Webflow MCP only | Base setup for Webflow work — anything that needs Claude Code to talk to Webflow but doesn't fit one of the more opinionated flows below. |
| **Webflow → Webflow migration** | Two Webflow MCP entries with `-source` and `-dest` suffixes | Migrating content/structure between two Webflow sites. The two entries authenticate separately so each can be pointed at a different Webflow account. |
| **Claude Design → Webflow** | Webflow MCP + Chrome DevTools plugin | Translating a Claude Design prototype into a Webflow site. |

All variants share the same Webflow MCP prompt flow: you name the MCP server entry (defaults to `webflow-<dirname>`, or a base name for the migration variant) and choose between the public endpoint and the gated beta endpoint.

> **Webflow beta endpoint:** only answer "yes" to the beta prompt if you are officially enrolled in the Webflow private beta program. Otherwise the MCP will fail to connect.

## What the scaffolder touches

Depending on the variant, you may see new or updated:

- `.mcp.json` — Webflow MCP server entries (project scope). The migration variant adds two entries (`-source` and `-dest`).
- `.claude/` — plugin marketplace registrations and plugin installs (Chrome DevTools).

Commit both `.mcp.json` and `.claude/`.

## Alternative invocations

```bash
# Standard
npm create @sygnal/webflow-stack

# Equivalent, explicit
npx @sygnal/create-webflow-stack@latest

# Persistent global install
npm install -g @sygnal/create-webflow-stack
create-webflow-stack
```

`npm create @sygnal/webflow-stack` and `npx @sygnal/create-webflow-stack` always pull the latest published version, so you don't need to upgrade anything manually.

## Local development

Working on the scaffolder itself:

```bash
git clone https://github.com/sygnaltech/create-webflow-stack.git
cd create-webflow-stack
npm install
npm link
```

`npm link` registers your working copy as the global `create-webflow-stack` command. Every change on disk takes effect immediately — no rebuild.

To test against a real project, `cd` into any directory and run `create-webflow-stack`.

To revert to the published version:

```bash
npm unlink -g @sygnal/create-webflow-stack
npm install -g @sygnal/create-webflow-stack
```

### Project layout

```
bin/index.js                  # entry point (shebang, calls src/cli.js)
src/cli.js                    # variant picker
src/variants/*.js             # one file per variant; composes the installers below
src/mcp/webflow.js            # Webflow MCP prompt + install
src/mcp/install.js            # shared `claude mcp add` runner
src/plugins/chrome-devtools.js
src/plugins/install.js        # shared marketplace + plugin install runners
src/util/cancel.js            # @clack/prompts cancel handling
src/checks.js                 # preflight (claude on PATH, etc.)
```

Adding a new variant: drop a file in `src/variants/`, compose any combination of the `mcp/*` and `plugins/*` modules, then register it in [src/cli.js](src/cli.js) in the `VARIANTS` array.

## Publishing (maintainers)

```bash
npm version patch   # or minor / major
npm publish         # publishConfig.access: public is already set
```

## License

[MIT](LICENSE)
