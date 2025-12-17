# Block 01: Application Shell

## 🎯 Objective
Create the foundational ServiceNow scoped application that will contain all FitChallenge components.

## 📋 Requirements

### Application Details
| Property | Value |
|----------|-------|
| Name | FitChallenge |
| Scope | x_fitchal_fitness |
| Version | 1.0.0 |
| Description | Gamified fitness tracking application with XP, badges, streaks, and challenges |
| Vendor | Your Company |
| License Model | Use with Subscription |

### What This Block Creates
1. **sn_source_control.properties** - Source control configuration defining the application scope
2. **sys_app/x_fitchal_fitness.xml** - Application manifest record

## 🔧 Deployment Options

### Option A: Studio Import (Recommended)
1. Copy the `src/` folder contents to your Git repository root
2. In ServiceNow Studio: File → Import From Source Control
3. Select your repository and branch

### Option B: Manual Creation
1. Navigate to: System Applications → Studio
2. Click "Create Application"
3. Fill in the details as specified above
4. Save and note the generated sys_id

### Option C: Application Creator
1. Navigate to: System Applications → Application Creator
2. Create new scoped application
3. Use scope: x_fitchal_fitness

## 📁 Files in This Block

```
src/
├── sn_source_control.properties    # Source control config
└── sys_app/
    └── x_fitchal_fitness.xml       # Application manifest
```

## ⚠️ Prerequisites
- ServiceNow instance with admin access
- Studio or App Engine Studio access
- Git repository (if using source control import)

## 🔗 Dependencies
- None (this is the foundation block)

## ➡️ Next Block
After validation passes, proceed to **Block 02: Tables**
