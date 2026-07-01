# PawWiz Database Schema & Join Documentation

## Tables Overview

### `onboarding_sessions`
Temporary staging table. Holds cat count and owner details entered during onboarding flow. Cat records are stored in the `cats` table referencing the onboarding session.

| Column | Type | Notes |
|---|---|---|
| id | text | PK |
| owner_name | text | |
| owner_email | text | |
| otp_hash | text | |
| otp_verified | bool | |
| cats_count | text | |
| consumed_at | timestamp | Triggers linking of cats to profile when set |

---

### `cats`
Permanent source of truth for cat identity. Can be linked to an `onboarding_sessions` (during onboarding) or to `profiles` (after signup).

| Column | Type | Notes |
|---|---|---|
| id | text | PK |
| profile_id | text | FK → profiles.id (Nullable) |
| onboarding_session_id | text | FK → onboarding_sessions.id (Nullable) |
| name | text | Cat's name |
| sex | text | Cat's gender |
| life_stage | text | `kitten` or `adult` |
| breed | text | Breed |
| marking | text | Markings/colors |
| age | int | Age in months/years |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `profiles`
Permanent source of truth for owner profile. Created when onboarding completes.

| Column | Type | Notes |
|---|---|---|
| id | text | PK |
| supabase_user_id | text | UK — links to Supabase Auth |
| display_name | text | Owner's name |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `diet_profiles`
Stores diet-specific tracking data only. Links to `cats` via `cat_id` to get cat identity fields.

| Column | Type | Notes |
|---|---|---|
| id | text | PK |
| profile_id | text | FK → profiles.id |
| cat_id | text | FK → cats.id (Nullable) |
| weight | float | |
| is_kg | bool | Unit toggle |
| food_preference | text | `dry`, `wet`, or `mixed` |
| is_spayed_neutered | bool | Affects calorie multiplier |
| is_tracking | bool | Dashboard active state |
| water_intake | int | Daily ml tracked |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `diet_meal_logs`
One row per meal per day per diet profile. Many-to-one relationship with `diet_profiles`. Tracks what was actually fed, how much, and the calorie estimate.

| Column | Type | Notes |
|---|---|---|
| id | text | PK |
| diet_profile_id | text | FK → diet_profiles.id |
| meal_name | text | `Breakfast`, `Lunch`, `Dinner`, `Snack` |
| food_type | text | `dry`, `wet`, `mixed` — nullable |
| amount | float | Nullable until logged |
| unit | text | `spoon`, `cup`, `can`, `handful` |
| kcal | float | Auto-calculated from amount × density |
| status | text | `pending`, `logged`, `skipped` |
| timestamp | text | Time of meal log |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Join Relationships

### Join 1 — `onboarding_sessions` → `profiles` (one-time write)

```sql
INSERT INTO profiles (id, supabase_user_id, display_name, cat_name, cat_sex,
                      cat_life_stage, cat_breed, cat_marking, created_at, updated_at)
SELECT gen_random_uuid(), $1, os.owner_name, os.cat_name, os.cat_sex,
       os.cat_life_stage, os.cat_breed, os.cat_marking, NOW(), NOW()
FROM onboarding_sessions os
WHERE os.id = $2
  AND os.otp_verified = TRUE
  AND os.consumed_at IS NULL;
```

**When it fires:** When the user completes onboarding and `consumed_at` is set.
**Purpose:** Promotes temporary staging data into the permanent `profiles` table.
**After this point:** `profiles` owns all cat identity data. `onboarding_sessions` is no longer read for cat details.

---

### Join 2 — `cats` → `diet_profiles` (one-to-one)

```sql
SELECT c.name AS cat_name, c.sex AS cat_sex, c.life_stage AS cat_life_stage, c.breed AS cat_breed, c.age AS cat_age,
       dp.weight, dp.is_kg, dp.food_preference, dp.is_spayed_neutered,
       dp.is_tracking, dp.water_intake
FROM diet_profiles dp
LEFT JOIN cats c ON dp.cat_id = c.id
WHERE dp.profile_id = $1;
```

**Key:** `diet_profiles.cat_id = cats.id`
**Purpose:** `DietSetupView` autofill reads cat identity fields from `cats` and tracking details from `diet_profiles` — single query, no duplication.

---

### Join 3 — `diet_profiles` → `diet_meal_logs` (one-to-many)

```sql
SELECT dp.id AS diet_profile_id, dp.water_intake,
       dml.id AS meal_log_id, dml.meal_name, dml.food_type,
       dml.amount, dml.unit, dml.kcal, dml.status, dml.timestamp
FROM diet_profiles dp
LEFT JOIN diet_meal_logs dml ON dml.diet_profile_id = dp.id
WHERE dp.id = $1
ORDER BY dml.meal_name ASC;
```

**Key:** `diet_meal_logs.diet_profile_id = diet_profiles.id`
**Purpose:** One diet profile owns many meal log rows. `LEFT JOIN` ensures meals in `pending` state (not yet logged) still appear in the dashboard.

---

## Full Dashboard Query (all three joins combined)

```sql
SELECT
  c.name             AS cat_name,
  c.sex              AS cat_sex,
  c.life_stage       AS cat_life_stage,
  c.breed            AS cat_breed,
  c.age              AS cat_age,
  dp.id              AS diet_profile_id,
  dp.weight,
  dp.is_kg,
  dp.food_preference,
  dp.is_spayed_neutered,
  dp.is_tracking,
  dp.water_intake,
  dml.id             AS meal_log_id,
  dml.meal_name,
  dml.food_type,
  dml.amount,
  dml.unit,
  dml.kcal,
  dml.status,
  dml.timestamp
FROM diet_profiles dp
LEFT JOIN  cats c             ON dp.cat_id          = c.id
LEFT JOIN  diet_meal_logs dml ON dml.diet_profile_id = dp.id
WHERE dp.profile_id = $1
ORDER BY dml.meal_name ASC;
```

---

## Read Patterns

### DietSetupView autofill
Reads from **Join 2** (`cats` + `diet_profiles`).
- `cat_name`, `cat_sex`, `cat_life_stage`, `cat_age` ← from `cats`
- `weight`, `food_preference`, `is_spayed_neutered` ← from `diet_profiles`

### Diet dashboard
Runs all three joins together.
- Cat identity ← `cats`
- Diet settings + water intake ← `diet_profiles`
- Today's meals ← `diet_meal_logs` (LEFT JOIN so pending meals still show)

---

## Normalization Summary

| Field | Before | After |
|---|---|---|
| `cat_name` | `onboarding_sessions` + `profiles` + `diet_profiles.name` | `cats.name` |
| `cat_sex` | `onboarding_sessions` + `profiles` + `diet_profiles.gender` | `cats.sex` |
| `cat_life_stage` | `onboarding_sessions` + `profiles` + `diet_profiles.life_stage` | `cats.life_stage` |
| `age` | `diet_profiles.age` | `cats.age` |
| `weight` | `diet_profiles` | `diet_profiles` only — diet-specific, stays here |
