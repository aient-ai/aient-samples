# Glimt App

This is a [Next.js](https://nextjs.org/) project managed with [pnpm](https://pnpm.io/).
It is intentionally **not** part of the root Glimt workspace—treat this directory as a
copyable demo shell that can be run in isolation.

## Getting Started

First, ensure you have pnpm installed (the repo uses `pnpm@10.22.0` via `corepack use pnpm@10.22.0`).
Because this folder ships with its own `pnpm-workspace.yaml`, every pnpm command you run
from here is scoped locally—no monorepo dependencies are linked.

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Telemetry and production builds

The app sends server and browser OpenTelemetry data to Aient. Configure these
variables in the deployment environment; publishable keys are runtime ingest
credentials and must not be committed to source control:

```bash
AIENT_PUBLISHABLE_KEY=pk_...
OTEL_SERVICE_NAME=glimt-app
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.aient.ai
COMMIT_SHA=<deployed-git-sha>
COMMIT_REF=<deployed-git-branch>
BUILD_DATE=<utc-iso-8601-build-time>
AIENT_ENV=prod

NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_OTEL_SERVICE_NAME=glimt-app
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.aient.ai
NEXT_PUBLIC_COMMIT_SHA=<same-value-as-COMMIT_SHA>
NEXT_PUBLIC_COMMIT_REF=<same-value-as-COMMIT_REF>
NEXT_PUBLIC_AIENT_ENV=prod
```

`pnpm build` is the production build path. It builds the exact deployable
artifact and then uploads both `.next/static` browser maps and `.next/server`
server maps. Set the upload-scoped `AIENT_API_KEY` secret for this command; do
not use either publishable ingest key for source-map upload. The default server
bundle prefix is `/app/.next/server`; if the production runtime installs the app
under a different absolute path, set `AIENT_SERVER_BUNDLE_PREFIX` to the runtime
path ending in `.next/server`.

For a local production compilation without uploading artifacts, use
`pnpm build:app`. Source-map upload deliberately fails closed when its API key,
commit SHA, or generated maps are missing.

## Project Structure

```
.
├── .next/                      # Next.js build output (generated)
├── node_modules/               # Project dependencies (managed by pnpm)
├── public/                     # Static assets (currently empty)
├── src/
│   ├── app/                    # Next.js App Router directory
│   │   ├── globals.css       # Global stylesheets
│   │   ├── layout.tsx        # Root layout component (includes favicon via metadata)
│   │   ├── page.tsx          # Homepage component
│   │   ├── robots.ts         # robots.txt generator
│   │   └── sitemap.ts        # sitemap.xml generator
│   └── lib/                    # Utility functions and libraries
│       ├── clsx.ts           # Utility for conditional class names
│       └── env.ts            # Environment variable management (e.g., SITE_URL)
├── .gitignore                  # Specifies intentionally untracked files
├── eslint.config.mjs           # ESLint configuration
├── next-env.d.ts               # Next.js type definitions for TypeScript (generated)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project manifest and dependencies
├── pnpm-lock.yaml              # Exact versions of dependencies
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # This file
└── tsconfig.json               # TypeScript configuration
```

## Routing Basics (Next.js App Router)

This project uses the Next.js [App Router](https://nextjs.org/docs/app). Key concepts:

-   **File-system based routing:** Folders within `src/app/` define routes. For example, `src/app/page.tsx` corresponds to the `/` route.
-   **`layout.tsx`:** Defines the UI that is shared across multiple pages. The root layout at `src/app/layout.tsx` applies to all routes.
-   **`page.tsx`:** Defines the unique UI of a route.
-   **Special Files:** Files like `robots.ts` and `sitemap.ts` are used to generate `robots.txt` and `sitemap.xml` respectively. See the [Metadata Files documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) for more.

For a comprehensive understanding, please refer to the [Next.js App Router Documentation](https://nextjs.org/docs/app).

## Utilities (`src/lib`)

Reusable utility functions and modules are placed in the `src/lib` directory.

-   `clsx.ts`: A utility for constructing `className` strings conditionally. Useful for dynamic styling in React components.
-   `env.ts`: (Assumed based on usage in `robots.ts` and `sitemap.ts`) Likely used for centralizing and accessing environment variables like `SITE_URL`.


### clsx

    import { clsx } from 'clsx';

    // Strings (variadic)
    clsx('foo', true && 'bar', 'baz');
    //=> 'foo bar baz'

    // Objects
    clsx({ foo:true, bar:false, baz:isTrue() });
    //=> 'foo baz'

    // Objects (variadic)
    clsx({ foo:true }, { bar:false }, null, { '--foobar':'hello' });
    //=> 'foo --foobar'

    // Arrays
    clsx(['foo', 0, false, 'bar']);
    //=> 'foo bar'

    // Arrays (variadic)
    clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
    //=> 'foo bar baz hello there'

    // Kitchen sink (with nesting)
    clsx('foo', [1 && 'bar', { baz:false, bat:null }, ['hello', ['world']]], 'cya');
    //=> 'foo bar hello world cya'


## Key Dependencies

This project utilizes several key libraries to enhance functionality and developer experience:

-   **[@headlessui/react](https://headlessui.com/)**: A set of completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.
-   **[Framer Motion](https://www.framer.com/motion/)**: A production-ready motion library for React. It provides easy-to-use animations and gestures.
-   **[Lucide](https://lucide.dev/)**: A simply beautiful and consistent open-source icon toolkit. Provides a wide range of SVG icons.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
