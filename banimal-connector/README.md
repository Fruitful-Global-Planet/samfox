# Banimal Connector

The first real, working piece of the Banimal Connector: a Claude Code plugin
that installs the single canonical Sam Fox™ CI Guide into your Claude Code
profile, so any session — on any of your machines — pulls brand rules from
one source instead of re-deriving or guessing them.

This is a **pull** model on purpose: nothing pushes to your machine. Claude
reads `skills/samfox-ci-guide/SKILL.md` fresh whenever brand-facing work comes
up. Every future adapter (WordPress plugin, GitHub Actions sweep across the
`heyns1000` org, Replit sync) is meant to be built by porting this exact
content, not by re-writing the rules from scratch.

## Install as a plugin (recommended — versioned, works across machines)

From the parent repo (or wherever you keep this folder) on your Mac,
MacBook Air, or Linux box:

```bash
claude plugin marketplace add /absolute/path/to/samfox/banimal-connector
claude plugin install banimal-connector
```

Use the absolute path to the `banimal-connector/` folder itself — a repo must
be either a marketplace or a plugin, not both, and this folder is the plugin.

## Install as a project skill (quick, no plugin system needed)

Copy the skill folder into any repo you want it active in:

```bash
mkdir -p .claude/skills
cp -r /path/to/samfox/banimal-connector/skills/samfox-ci-guide .claude/skills/
```

Claude Code auto-loads it whenever you open that repo.

## Install as a personal skill (every session, every repo, one machine)

```bash
mkdir -p ~/.claude/skills
cp -r /path/to/samfox/banimal-connector/skills/samfox-ci-guide ~/.claude/skills/
```

Do this on each Mac/MacBook Air/Linux machine you work from until the plugin
route is wired into your device network.

## What it enforces

See `skills/samfox-ci-guide/SKILL.md` for the full source: the verified
9-color palette, the six-move fox-head construction rules, typography, the
"o in fox is the icon, never a typed letter" rule, and compliance language
(™ not ®, entity line locked to Fruitful Shops (Pty) Ltd).
