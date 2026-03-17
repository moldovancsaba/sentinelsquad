# Rules

These are the global operating rules for SentinelSquad.

## Delivery Rules

- delivery work starts from an issue in this repository
- delivery work must remain synchronized with the board
- the `Product` field must identify the target product
- implementation should happen in the product repository when the task is product code

## Documentation Rules

- shared rules belong in SentinelSquad
- product-specific implementation docs belong in the product repository
- new durable docs must be linked from [WIKI.md](WIKI.md)

## Engineering Rules

- no hardcode when configuration or modeling is the right solution
- no baked-in style systems
- no hidden cross-repo coupling
- no undocumented process changes

## Completion Rules

- validation must be run
- evidence must be recorded
- board state must be current
