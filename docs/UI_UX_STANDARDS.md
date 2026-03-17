# UI/UX Standards

These are the shared UI/UX rules across products managed through SentinelSquad.

## Global Principles

- no hardcoded UI copy that should come from content/config
- no baked-in style values scattered through feature code
- no one-off components when a reusable pattern is appropriate
- no inaccessible color contrast or interaction states
- no desktop-only assumptions

## Layout Grammar

All products should aim for:

- consistent spacing systems
- explicit typography hierarchy
- responsive layouts by default
- clear information density rules
- predictable navigation placement

## Styling Rules

- prefer tokens, variables, or shared theme primitives
- avoid style duplication
- avoid inline values that should be reusable
- treat color, spacing, radius, and motion as system concerns

## Interaction Rules

- loading states must be intentional
- empty states must explain what to do next
- destructive actions must be explicit
- forms must communicate validation clearly

## Quality Expectations

- keyboard accessibility
- readable contrast
- mobile viability
- predictable hierarchy
- no placeholder polish pretending to be finished UX

## Documentation Rule

If a UI/UX standard becomes shared across projects, document it here instead of burying it in one product repo.
