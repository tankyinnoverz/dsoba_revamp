# DigitalOcean staging deployment guide

Deploy Public Web and Member Portal to DigitalOcean App Platform before external provider integration. This is staging only.

## Topology

Use one App Platform app with two Node.js services from the same repository and `staging` branch:

| Service | Run command | Port | Health path |
| --- | --- | ---: | --- |
| public-web | `node apps/public-web/.output/server/index.mjs` | 8080 | `/` |
| member-portal | `node apps/member-portal/.output/server/index.mjs` | 8080 | `/login` |

Use separate domains such as `public-staging.example.org` and `portal-staging.example.org`. App Platform also supplies an `ondigitalocean.app` starter domain.[^domains]

## Required settings

For both services use source directory `/`, environment `node-js`, HTTP port `8080`, `HOSTNAME=0.0.0.0`, `PORT=8080`, `NODE_ENV=staging`, and `NUXT_PUBLIC_API_BASE=https://<staging-api-host>/api/v1`.

Public Web build command:

```text
corepack enable && corepack pnpm install --frozen-lockfile && corepack pnpm --filter @dsoba/public-web build
```

Use the equivalent `@dsoba/member-portal` filter for the Member Portal. Use encrypted App Platform variables for secrets; restrict console/configuration access to trusted team members.[^env]

## App spec template

Replace repository, API host and domain placeholders. Do not put secrets in this file.

```yaml
name: dsoba-staging
region: sgp
services:
  - name: public-web
    github:
      repo: YOUR_ORG/YOUR_REPO
      branch: staging
      deploy_on_push: true
    environment_slug: node-js
    source_dir: /
    build_command: corepack enable && corepack pnpm install --frozen-lockfile && corepack pnpm --filter @dsoba/public-web build
    run_command: node apps/public-web/.output/server/index.mjs
    http_port: 8080
    instance_count: 1
    instance_size_slug: apps-s-1vcpu-1gb
    envs:
      - key: NODE_ENV
        value: staging
        scope: RUN_TIME
        type: GENERAL
      - key: HOSTNAME
        value: 0.0.0.0
        scope: RUN_TIME
        type: GENERAL
      - key: PORT
        value: "8080"
        scope: RUN_TIME
        type: GENERAL
      - key: NUXT_PUBLIC_API_BASE
        value: https://STAGING_API_HOST/api/v1
        scope: RUN_TIME
        type: GENERAL
    health_check:
      http_path: /
      port: 8080
      initial_delay_seconds: 30
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 5
```

Create a second service by copying the service block and changing its name, build filter, run command and health path to `/login`. App specs define services, build/run commands and environment variables.[^appspec][^commands] Health checks can use an HTTP path and port.[^health]

## Deploy with doctl

```powershell
doctl auth init
doctl apps create --spec .do/app.staging.yaml
```

For an existing app:

```powershell
doctl apps update <APP_ID> --spec .do/app.staging.yaml
doctl apps get <APP_ID>
doctl apps logs <APP_ID> --type run
```

The spec must define the complete app configuration when updating.[^appspec]

## Verification

- Open Public Web home, news, events, chapters, membership and application routes.
- Open Member Portal login, reset-password and protected-route redirect.
- Check 390px mobile and desktop layouts.
- Confirm API requests use only the staging API host and CORS allows only staging origins.
- Confirm no production credentials or real CRM data are present.
- Review logs for secrets, local paths or personal data.
- Verify rollback to the previous successful deployment.

## Limitation before API staging

The UI can deploy independently, but application submission, login, directory and profile actions need a reachable staging API. Do not point staging at localhost. Deploy a separate staging API and staging database before calling those flows integrated.

[^appspec]: [DigitalOcean App Platform app specification](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
[^commands]: [DigitalOcean build and run commands](https://docs.digitalocean.com/products/app-platform/how-to/build-run-commands/)
[^env]: [DigitalOcean environment variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
[^health]: [DigitalOcean health checks](https://docs.digitalocean.com/products/app-platform/how-to/manage-health-checks/)
[^domains]: [DigitalOcean domains](https://docs.digitalocean.com/products/app-platform/how-to/manage-domains/)
