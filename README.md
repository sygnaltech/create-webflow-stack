# @sygnal/create-webflow-stack

Interactive scaffolder for Sygnal's Webflow-oriented Claude Code project setups. Pick a variant and the tool wires up the right MCP servers, Claude Code plugins, and project files so you can `claude` your way through Webflow work without hand-editing `.mcp.json` or chasing install commands.

Built for use inside an **existing project directory** — it augments the current folder, it does not create a new one.

## Quick start

```bash
npm create @sygnal/webflow-stack@latest
```

**Always include `@latest`.** It is a moving tag (not a version number), so this exact command always runs the newest published build — without it, npx can silently re-run an older cached copy. See [npx caches by version](#alternative-invocations) below.

That's it. The scaffolder will:

1. Verify Claude Code is installed on your PATH.
2. Prompt you to pick a variant (see below).
3. Ask any variant-specific questions (server name, beta endpoint, etc.).
4. Run the right `claude mcp add` commands, and install the matching Sygnal skills automatically.
5. Print a short list of next steps.

After it finishes, restart Claude Code so the new MCP servers are picked up, then `claude` in the same directory.

## Requirements

- **Node.js ≥ 18**
- **Claude Code CLI** on your PATH — install instructions at [claude.com/claude-code](https://www.claude.com/product/claude-code). The scaffolder shells out to `claude mcp add`, so it can't proceed without it.
- A directory you want to scaffold into. Run the command from inside it.

## Variants

| Variant | What it installs | When to use |
|---|---|---|
| **Webflow** | Webflow MCP + `webflow-mcp` skill | Base setup for Webflow work — anything that needs Claude Code to talk to Webflow but doesn't fit one of the more opinionated flows below. |
| **Webflow → Webflow migration** | Two Webflow MCP entries (`-source`/`-dest`) + `webflow-mcp` skill | Migrating content/structure between two Webflow sites. The two entries authenticate separately so each can be pointed at a different Webflow account. |
| **Claude Design → Webflow** | Webflow MCP + Chrome DevTools MCP + `webflow-mcp` & `claude-design-to-webflow` skills | Translating a Claude Design prototype into a Webflow site. |
| **Chrome DevTools MCP** | Chrome DevTools MCP only, with a Chrome profile unique to this project | Driving a real browser from Claude Code — inspecting, screenshotting, tracing performance — without the Webflow pieces. |

The Webflow variants share the same Webflow MCP prompt flow: you name the MCP server entry (defaults to `webflow-<dirname>`, or a base name for the migration variant) and choose between the public endpoint and the gated beta endpoint.

> **Webflow beta endpoint:** only answer "yes" to the beta prompt if you are officially enrolled in the Webflow private beta program. Otherwise the MCP will fail to connect.

## Chrome DevTools MCP

Both the **Chrome DevTools MCP** and **Claude Design → Webflow** variants register a `stdio` MCP server that launches `chrome-devtools-mcp` via `npx`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@1.10.1",
        "--categoryExtensions",
        "--userDataDir=D:\\Projects\\acme-site\\.chrome-profile",
        "--viewport=1440x900"
      ],
      "env": {}
    }
  }
}
```

### The profile must be unique per project

Chrome refuses to run two instances against one user-data directory — the second launch fails with *"The browser is already running for …"*. So every project needs its own profile, and the scaffolder asks where to put it:

- **In the project — `./.chrome-profile`** (default). Unique by construction, no naming to get wrong, and it disappears when the project does. The scaffolder creates the directory and appends `.chrome-profile/` to `.gitignore`.
- **`~/.cache/chrome-devtools-mcp/profiles/<name>`**. Survives a clean clone, so logged-in sessions persist across re-clones. You pick the name (defaults to the directory name) and it's on you to keep it unique across projects.

Either way the path is written into `.mcp.json` as an **absolute** path for the machine that ran the scaffolder. If teammates share the committed `.mcp.json`, each of them should re-run the scaffolder (or hand-edit that one argument) so the path resolves locally.

> `chrome-devtools-mcp` only creates the profile directory when `--userDataDir` is *omitted*, so the scaffolder creates it explicitly rather than leaving it to Chrome.

### Pinned version

The server version is pinned in [src/mcp/chrome-devtools.js](src/mcp/chrome-devtools.js) (`CHROME_DEVTOOLS_MCP_VERSION`) rather than floating on `@latest`, so a committed `.mcp.json` launches the same build on every machine. Bump that constant to move a project forward — and re-check the flags against the new release, because they do move: `--experimentalPageIdRouting` was removed after 1.3.0 and page-ID routing is now on by default. The server's argument parser is **not** strict, so a flag that no longer exists is silently ignored rather than reported.

## Skills

Every **Webflow** variant **automatically installs** the matching **Sygnal Webflow skills** — agent skills that teach Claude Code how to work with the Webflow MCP effectively. These are the point of the tool, so there is **no opt-out prompt** for them:

- **`webflow-mcp`** — using the Webflow MCP: the two-transport model, capability/limitation map, and the confirmed bugs + workarounds. Installed by every Webflow variant.
- **`claude-design-to-webflow`** — the design-migration workflow (phases, human-vs-agent split, restyling playbook, component authoring). Installed by the Claude Design → Webflow variant, on top of `webflow-mcp`.

Skills are installed with the [`skills`](https://skills.sh) CLI, which reads them **directly from a public GitHub repo** — [`sygnaltech/webflow-skills`](https://github.com/sygnaltech/webflow-skills) — so nothing needs to be published to npm. You can also install them by hand at any time:

```bash
npx skills add sygnaltech/webflow-skills --skill webflow-mcp
npx skills add sygnaltech/webflow-skills --skill claude-design-to-webflow
```

Each Webflow variant also offers (opt-in, default no) to additionally install the **official** `webflow/webflow-skills` set. The standalone **Chrome DevTools MCP** variant installs no skills.

## What the scaffolder touches

Depending on the variant, you may see new or updated:

- `.mcp.json` — MCP server entries (project scope): Webflow, Chrome DevTools, or both. The migration variant adds two Webflow entries (`-source` and `-dest`).
- `.gitignore` — `.chrome-profile/`, when the Chrome profile is kept in the project.
- `.chrome-profile/` — the project's Chrome user-data directory. Machine-local and ignored; never commit it.
- `.claude/` — skill installs.

Commit `.mcp.json`, `.gitignore`, and `.claude/`.

## Alternative invocations

```bash
# Standard
npm create @sygnal/webflow-stack@latest

