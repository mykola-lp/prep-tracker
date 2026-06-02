# Product Scope

## Overview

`Prep Tracker` is a personal web application for structured interview preparation.
It helps users collect learning topics, track questions, store notes, assign
deadlines, and monitor progress over time.

The product is designed to replace fragmented notes, bookmarks, and ad hoc todo
lists with one place that shows what has been learned, what still needs work,
and what should be reviewed next.

## Target User

The primary user is a developer preparing for technical interviews.

The product should also make sense to anyone who needs to organize study
material, but the core workflows are built around interview preparation.

## Product Goals

- centralize interview preparation data in one place
- make progress visible through statuses, filters, and a dashboard
- support short, focused preparation sessions instead of unstructured note taking
- provide a small but realistic full-stack project for a portfolio

## MVP Scope

The first version of the product should cover these capabilities:

- authentication and user-specific data access
- topic management
- question tracking under each topic
- notes attached to topics or questions
- progress statuses such as `new`, `learning`, `reviewing`, and `done`
- deadlines for topics or preparation milestones
- tags and filters for fast navigation
- a dashboard with progress overview and upcoming work

## Core Domain Concepts

- `Topic`: a study area or interview subject
- `Question`: a concrete interview question linked to a topic
- `Note`: a short explanation, answer draft, or reminder
- `Tag`: a lightweight label for grouping and filtering
- `Progress Status`: the current state of a topic or question
- `Deadline`: a target date for finishing or reviewing work

## Out Of Scope For Now

These items are useful later, but they are not part of the initial MVP unless a
specific issue explicitly adds them:

- Kubernetes deployment
- multi-user collaboration
- real-time collaboration
- mobile native apps
- advanced analytics and charts
- third-party integrations
- public sharing of study collections

## Implementation Direction

The current project direction is:

- frontend: React
- backend: Express
- API style: GraphQL
- database: PostgreSQL
- ORM: Sequelize
- browser tests: Playwright
- local development: Docker Compose

The project may later grow into deployment automation or Kubernetes, but those
are not required to define the product scope itself.

## How To Read This Document

For humans:

- use this file to understand what the product is
- use it to decide whether a new issue belongs to the project
- use it to keep feature ideas aligned with the actual product direction

For AI agents:

- treat this as the canonical product definition
- do not invent new product goals without a documented reason
- keep changes small and aligned with the MVP boundary
- if a requested change expands the product, call out the scope change before implementing it

## Success Criteria

The MVP is successful if a user can:

- create an account and sign in
- create topics and add related questions
- write notes and mark progress
- filter and review preparation items quickly
- use the dashboard to understand what still needs attention
