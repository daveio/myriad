---
title: "CV — Dave Williams"
version: "1.0.0"
generated: "2026-07-24"
language: "en-GB"
purpose: >-
  Canonical, machine-readable CV data. Used to generate downstream artefacts:
  a print/application PDF and a web page on syn.horse (Nuxt 4). Not intended
  for direct presentation as a CV itself.
companion_files:
  - "CV.yaml — same content as structured data"
  - "CV.xml — same content as structured data"
sources:
  - "cv.dave-williams.pdf (Enhancv export, last updated July 2026)"
  - "Notion CV export (earlier iteration)"
  - "syn.horse (/cv, /projects, /now) and github.com/synmux, as of July 2026"
basics:
  name: "Dave Williams"
  aka: "syn"
  pronouns: "they/them"
  headline: "DevOps, SRE & Infrastructure Engineer"
  target_roles: "Senior DevOps / Infrastructure / SRE engineering roles"
  location: "London, United Kingdom"
  email: "syn@syn.as"
  phone: "+44 7432 104037"
  phone_e164: "+447432104037"
  website: "https://syn.horse"
  github: "https://github.com/synmux"
  linkedin: "https://linkedin.com/in/dcwilliams"
agent_notes:
  - "Spelling is UK English (en-GB); keep it that way in generated artefacts."
  - "The 2023–present period is deliberate independent work. When rendering a
    chronology, include the 'Independent Engineering Projects' entry and/or
    the Projects section so no unexplained gap appears."
  - "Earlier timeline gaps (2014–2016, 2017–2019) are historical; do not
    invent filler for them."
  - "Retired identity — do NOT use: dave@dave.io, github.com/daveio, dave.io.
    Current identity: syn@syn.as, github.com/synmux, syn.horse."
  - "Project taglines marked 'site voice' are intentionally lowercase and
    informal: use them for the web page; prefer the formal summaries for the
    PDF."
  - "Pronouns are provided as a data field; each downstream generator decides
    whether to render them."
---

# Dave Williams — DevOps, SRE & Infrastructure Engineer

