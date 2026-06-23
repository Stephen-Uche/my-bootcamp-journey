# Student Marketplace

## Implement Service Layer

### Goal

Build a student-focused marketplace with a simple service layer that separates UI code from Supabase data access, authentication, validation, and shared domain types.

The current implementation uses Next.js, TypeScript, Supabase, Tailwind CSS, and Zod.

---

## Learning Objectives

By working with this project, you will:

- Organize feature logic into reusable API/service modules
- Keep shared validation and TypeScript types in one place
- Use Supabase for authentication and listing persistence
- Use async operations for database and auth calls
- Return predictable success/error results from write operations
- Connect server and client components to service-layer functions

---

# Step-by-Step Instructions

---

## Step 1: Install Project Dependencies

### What to do

Run the install command from the project root:

```bash
npm install
```

### Information

This installs the application dependencies from `package.json`, including:

- `next` and `react` for the web app
- `@supabase/supabase-js` for backend access
- `zod` for validation
- `tailwindcss` for styling
- `typescript` for type checking

---

## Step 2: Configure Supabase Environment Variables

### What to do

Create a local environment file:

```bash
touch .env.local
```

Add the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Information

The Supabase client is configured in:

```text
lib/supabase-client.ts
```

The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to start.
`SUPABASE_SERVICE_ROLE_KEY` is required for server-side flows that read protected data, such
as the authenticated seller contact endpoint.

### Configure email sign-in

The app uses Supabase email/password authentication. Users can sign up and sign in with `gmail.com`, `gmail.se`, `googlemail.com`, or an approved student/university email domain.

If Supabase email confirmation is enabled, new users must confirm their email before they can sign in. If you want immediate sign-in during local development, disable email confirmation in Supabase:

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Providers`.
3. Open `Email`.
4. Turn off `Confirm email` for local development, or keep it enabled for production.

### Configure listing image uploads

The post form uploads listing photos to Supabase Storage before creating the listing.

The schema, row-level security policies, and `listing-images` storage bucket are versioned in:

```text
supabase/migrations/20260623000000_initial_marketplace_schema.sql
```

Apply it with the Supabase CLI from the project root:

```bash
supabase db push
```

Or open Supabase Dashboard -> SQL Editor and run the migration file contents.

The migration creates `profiles`, `listings`, a database trigger that creates a
profile row when a Supabase Auth user is created, listing status values, the
public `listing-images` bucket, and RLS policies for public browsing,
seller-owned listing management, profile ownership, and image uploads.

---

## Step 3: Understand the Shared Types and Validation Layer

### What to do

Review the shared domain file:

```text
features/shared/types.ts
```

This file contains:

- `createListingSchema`
- `CreateListingInput`
- `Listing`
- `signupSchema`
- `SignupInput`
- `loginSchema`
- `LoginInput`
- `User`

### Information

The shared layer gives the project:

- One source of truth for listing and signup data
- Runtime validation through Zod
- TypeScript types inferred from validation schemas
- Consistent email rules for Gmail and approved student mail

---

## Step 4: Understand the Listings Service Layer

### What to do

Review the listings API module:

```text
features/listings/api.ts
```

It exposes these async functions:

```ts
getListings(filters?)
getListingById(id)
createListing(input)
updateListingStatus(id, status)
```

### Information

The listings module separates marketplace data logic from the page components.

It handles:

- Fetching available listings
- Filtering by category
- Searching title and description
- Pagination with `limit` and `offset`
- Creating new listings
- Updating listing status to `available`, `sold`, or `removed`

Write operations return a result-style object:

```ts
{ success: true, listing }
{ success: false, error }
```

This keeps UI code from needing to know Supabase error details directly.

---

## Step 5: Understand the Authentication Service Layer

### What to do

Review the auth API module:

```text
features/auth/api.ts
```

It exposes these async functions:

```ts
signup(input)
login(email, password)
logout()
getCurrentUser()
```

### Information

The auth module keeps Supabase Auth calls outside the UI layer.

It handles:

- Creating student accounts
- Signing users in
- Signing users out
- Reading the current authenticated user
- Returning predictable success/error objects

Signup also stores profile metadata:

```ts
full_name
university
```

---

## Step 6: See How the UI Uses the Service Layer

### What to do

Review the home page:

```text
app/page.tsx
```

The home page imports listing data through:

```ts
import { getListings } from '@/features/listings/api'
```

### Information

The page does not query Supabase directly. It asks the listings service for marketplace data and renders the result.

This gives the project:

- Cleaner page components
- Easier testing later
- One place to change data access behavior
- A better path toward adding caching, authorization, or server actions

---

## Step 7: Run the Development Server

### What to do

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Information

The app starts with:

- A navigation bar
- Student Marketplace landing content
- Latest listings loaded from Supabase
- Auth-aware navigation state

If Supabase environment variables are missing, startup will fail with:

```text
Missing Supabase environment variables
```

---

## Step 8: Check Code Quality

### What to do

Run the available checks:

```bash
npm run typecheck
npm run lint
npm run build
```

### Information

These commands verify:

- TypeScript correctness
- Next.js linting rules
- Production build readiness

---

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  Navigation.tsx
  ui/
features/
  auth/
    api.ts
  listings/
    api.ts
  shared/
    types.ts
lib/
  supabase-client.ts
Implement_Service_Layer.md
package.json
README.md
```

---

## Current Status

The repository currently contains the foundation for a service-layer based student marketplace:

- Supabase client setup
- Shared schemas and domain types
- Listings API module
- Auth API module
- Home page consuming the listings service
- Navigation that reacts to auth state

The next practical step is to add the missing route pages referenced by navigation links:

- `/browse`
- `/post`
- `/profile`
- `/auth/login`
- `/auth/signup`
- `/listing/[id]`
