# CONTEXT.md

## Overview
A full-stack social platform for book clubs. Users can create clubs, start reading sessions with uploaded EPUB files, set reading goals, and participate in threaded discussions both at the club level and directly within the book via annotations.

---

# 1. High-Level Architecture

This application uses a hybrid RSC + client state model.

Server Layer:
- Next.js App Router
- React Server Components
- Hono API server
- Prisma ORM

Client Layer:
- TanStack Query for remote state

Authentication: 
- Supabase Auth (Cookie-based).

Core Philosophy:
- Server Components define page structure.
- React Query handles interactive, frequently mutating data.
- Zustand manages UI and local-only state.
- Do not blur these boundaries.

Frontend: 
- Next.js (App Router), R
- React, 
- shadcn and Tailwind
- epub.js

---

# 2. Data Ownership Rules

Every piece of data in the app must have a clear owner.

## 2.1 Server-Owned Data (RSC)

These define page structure and navigation.

Examples:
- Threads
- Clubs
- Sessions
- Page-level resources

Rules:
- Fetched in RSC only.
- Use `serverClient` for fetching.
- Mutations affecting this data must call `revalidateTag()`.

---

## 2.2 Client-Owned Data (Tanstack Query)

These are interactive or frequently updated.

Examples:
- Comments
- Annotations
- Reactions
- Likes

Rules:
- Fetched via `useQuery`.
- Mutated via `useMutation`.
- Must use `queryClient.invalidateQueries()` on mutation success.
- May use optimistic updates when appropriate.

---

## 2.3 UI State (Zustand)

Zustand is used ONLY for:

- Modal visibility
- Sidebar state
- Editor state
- Ephemeral interaction state
- Auth/session mirror
- etc.

Never:
- Store API responses in Zustand.
- Use Zustand as a remote cache.

---

# 3. API Layer (Hono)

The API layer uses Hono for:

- Type-safe routing
- Shared types between client and server
- Consistent request contracts

We use:
- `serverClient` inside RSC
- `clientClient` inside client components

Never import `serverClient` into a client component.

---

# 4. Folder Structure

/apps/web
- Next.js frontend

/apps/server
- Hono routes
- Business logic
- Prisma calls

/packages/db
- Contains pprisma schema

/packages/epubjs
- A hosted epubjs library

/packages/shared
- For any shared types between /apps/web and /apps/server

---

# 5. AI Context

This file exists to provide architectural context to AI tools and contributors.

When suggesting changes:
- Preserve server/client boundaries.
- Do not introduce mixed ownership patterns.
- Respect cache strategy.
- Prefer consistency over novelty.