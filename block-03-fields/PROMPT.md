# Block 03: Database Fields

## 🎯 Objective
Add custom fields (columns) to the 6 database tables created in Block 02. This block defines all data fields needed for fitness tracking, gamification, and challenge management.

## 📋 Requirements

### Total Fields: 48 custom fields across 6 tables

---

#### 1. Activity Table Fields (10 fields)
**Table**: `x_fitchal_fitness_activity`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| user | Reference (sys_user) | - | Yes | User who performed the activity |
| activity_type | String (choice) | 40 | Yes | Type of activity (pushup, pullup, run, plank) |
| reps_count | Integer | - | No | Number of repetitions |
| duration | Integer | - | No | Duration in seconds |
| distance | Decimal | - | No | Distance in kilometers |
| calories_burned | Integer | - | No | Calories burned |
| xp_earned | Integer | - | Yes | Experience points earned |
| activity_date | Date/Time | - | Yes | When activity was performed |
| notes | String | 1000 | No | User notes |
| detection_method | String (choice) | 40 | No | How activity was logged (sensor, camera, manual) |

---

#### 2. User Profile Table Fields (10 fields)
**Table**: `x_fitchal_fitness_user_profile`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| user | Reference (sys_user) | - | Yes | User reference (unique) |
| total_xp | Integer | - | Yes | Total experience points |
| level | Integer | - | Yes | Current level |
| current_streak | Integer | - | Yes | Current consecutive days streak |
| longest_streak | Integer | - | Yes | Longest streak achieved |
| last_activity_date | Date | - | No | Last activity date for streak tracking |
| total_activities | Integer | - | Yes | Total activities logged |
| total_calories | Integer | - | Yes | Total calories burned |
| rank | Integer | - | No | Leaderboard rank |
| avatar_url | URL | 255 | No | User avatar image URL |

---

#### 3. Badge Table Fields (7 fields)
**Table**: `x_fitchal_fitness_badge`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| name | String | 100 | Yes | Badge name |
| description | String | 500 | No | Badge description |
| badge_type | String (choice) | 40 | Yes | Type (streak, milestone, achievement) |
| requirement_value | Integer | - | Yes | Value needed to earn badge |
| icon_url | URL | 255 | No | Badge icon image URL |
| xp_reward | Integer | - | Yes | XP bonus for earning badge |
| rarity | String (choice) | 40 | Yes | Rarity (common, rare, epic, legendary) |

---

#### 4. User Badge Table Fields (4 fields)
**Table**: `x_fitchal_fitness_user_badge`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| user | Reference (sys_user) | - | Yes | User who earned badge |
| badge | Reference (x_fitchal_fitness_badge) | - | Yes | Badge earned |
| earned_date | Date/Time | - | Yes | When badge was earned |
| progress | Integer | - | No | Progress toward next tier |

---

#### 5. Challenge Table Fields (11 fields)
**Table**: `x_fitchal_fitness_challenge`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| name | String | 100 | Yes | Challenge name |
| description | String | 1000 | No | Challenge description |
| challenge_type | String (choice) | 40 | Yes | Type (team, 1v1, solo) |
| start_date | Date | - | Yes | Challenge start date |
| end_date | Date | - | Yes | Challenge end date |
| goal_type | String (choice) | 40 | Yes | Goal metric (reps, distance, calories, activities) |
| goal_value | Integer | - | Yes | Target value to achieve |
| status | String (choice) | 40 | Yes | Status (draft, active, completed, cancelled) |
| created_by | Reference (sys_user) | - | Yes | Challenge creator |
| winner | Reference (sys_user) | - | No | Winner (for 1v1 challenges) |
| winner_team | String | 100 | No | Winning team name |

---

#### 6. Participant Table Fields (6 fields)
**Table**: `x_fitchal_fitness_participant`

| Field Name | Type | Max Length | Mandatory | Description |
|------------|------|------------|-----------|-------------|
| challenge | Reference (x_fitchal_fitness_challenge) | - | Yes | Challenge reference |
| user | Reference (sys_user) | - | Yes | Participant user |
| team_name | String | 100 | No | Team name (for team challenges) |
| current_progress | Integer | - | Yes | Current progress value |
| rank | Integer | - | No | Current rank in challenge |
| joined_date | Date/Time | - | Yes | When user joined challenge |

---

## 🔧 Deployment Options

### Option A: Studio Import (Recommended)
1. Copy the `src/` folder contents to your ServiceNow Git repository
2. In ServiceNow Studio: File → Import From Source Control
3. Select your repository and branch
4. Import the sys_dictionary directory

### Option B: Manual Field Creation
1. Navigate to: System Definition → Tables
2. For each table, open the table definition
3. Create each field as specified in the tables above
4. Set appropriate field types, lengths, and mandatory flags

### Option C: XML Upload
1. Navigate to: System Update Sets → Retrieved Update Sets
2. For each field XML file:
   - Click "Import Update Set from XML"
   - Upload the file
   - Preview and commit

## 📁 Files in This Block

```
src/
└── sys_dictionary/
    ├── x_fitchal_fitness_activity_*.xml (10 files)
    ├── x_fitchal_fitness_user_profile_*.xml (10 files)
    ├── x_fitchal_fitness_badge_*.xml (7 files)
    ├── x_fitchal_fitness_user_badge_*.xml (4 files)
    ├── x_fitchal_fitness_challenge_*.xml (11 files)
    └── x_fitchal_fitness_participant_*.xml (6 files)
```

**Total**: 48 field definition XML files

## ⚠️ Prerequisites
- ✅ Block 01 (Application Shell) deployed
- ✅ Block 02 (Database Tables) deployed
- ServiceNow instance with admin access
- Table Designer or Studio access

## 🔗 Dependencies
- **Requires**: Block 02 (Tables)
- **Required by**: Block 04 (Choice Lists)

## ✅ Validation

After deployment, run the validation script from `VALIDATE.js` to ensure:
- All 48 fields exist in their respective tables
- Fields have correct data types
- Mandatory flags are set correctly
- Reference fields point to correct tables

## 📝 Notes

- Reference fields create relationships between tables
- Choice field values will be defined in Block 04
- All fields respect the x_fitchal_fitness scope
- Field names follow ServiceNow naming conventions

## ➡️ Next Block
After validation passes, proceed to **Block 04: Choice Lists** to define dropdown options for choice fields.