# Equivalent, explicit
npx @sygnal/create-webflow-stack@latest

# Persistent global install (upgrades on demand)
npm install -g @sygnal/create-webflow-stack@latest
create-webflow-stack
```

The scaffolder prints its version on the first line (`create-webflow-stack vX.Y.Z`) — check it against the latest on npm if you're unsure what you're running.

> **Why `@latest` matters.** `npm create` / `npx` cache packages by version, so the **bare** command `npm create @sygnal/webflow-stack` can silently re-run an older cached build even after a newer version is published. `@latest` is a moving tag that npm repoints at every publish, so it forces resolution of the newest release and never needs updating in docs. If the printed version is still stale (aggressive metadata cache), add `-- --prefer-online`, or clear the cache: delete `%LocalAppData%\npm-cache\_npx` (Windows) / `~/.npm/_npx` (macOS/Linux), then re-run.

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
npm install -g @sygnal/create-webflow-stack@latest
```

### Project layout

```
bin/index.js                  # entry point (shebang, calls src/cli.js)
src/cli.js                    # variant picker
src/variants/*.js             # one file per variant; composes the installers below
src/mcp/webflow.js            # Webflow MCP prompt + install
src/mcp/chrome-devtools.js    # Chrome DevTools MCP prompt + install (pinned version, profile)
src/mcp/install.js            # shared `claude mcp add` runner
src/plugins/install.js        # shared marketplace + plugin install runners (unused; kept for future plugin variants)
src/skills/webflow.js         # skills installer (Sygnal + official Webflow sets)
src/util/cancel.js            # @clack/prompts cancel handling
src/util/gitignore.js         # idempotent .gitignore entry appender
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
