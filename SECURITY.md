# Security Policy

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report privately via GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab
2. Click **Report a vulnerability**
3. Provide a clear description, reproduction steps, affected versions, and potential impact

We aim to acknowledge reports within **72 hours** and provide an initial assessment within **7 days**.

## Scope

This project is a boilerplate / starter. Security concerns in this repository are primarily:

- Defaults that mislead users into insecure configurations
- Authentication and session-management patterns
- Rate-limiting, CSP, and security-header defaults
- Dependency-chain vulnerabilities in declared dependencies
- Example code that leaks secrets or encourages unsafe patterns

## Out of scope

- Vulnerabilities in applications *built on top of* this starter after the user modifies it
- Vulnerabilities in third-party services (Neon, Vercel, Netlify, Resend — report directly to those vendors)
- Social-engineering attacks

## What to expect

If your report is valid:
1. We confirm the issue and assess severity (CVSS-aligned)
2. We work on a fix in a private branch
3. We coordinate disclosure timing with you
4. We publish a security advisory and credit you (unless you prefer anonymity)

## Supported versions

Only the latest `main` branch is supported. Forks of this template are the user's responsibility.
