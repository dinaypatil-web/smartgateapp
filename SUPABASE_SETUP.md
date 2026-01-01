# Supabase Setup Guide for Online Data Storage

## Overview
The app has been configured to support Supabase Database for online data storage, enabling all users to share the same data across devices and locations.

## Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name (e.g., "smartgateentry")
4. Set a strong password
5. Choose a region (select closest to your users)
6. Click "Create new project"

### 2. Get Supabase Configuration
1. In Supabase Dashboard, go to Project Settings (gear icon)
2. Go to "API" section
3. Find "Project URL" and "anon" public key

### 3. Add Environment Variables
Create a `.env` file in the project root with your Supabase config:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create Database Tables
Go to the SQL Editor in Supabase Dashboard and run the following SQL to create the necessary tables:

```sql
-- Users table
create table users (
  id text primary key,
  name text,
  email text,
  mobile text,
  password text,
  roles jsonb,
  createdat text,
  status text,
  loginname text,
  loginpassword text
);

-- Societies table
create table societies (
  id text primary key,
  name text,
  address text,
  permissionfromdate text,
  permissiontodate text,
  createdby text,
  createdat text
);

-- Visitors table
create table visitors (
  id text primary key,
  name text,
  gender text,
  idproof text,
  comingfrom text,
  purpose text,
  contactnumber text,
  residentid text,
  societyid text,
  status text,
  entrytime text,
  exittime text,
  photo text
);

-- Notices table
create table notices (
  id text primary key,
  title text,
  message text,
  date text,
  societyid text,
  createdby text,
  createdat text
);

-- PreApprovals table
create table preapprovals (
  id text primary key,
  visitorname text,
  expecteddate text,
  residentid text,
  societyid text,
  passcode text,
  status text,
  createdat text
);
```

**Note:** The schema above uses `text` for `id` columns to match the application's behavior. Column names are lowercase (standard PostgreSQL) to avoid quoting issues. The application handles mapping between camelCase and lowercase automatically.

**Troubleshooting:**
If you see errors like "Could not find column...", run the SQL in `FIX_SUPABASE_SCHEMA.sql` to ensure all columns exist.

### 5. Disable Row Level Security (RLS) for Development
For initial setup/development, you might want to disable RLS or create a policy that allows all access.
**Warning: Do not do this for production!**

In SQL Editor:
```sql
alter table users enable row level security;
create policy "Enable all access" on users for all using (true);

alter table societies enable row level security;
create policy "Enable all access" on societies for all using (true);

alter table visitors enable row level security;
create policy "Enable all access" on visitors for all using (true);

alter table notices enable row level security;
create policy "Enable all access" on notices for all using (true);

alter table preapprovals enable row level security;
create policy "Enable all access" on preapprovals for all using (true);
```

## Migration from localStorage to Supabase

If you have existing data in localStorage:

1. Configure Supabase in `.env`.
2. Open the browser console in the app.
3. Run `import('./src/utils/migration.js').then(m => m.migrateToSupabase())` (this might not work directly in console due to bundling).
4. OR, use a temporary button or trigger in the UI to call `migrateToSupabase()`.

## Files Modified/Created

1. `src/config/supabase.js` - Supabase configuration
2. `src/utils/supabaseApi.js` - Supabase API functions
3. `src/utils/storageApi.js` - Unified storage API wrapper (switched to Supabase)
4. `src/utils/migration.js` - Data migration utility (updated for Supabase)
