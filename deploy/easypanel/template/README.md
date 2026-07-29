# Easypanel Template

This directory contains the Tuple template files intended for the upstream
[`easypanel-io/templates`](https://github.com/easypanel-io/templates)
repository.

To submit upstream, copy these files into:

```text
templates/tuple/index.ts
templates/tuple/meta.yaml
```

The template provisions:

- Tuple app service from `tupleai/tuple:6`.
- PostgreSQL 16 service.
- Generated database password, Better Auth secret, and Tuple encryption key.
- HTTPS domain proxy on port `2099`.
