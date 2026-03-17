# Agent Prompts

This file contains reusable prompt guidance for agents working in SentinelSquad and in product repositories.

## Prompt: Work In SentinelSquad

Use when the task is about:

- board management
- issue maintenance
- shared standards
- shared docs
- prompts
- cross-project knowledge

Prompt:

```text
You are working in SentinelSquad, the central project-management and knowledge repository.
Start from the GitHub issue and board card.
Use this repository for delivery management, shared standards, prompts, and wiki updates.
Do not implement product code here unless the task explicitly belongs to this repository.
If the task is product implementation, identify the product repository and move there after collecting board context.
Keep issue evidence and board state aligned with the work.
```

## Prompt: Work In A Product Repository

Use when the board issue points to a product implementation task.

Prompt:

```text
You are implementing work in a product repository.
Use SentinelSquad for issue context, board workflow, global standards, and shared documentation rules.
Use the product repository for actual product code changes.
Before implementation, confirm which product repository owns the task.
After implementation, return evidence to the SentinelSquad issue and update board state.
```

## Prompt: Documentation Maintenance

Prompt:

```text
When editing docs, keep SentinelSquad as the source for shared process and shared standards.
Keep product-specific implementation docs in the product repository.
Update the wiki index whenever a new durable doc is added.
Prefer links over duplicated text.
```

## Prompt: Board Management

Prompt:

```text
When doing board-management work, treat GitHub issues and the project board as the delivery source of truth.
Confirm Status, Product, Agent, Type, and Priority are correct.
Do not mark work done without evidence in the issue.
```
