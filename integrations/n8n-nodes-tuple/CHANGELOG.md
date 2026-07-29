# Changelog

## 0.2.0

- Add the **Tuple Chat Model** sub-node (`lmChatTuple`), built on `@n8n/ai-node-sdk`. It plugs into the AI Agent and Basic LLM Chain nodes as a language model, so Tuple can be used as a drop-in replacement for any chat model provider.
- The Tuple Chat Model node loads the model list from your Tuple instance, with `auto` (Tuple routing) as the default.
- **Breaking:** the Tuple action node is no longer exposed as an AI Agent tool (`usableAsTool` removed). Tuple is a model router, not a tool — use the new Tuple Chat Model node to connect agents to Tuple. Existing workflows that call the action node directly are unaffected.

## 0.1.4

- Correct the node codex identifier and category for n8n verification.
- Remove unsupported node codex metadata.

## 0.1.3

- Respect the response mode configured by Tuple routing.
- Parse streaming responses into n8n workflow output.

## 0.1.2

- Mirror node source files at the repository root for n8n Creator Portal verification.

## 0.1.1

- Include build artifacts required by the n8n Creator Portal repository checks.

## 0.1.0

- Initial Tuple community node for n8n.
