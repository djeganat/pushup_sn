# Block 02: Database Tables

## 🎯 Objective
Create the core database tables that will store all fitness tracking data, user profiles, badges, and challenges.

## 📋 Requirements

### Tables to Create (6 total)

#### 1. Activity Table (x_fitchal_fitness_activity)
| Property | Value |
|----------|-------|
| Label | Fitness Activity |
| Name | x_fitchal_fitness_activity |
| Extends | (none) |
| Description | Stores individual fitness activities logged by users |

**Purpose**: Track each workout session (pushups, pullups, runs, planks, etc.)

#### 2. User Profile Table (x_fitchal_fitness_user_profile)
| Property | Value |
|----------|-------|
| Label | User Profile |
| Name | x_fitchal_fitness_user_profile |
| Extends | (none) |
| Description | Stores user fitness statistics, XP, level, and streaks |

**Purpose**: Maintain each user's fitness profile with gamification stats

#### 3. Badge Table (x_fitchal_fitness_badge)
| Property | Value |
|----------|-------|
| Label | Badge |
| Name | x_fitchal_fitness_badge |
| Extends | (none) |
| Description | Defines available badges and achievements |

**Purpose**: Define badge/achievement templates (7-day streak, 100 pushups, etc.)

#### 4. User Badge Table (x_fitchal_fitness_user_badge)
| Property | Value |
|----------|-------|
| Label | User Badge |
| Name | x_fitchal_fitness_user_badge |
| Extends | (none) |
| Description | Tracks badges earned by users |

**Purpose**: Many-to-many relationship between users and badges they've earned

#### 5. Challenge Table (x_fitchal_fitness_challenge)
| Property | Value |
|----------|-------|
| Label | Challenge |
| Name | x_fitchal_fitness_challenge |
| Extends | (none) |
| Description | Defines fitness challenges and competitions |

**Purpose**: Store challenge definitions (team challenges, 1v1 competitions, goals)

#### 6. Challenge Participant Table (x_fitchal_fitness_participant)
| Property | Value |
|----------|-------|
| Label | Challenge Participant |
| Name | x_fitchal_fitness_participant |
| Extends | (none) |
| Description | Tracks user participation in challenges |

**Purpose**: Many-to-many relationship between users and challenges they're participating in

## 🔧 Deployment Options

### Option A: Studio Import (Recommended)
1. Copy the `src/` folder contents to your ServiceNow Git repository
2. In ServiceNow Studio: File → Import From Source Control
3. Select your repository and branch
4. Import the sys_db_object directory

### Option B: Manual Table Creation
1. Navigate to: System Definition → Tables
2. Click "New"
3. For each table above:
   - Set Label and Name as specified
   - Set Application to "FitChallenge"
   - Save the table
4. Note: Manual creation will generate different sys_ids than the provided XML

### Option C: XML Upload
1. Navigate to: System Update Sets → Retrieved Update Sets
2. For each table XML file:
   - Click "Import Update Set from XML"
   - Upload the file
   - Preview and commit

## 📁 Files in This Block

```
src/
└── sys_db_object/
    ├── x_fitchal_fitness_activity.xml
    ├── x_fitchal_fitness_user_profile.xml
    ├── x_fitchal_fitness_badge.xml
    ├── x_fitchal_fitness_user_badge.xml
    ├── x_fitchal_fitness_challenge.xml
    └── x_fitchal_fitness_participant.xml
```

## ⚠️ Prerequisites
- ✅ Block 01 (Application Shell) must be deployed
- ServiceNow instance with admin access
- Studio or Table Designer access

## 🔗 Dependencies
- **Requires**: Block 01 (Application Shell)
- **Required by**: Block 03 (Fields)

## ✅ Validation

After deployment, run the validation script from `VALIDATE.js` to ensure:
- All 6 tables exist in the x_fitchal_fitness scope
- Tables are accessible for CRUD operations
- Table labels match specifications
- Tables are properly scoped to the application

## 📝 Notes

- These tables are created with **no fields** beyond the default system fields (sys_id, sys_created_on, etc.)
- Fields will be added in Block 03
- Access controls are set to allow read/write within the scope
- Tables do not extend any base tables (no inheritance)

## ➡️ Next Block
After validation passes, proceed to **Block 03: Fields** to add columns to these tables.
