# Tote rack planner

Garage shelving planner: describe your walls and boxes, get elevations, a cut list and a shopping list.

- `index.html` - the whole app (static).
- `api/chat.js` - Vercel serverless function that forwards chat requests to the Anthropic API.

## Environment variables (Vercel project settings)

| Name | Required | Purpose |
|---|---|---|
| ANTHROPIC_API_KEY | yes | Your Anthropic API key |
| APP_PASSCODE | recommended | Any string; the app asks for it once before chatting |
| ANTHROPIC_MODEL | no | Defaults to `claude-sonnet-5` |

Redeploy after changing environment variables.
