# plans/

| File | What it is |
|---|---|
| `PLAN.md` | the frontend plan: stack, auth, pages, backend schema, phases, DoD |
| `backend-guide.MD` | how the backend works (graph, tools, grounding, states, limits) — read before designing screens |
| `../AGENTS.md` | standing rules for the coding agent (Next 16 + shadcn, safety, git) |

The **backend repo is READ-ONLY** for this work:

```
/Volumes/Mitul/Projects/Nimbus-Ticketing-Agent/saas-ticketing-agentic-sm-backend
```

Read anything there; never edit, stage, commit or run file-writing commands in it. A change the UI
needs is a backend change and belongs in a backend-repo session with the owner.

The **route contract** lives there (single source of truth, updated with the backend):

```
../saas-ticketing-agentic-sm-backend/plans/frontend-api-guide.MD
```

Read it there rather than copying it here — a copy drifts. If the backend and the guide disagree,
the backend wins; update the guide in the same backend change (its §14 policy).