London, United Kingdom · syn@syn.as · +44 7432 104037 · they/them
[syn.horse](https://syn.horse) · [github.com/synmux](https://github.com/synmux) · [linkedin.com/in/dcwilliams](https://linkedin.com/in/dcwilliams)

## Summary

Multiplatform infrastructure engineer with more than twenty years across DevOps, SRE, and systems administration, specialising in Kubernetes and Linux/\*BSD environments and equally comfortable in Windows. Extensive production experience with Google Cloud Platform and Amazon Web Services, more recently joined by the Cloudflare developer platform (Workers, D1). Strong Kubernetes administration and troubleshooting background, including initial buildouts and value-adds such as the Linkerd service mesh and Prometheus monitoring.

A great believer in automation over repetitive busywork — freeing engineering time for harder problems and minimising the scope for human error — with current tooling centred on infrastructure-as-code (Terraform, Pulumi), GitOps, and OpenTelemetry-based observability.

Experienced in running and managing a team: evaluating, hiring, and upskilling engineers; sprint-based task prioritisation; and balancing business-as-usual break/fix work against larger-scope project work. Most recently led infrastructure at Feeld for four years as Head of Infrastructure.

Programs in Go, Python, Ruby, JavaScript/TypeScript, and shell (a Fish enthusiast); intermediate Java; writes Rust for current CLI tooling. Lifelong special interest in information security — penetration testing, platform hardening, DFIR, and IoT security — alongside non-professional electronic engineering and making. A lateral and quick thinker when things inevitably go sideways.

## Key Achievements

- **Cost reduction at scale** — cut Feeld's monthly infrastructure spend by more than 75% through optimisation initiatives: standardising logging and OpenTelemetry instrumentation with the development team (roughly halving cloud spend), bringing Redis and PostgreSQL in-house, and applying serverless technologies.
- **Incident automation** — built automated remediation for common incidents, decreasing downtime by more than 40%.
- **Project leadership** — led the team to complete three major infrastructure projects on time and under budget.
- **SD-WAN implementation** — designed and rolled out an SD-WAN, reducing access-related developer tickets by more than 90% while improving security posture.

## Skills

- **Cloud platforms:** Google Cloud Platform, Amazon Web Services, Azure, Cloudflare (Workers, D1)
- **Containers & orchestration:** Kubernetes, Docker, containers, Linkerd service mesh
- **Automation & IaC:** Terraform, Pulumi, GitOps, infrastructure-as-code, CI/CD, serverless
- **Observability:** Prometheus, OpenTelemetry, monitoring, logging standardisation, incident management
- **Operating systems:** Linux (Red Hat/CentOS, Ubuntu), FreeBSD/\*BSD, Windows/Windows Server, macOS, AIX (historical)
- **Languages:** Go, Python, Ruby, JavaScript, TypeScript, shell (bash, fish), Rust; intermediate Java
- **Networking:** Cisco IOS, Vyatta, MikroTik, Ubiquiti, Juniper, SD-WAN, VoIP, load balancing (HAProxy, Nginx, Apache)
- **Data & storage:** PostgreSQL, MySQL, Redis, database administration, SAN/NAS (3PAR, EMC)
- **Virtualisation:** VMware
- **Security:** platform hardening, penetration testing, DFIR, IoT security, threat management, attack-surface reduction
- **Web frameworks (project work):** Nuxt, Vue, Tailwind CSS, Ruby on Rails (historical)
- **Leadership & practice:** team building and management, upskilling, sprint-based prioritisation, project and budget management, on-call rota design, runbooks

## Experience

### Independent Engineering Projects — Self-directed

- **Period:** 2023–present (~3 years)
- **Location:** London, United Kingdom
- Deliberate period of self-directed engineering following Feeld — see the **Projects** section at the end of this document for full detail.
- Designed, built, and operate a personal platform on modern serverless infrastructure: Nuxt 4 on Cloudflare Workers, deployed with Wrangler (syn.horse).
- Built and maintain genderbase.com, a structured directory of gender-affirming resources, on a quarterly content-review cycle.
- Shipped recon, an iOS image resize/conversion utility, through to App Store release.
- Wrote and maintain open-source CLI tooling in Rust, TypeScript, and Go (bunnypmsl, lics, rhymepass, noti, tabby).
- Developing Project Ambio: C++ firmware with a public Nuxt 4 companion platform (Three.js, Cloudflare D1, Drizzle ORM).
- Operate a Meshtastic LoRa mesh node, including siting/antenna optimisation that extended usable range from 8 km to roughly 12 km.

### Head of Infrastructure — Feeld

- **Period:** 2019–2023 (4 years)
- **Location:** Remote
- Built and led a dedicated infrastructure team: evaluated, hired, managed, and upskilled engineers across multiple time zones, with full responsibility for infrastructure operations, planning, and reporting, plus project and budget management.
- Modernised the entire platform, implementing infrastructure-as-code, GitOps, and the Linkerd service mesh.
- Worked with the development team to instrument the codebase with OpenTelemetry and standardise logging, roughly halving cloud spend.
- Reduced overall monthly spend by more than 75% through further optimisation: bringing Redis and PostgreSQL in-house and applying serverless technologies to lower complexity and cost.
- Built a bespoke incident management platform, automated remediation for common issues unresolved by the development team, and runbooks for all services in coordination with developers — decreasing downtime by more than 40%.
- Built a single pane of glass for metrics and platform activity, plus tooling to support developers using OpenTelemetry and service-mesh instrumentation.
- Implemented SD-WAN to secure access and reduce developer friction, cutting access-related tickets by more than 90%.
- Shared and delegated on-call responsibilities across the team.

### MOC Engineer — Mozilla

- **Period:** 2016–2017 (1 year)
- **Location:** Remote
- Extremely wide-ranging remote role managing the full Mozilla infrastructure, with on-call responsibilities.
- Demanded a broad skillset and the ability to learn new skills quickly.
- Communication and collaboration with diverse teams of varying focus and technical depth; point of contact for "I don't know who I should talk to about this, but…" queries.
- Began development of Panopticon, an in-house operations intelligence platform.

### Production Engineer — Facebook

- **Period:** 2013–2014 (1 year)
- **Location:** San Francisco, United States
- Production engineering for Facebook's storage infrastructure: planning, deployment, and management of storage systems at massive scale.
- Massive-scale Linux administration and toolset development, with on-call responsibilities.
- Commissioned the new Malmö datacentre location: initial data seeding, ongoing replication, and integration into the global multi-tier storage infrastructure.

### Systems Administrator — Six Degrees Group (formerly Ultraspeed)

- **Period:** 2009–2013 (4 years)
- **Location:** London, United Kingdom
- Part of a small team running a large managed hosting estate: Linux and Windows instances on VMware virtualisation.
- Datacentre work, on-call duties, and direct contact with customers.
- 3PAR SAN administration and Vyatta network administration.
- Threat management and attack-surface reduction.
- Design, implementation, and ongoing ownership of the managed backup platform (Asigra).

### Systems Administrator — IOKO / KIT digital

- **Period:** 2007–2009 (2 years)
- **Location:** London, United Kingdom
- Linux-based deployment management and toolset development.
- Systems support for large-scale IPTV clients, with on-call responsibilities.

### Systems Administrator — Inspired Gaming Group

- **Period:** 2006–2007 (1 year)
- **Location:** London, United Kingdom
- Systems administration for a mid-scale estate across RHEL, Windows, and AIX platforms.
- Managed the migration of the physical server estate to VMware virtualisation.
- EMC SAN administration, with on-call responsibilities.

### VoIP Engineer — DXI Networks

- **Period:** 2005–2006 (1 year)
- **Location:** London, United Kingdom
- Design, implementation, and support of a country-wide VoIP network on a managed Cisco backend.
- Deployed Cisco user devices on-site, with on-call responsibilities.

## Education

- **University of Kent, Canterbury** — Computer Science, BSc (Hons), 2003–2007

## Certifications

- **ITIL Certification** — 2009
- **Red Hat Certified Engineer** — 2007

## Community & Interests

- Member of the London Hackspace since its inception.
- Electronic engineering and making (non-professional).
- Mesh and community networking (Meshtastic, LoRa).
- Lifelong special interest in information security.

## Keywords

3PAR, AIX, Amazon Web Services, Apache, Asigra, Automation, AWS, Azure, Bun, CentOS, CI/CD, Cisco IOS, Cloud Computing, Cloudflare D1, Cloudflare Workers, Containers, cPanel, Database Administration, DFIR, Docker, Drizzle ORM, EMC, Fish shell, FreeBSD, GCP, GitOps, Go, Google Cloud Platform, HAProxy, High Availability, Incident Management, Infrastructure as Code, IoT Security, IT Security, ITIL, Java, JavaScript, Juniper, Kubernetes, Linkerd, Linux, Load Balancing, LoRa, macOS, Meshtastic, MikroTik, MySQL, NAS, Network Administration, Network Security, Nginx, Nuxt, Observability, On-call, OpenTelemetry, Passenger, Penetration Testing, Platform Hardening, PostgreSQL, Prometheus, Pulumi, Python, Red Hat Linux, Redis, Ruby, Ruby on Rails, Rust, SAN, SD-WAN, Serverless, Service Mesh, Shell Scripting, Systems Administration, Tailwind CSS, Terraform, TypeScript, Ubiquiti, Ubuntu, Vignette, Virtualisation, VMware, VoIP, Vue, Vyatta, Windows, Windows Server, Wrangler

## Projects

Independent work from 2023 onwards, included as primary evidence of current, hands-on engineering across the employment gap. Sourced from [syn.horse/projects](https://syn.horse/projects) and [github.com/synmux](https://github.com/synmux); descriptions marked _site voice_ are quoted verbatim from syn.horse.

### syn.horse

- **Period:** 2026–present · **Status:** active
- **Stack:** Nuxt 4, Cloudflare Workers, Wrangler, Markdown content · open source
- **Links:** <https://syn.horse>
- Personal site and platform, run as a production service: Nuxt 4 on Cloudflare Workers with markdown-based content and Wrangler deployments. Third full rewrite of the site.
- _Site voice:_ "this site. nuxt 4 on cloudflare workers. the third rewrite. the last one. probably."

### genderbase

- **Period:** 2025–present · **Status:** active
- **Stack:** Nuxt, wiki-style content · live
- **Links:** <https://genderbase.com>
- A structured directory of gender-affirming resources, maintained on a quarterly review cycle to prune dead links and add new material.
- _Site voice:_ "a directory of gender-affirming resources. low ui, high index."

### Project Ambio

- **Period:** 2025–present · **Status:** in development
- **Stack:** C++ (firmware), Nuxt 4, Vue 3, Three.js, Tailwind CSS, DaisyUI, Cloudflare D1, Drizzle ORM, Bun
- **Links:** <https://github.com/synmux/ambio-systems>
- Hardware/IoT project in development: C++ firmware (currently private) with a public companion site featuring a WebGL particle background, theme support, and D1-backed email subscription. Tagline: "Something is listening."

### bunnypmsl

- **Period:** ongoing · **Status:** active
- **Stack:** Rust (Rocket, Askama, clap) · MIT licence · open source
- **Links:** <https://github.com/synmux/bunnypmsl>
- Smart bookmark / command router — a UK-centric fork of Facebook's bunnylol.rs with opinionated additions: CLI and web-server modes, 50+ built-in commands, custom aliases, Docker deployment. 180+ commits.

### rhymepass

- **Period:** 2024–present · **Status:** active
- **Stack:** CLI · open source
- **Links:** <https://github.com/synmux/rhymepass>
- Command-line generator for rhyming — yet still secure — passwords.
- _Site voice:_ "generates rhyming passwords. yes, really. yes, secure."

### recon

- **Period:** 2024–present · **Status:** active
- **Stack:** iOS · independent App Store release
- **Links:** <https://syn.horse/projects> (App Store listing linked from there)
- iOS utility to resize and convert images, shipped end-to-end as an independent release.
- _Site voice:_ "resize and convert images on iOS. a small, opinionated, genuinely fast tool."

### lics

- **Period:** 2024–present · **Status:** active
- **Stack:** TypeScript, Notion API · open source
- **Links:** <https://github.com/synmux/lics>
- CLI for managing software licence keys, using Notion as the backing database.

### dcw.soy

- **Period:** 2024–present · **Status:** active
- **Stack:** static site, Cloudflare
- **Links:** <https://dcw.soy>
- Single-purpose static site; a joke shipped properly, with TLS.
- _Site voice:_ "a duck or a soy? a static site that asks the only question that matters."

### Meshtastic node

- **Period:** ongoing · **Status:** active
- **Stack:** Meshtastic, LoRa radio hardware
- **Links:** <https://syn.horse/now>
- Operates a node on a community LoRa mesh network; recent re-siting and antenna work extended usable range from 8 km to roughly 12 km.

### noti

- **Period:** 2023 · **Status:** retired
- **Stack:** CLI · open source
- **Links:** <https://github.com/synmux/noti>
- CLI tool to monitor a process and trigger a notification on completion.

### tabby

- **Period:** 2023 · **Status:** retired
- **Stack:** Go, web · open source
- **Links:** <https://github.com/synmux/tabby>
- Personal new-tab dashboard: todos, weather, RSS feeds, and more in one page.
- _Site voice:_ "a personal new tab dashboard. todos, weather, RSS, the lot."
