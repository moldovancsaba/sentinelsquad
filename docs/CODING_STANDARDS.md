# Coding Standards

These are the shared engineering standards across projects managed by SentinelSquad.

## Core Rules

- No hardcoded business data when structured configuration or data modeling is appropriate.
- No baked-in styling that blocks reuse, theming, or layout evolution.
- No undocumented behavior changes.
- No dead files, abandoned variants, or duplicate implementations without a clear reason.
- No silent coupling between repositories.

## Architecture Expectations

- prefer explicit boundaries
- prefer composable modules over hidden global state
- prefer configuration over magic constants
- prefer small, reversible changes
- prefer traceable naming

## Data and Configuration

- keep environment-specific values in configuration, not in feature code
- keep shared constants centralized when multiple features depend on them
- use schema-backed or typed structures where possible

## Documentation Discipline

- shared rules belong here in SentinelSquad
- product-local implementation docs belong in the product repository
- update docs when process or standards change

## Validation

Before calling work complete:

- build passes
- relevant tests pass
- warnings are understood or removed
- issue evidence is posted

## Cross-Repository Rule

If the change affects multiple products, document the standard here first.
