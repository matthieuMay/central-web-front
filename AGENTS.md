## Agent skills

### Issue tracker

Issues and specs live as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five canonical role names as status strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Prompt storage

Store prompts in `./prompts/` as Markdown files named `<timestamp>-<summary>.md`. Use a UTC timestamp in `YYYYMMDDTHHMMSSZ` format and a snake_case summary of at most three words (for example, `20261008T143000Z-setup_local_skills.md`).

This should be done with every starting prompts. The rest of the session should not be written
