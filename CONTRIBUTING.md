# Contributing to SaaSBridge

Thanks for considering a contribution. SaaSBridge is intentionally small; most PRs should make the starter *simpler* or *safer*, not bigger.

## Ground rules

- **Keep the stack lean.** Do not add a new dependency without a justification written into `docs/tech-stack-decisions.md`. If you're unsure, open an issue first.
- **Follow `AGENTS.md`.** It's the canonical behavioral contract for both human contributors and AI agents.
- **Respect the v1 scope.** Billing, orgs/teams, queues, full i18n, etc. are deliberately deferred. Open a discussion first before proposing one of these.
- **Security-sensitive changes** (auth, rate-limit, CSP, webhook verification) require extra care and should include tests.

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/nextbase.git
cd nextbase
pnpm install
cp .env.example .env.local
# fill in DATABASE_URL + BETTER_AUTH_SECRET (at minimum)
pnpm db:generate && pnpm db:migrate
pnpm dev
```

## Development workflow

1. Create a branch off `main` — `git switch -c feat/<short-description>`
2. Write tests first for logic (`src/lib/**`), or describe the manual verification in the PR for UI changes
3. Run `pnpm lint && pnpm typecheck && pnpm test:unit` before pushing
4. For UI changes, run `pnpm test:e2e` locally
5. Open a PR against `main` with a descriptive title and a clear *why* in the body

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or adjusting tests
- `ci:` — CI/workflow changes
- `chore:` — tooling, deps, maintenance

Keep the subject under 72 chars. Use the body for the *why*.

## Pull request checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:unit` passes
- [ ] `pnpm test:e2e` passes (if you touched UI)
- [ ] I updated relevant docs (`docs/`, `README.md`, `AGENTS.md`)
- [ ] I added a changeset to `docs/tech-stack-decisions.md` if I added/removed a dependency
- [ ] The PR is focused — one logical unit of change

## Reporting bugs and security issues

- Functional bugs: [open an issue](../../issues/new/choose).
- Security vulnerabilities: **do not** open a public issue. See [`SECURITY.md`](SECURITY.md) for private disclosure.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Be kind; assume good intent; help beginners.
