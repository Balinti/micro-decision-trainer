# Row Level Security (RLS) Policies

This document describes the RLS policies implemented in the database.

## Overview

All tables have RLS enabled. Policies are designed to:
1. Ensure users can only access their own data
2. Allow public read access to published content
3. Restrict admin operations to admin users
4. Use service role for system operations (webhooks, etc.)

## Policies by Table

### profiles
- **SELECT**: Users can view their own profile (`auth.uid() = id`)
- **UPDATE**: Users can update their own profile (`auth.uid() = id`)
- **INSERT**: Users can insert their own profile (`auth.uid() = id`)

### entitlements
- **SELECT**: Users can view their own entitlements (`auth.uid() = user_id`)
- **UPDATE/INSERT**: Only service role can modify (for Stripe webhooks)

### scenarios
- **SELECT (public)**: Anyone can view published scenarios (`is_published = true`)
- **ALL (admin)**: Admins can perform all operations

### scenario_nodes
- **SELECT (public)**: Anyone can view nodes for published scenarios
- **ALL (admin)**: Admins can perform all operations

### scenario_sessions
- **SELECT**: Users can view their own sessions (`auth.uid() = user_id`)
- **INSERT**: Users can create their own sessions (`auth.uid() = user_id`)
- **UPDATE**: Users can update their own sessions (`auth.uid() = user_id`)
- **DELETE**: Users can delete their own sessions (`auth.uid() = user_id`)

### playbooks
- **SELECT**: Users can view their own playbooks (`auth.uid() = user_id`)
- **INSERT**: Users can create their own playbooks (`auth.uid() = user_id`)
- **UPDATE**: Users can update their own playbooks (`auth.uid() = user_id`)
- **DELETE**: Users can delete their own playbooks (`auth.uid() = user_id`)

### user_actions
- **SELECT**: Users can view their own actions (`auth.uid() = user_id`)
- **INSERT**: Users can create their own actions (`auth.uid() = user_id`)
- **UPDATE**: Users can update their own actions (`auth.uid() = user_id`)
- **DELETE**: Users can delete their own actions (`auth.uid() = user_id`)

### upcoming_events
- **SELECT**: Users can view their own events (`auth.uid() = user_id`)
- **INSERT**: Users can create their own events (`auth.uid() = user_id`)
- **UPDATE**: Users can update their own events (`auth.uid() = user_id`)
- **DELETE**: Users can delete their own events (`auth.uid() = user_id`)

### admin_users
- **SELECT**: Only admins can view admin_users table
- **INSERT/UPDATE/DELETE**: Only service role can manage

## Service Role Usage

The service role bypasses RLS and is used for:
1. Stripe webhook handlers (updating entitlements)
2. System-level operations
3. Admin operations when needed

## Testing RLS

To test RLS policies:
1. Create a test user
2. Attempt to access data belonging to other users
3. Verify appropriate errors are returned
4. Test admin operations with admin user
