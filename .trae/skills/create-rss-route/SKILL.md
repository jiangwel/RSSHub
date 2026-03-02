---
name: 'create-rss-route'
description: 'Creates and verifies a new RSSHub route for a given URI. Invoke when user wants to add a new RSS feed support.'
---

# Create RSS Route Skill

This skill automates the process of creating a new RSSHub route for a specific website URI.

## Workflow

1.  **Request URI**: Ask the user for the target website URI if not already provided.
2.  **Create Route**: Implement a new route in `lib/routes` corresponding to the URI. Follow RSSHub's best practices (see `AGENTS.md` rules).
3.  **Verify & Iterate**:
    - Execute the route locally to generate the RSS XML.
    - **Verification Criteria**:
        1.  Save the generated RSS XML content as a Markdown file (e.g., `debug-output.md`) for inspection.
        2.  Parse the output and ensure there are **at least 3 items**.
        3.  Ensure each item has a valid **title** and **content/description**.
    - **Failure Handling**: If verification fails (e.g., parsing error, empty content, fewer than 3 items), analyze the error/HTML, modify the route code, and repeat the verification step until it passes.
4.  **Notification**: Once verification passes, use the `send-email` skill to notify the user that the route is ready.

## Dependencies

- **send-email**: Used for the final notification step.

## Example Usage

User: "Create an RSS route for https://example.com/blog"

Agent:

1.  Analyzes `https://example.com/blog`.
2.  Creates `lib/routes/example/blog.ts` (or appropriate path).
3.  Runs the route, checks output.
4.  If successful, saves output to file and calls `send-email`.
