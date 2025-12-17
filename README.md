# 🏋️ FitChallenge - ServiceNow Fitness App

A gamified fitness tracking application for ServiceNow with XP, badges, streaks, challenges, and leaderboards.

## 📱 Features

- **Mobile-First Design**: ServiceNow Mobile card integration
- **Sensor-Based Rep Counting**: Uses proximity, touch, and motion sensors
- **AI Camera Detection**: TensorFlow.js MoveNet for pose detection
- **Gamification**: XP points, badges, streaks, and achievements
- **Challenges**: Team and 1v1 fitness competitions
- **Real-Time Leaderboards**: Track and compete with others
- **UI Builder Workspace**: Modern ServiceNow UI experience

## 🏗️ Application Details

- **Name**: FitChallenge
- **Scope**: `x_fitchal_fitness`
- **Version**: 1.0.0
- **Platform**: ServiceNow
- **License**: MIT

## 📦 Deployment Status

This repository uses a **staged deployment approach**, building the application block by block. Each block is independently deployable and verifiable.

| Block | Component | Status | Files | Description |
|-------|-----------|--------|-------|-------------|
| 01 | App Shell | ✅ READY | 2 | Application foundation and scope |
| 02 | Tables | ✅ READY | 6 | Core database tables |
| 03 | Fields | 🔜 PENDING | 54 | Table columns and relationships |
| 04 | Choices | 🔜 PENDING | 7 | Dropdown options and enums |
| 05 | Script Includes | 🔜 PENDING | 4 | Reusable server-side code |
| 06 | Business Rules | 🔜 PENDING | 3 | Automated record processing |
| 07 | Scheduled Jobs | 🔜 PENDING | 2 | Background automation tasks |
| 08 | Properties | 🔜 PENDING | 4 | Configuration settings |
| 09 | Roles | 🔜 PENDING | 2 | Access control roles |
| 10 | REST Definition | 🔜 PENDING | 2 | API endpoint definitions |
| 11 | REST Operations | 🔜 PENDING | 7 | API implementation methods |
| 12 | Widget (Sensor) | 🔜 PENDING | 1 | Sensor-based rep counter |
| 13 | Widget (Camera) | 🔜 PENDING | 1 | AI camera pose detection |
| 14 | Mobile Card | 🔜 PENDING | 1 | ServiceNow Mobile integration |
| 15 | Workspace Config | 🔜 PENDING | 1 | UI Builder workspace setup |
| 16 | Dashboard Page | 🔜 PENDING | 1 | Main dashboard interface |
| 17 | Leaderboard Page | 🔜 PENDING | 1 | Competition rankings |
| 18 | Challenges Page | 🔜 PENDING | 1 | Challenge management |
| 19 | Profile Page | 🔜 PENDING | 1 | User fitness profile |
| 20 | Seed Data | 🔜 PENDING | 0 | Sample data for testing |

## 🚀 Quick Start - Block 02

### Prerequisites
- ServiceNow instance with admin access
- Studio or App Engine Studio access
- Git repository (for source control import)

### Deployment Steps

1. **Clone this repository**
   ```bash
   git clone https://github.com/djeganat/pushup_sn.git
   cd pushup_sn
   ```

2. **Deploy Block 02: Database Tables**

   **Option A: Studio Import (Recommended)**
   - Copy `block-02-tables/src/` contents to your ServiceNow Git repo
   - In ServiceNow Studio: File → Import From Source Control

   **Option B: Manual Table Creation**
   - Navigate to: System Definition → Tables
   - Create each of the 6 tables listed in `block-02-tables/PROMPT.md`
   - Ensure all tables use scope: `x_fitchal_fitness`

3. **Validate the deployment**
   - Open ServiceNow: System Definition → Scripts - Background
   - Copy and run the validation script from `block-02-tables/VALIDATE.js`
   - Verify all checks show ✅ PASS (all 6 tables created)

4. **Check validation results**
   - Expected output: All 6 tables exist with correct labels
   - If any test fails, review the error messages and fix issues before proceeding

## 📋 Block 02 Details

### What Gets Created
- **6 Database Tables** (all in `sys_db_object/` directory)
  - `x_fitchal_fitness_activity` - Fitness Activity tracking
  - `x_fitchal_fitness_user_profile` - User fitness profiles with XP and streaks
  - `x_fitchal_fitness_badge` - Badge/achievement definitions
  - `x_fitchal_fitness_user_badge` - User earned badges (many-to-many)
  - `x_fitchal_fitness_challenge` - Challenge definitions
  - `x_fitchal_fitness_participant` - Challenge participants (many-to-many)

**Note**: Tables are created with only default system fields. Custom fields will be added in Block 03.

### Files Structure
```
pushup_sn_repo/
└── block-02-tables/
    ├── PROMPT.md                        # Block requirements and instructions
    ├── VALIDATE.js                      # Validation script for ServiceNow
    └── src/
        └── sys_db_object/
            ├── x_fitchal_fitness_activity.xml
            ├── x_fitchal_fitness_user_profile.xml
            ├── x_fitchal_fitness_badge.xml
            ├── x_fitchal_fitness_user_badge.xml
            ├── x_fitchal_fitness_challenge.xml
            └── x_fitchal_fitness_participant.xml
```

## 🔗 Block Dependencies

```
Block 1 (App Shell)
    └── Block 2 (Tables) ← YOU ARE HERE
            └── Block 3 (Fields)
                    └── Block 4 (Choices)
                            ├── Block 5 (Script Includes)
                            │       ├── Block 6 (Business Rules)
                            │       ├── Block 7 (Scheduled Jobs)
                            │       └── Block 20 (Seed Data)
                            ├── Block 8 (Properties)
                            ├── Block 9 (Roles)
                            ├── Block 10 (REST Definition)
                            │       └── Block 11 (REST Operations)
                            ├── Block 12 (Widget - Sensor)
                            ├── Block 13 (Widget - Camera)
                            ├── Block 14 (Mobile Card)
                            └── Block 15 (Workspace Config)
                                    ├── Block 16 (Dashboard)
                                    ├── Block 17 (Leaderboard)
                                    ├── Block 18 (Challenges)
                                    └── Block 19 (Profile)
```

## 📝 Development Workflow

For each block:
1. ✅ Read the `PROMPT.md` file
2. ✅ Review the files in `src/` directory
3. ✅ Deploy to ServiceNow (Studio import or manual)
4. ✅ Run the `VALIDATE.js` script
5. ✅ Verify all validations pass
6. ✅ Update this README's status table
7. ✅ Commit changes to Git
8. ✅ Proceed to next block

## 🛠️ Tech Stack

- **Platform**: ServiceNow (UI Builder, Mobile)
- **Backend**: ServiceNow Server-Side Scripts (Glide API)
- **Frontend**: Angular (ServiceNow Widgets)
- **AI/ML**: TensorFlow.js MoveNet
- **Sensors**: Mobile Device APIs (Accelerometer, Proximity)
- **APIs**: REST API (ServiceNow Scripted REST)

## 📚 Documentation

Each block contains:
- `PROMPT.md` - Requirements and deployment instructions
- `VALIDATE.js` - Automated validation script
- `src/` - Source files ready for deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Troubleshooting

### Import Errors
- Ensure previous blocks are deployed first
- Check for sys_id conflicts
- Verify scope is set correctly to `x_fitchal_fitness`

### Validation Failures
- Re-run the validation script
- Check ServiceNow System Logs for detailed errors
- Verify field/table names match exactly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**djeganat**

## 🙏 Acknowledgments

- ServiceNow Developer Community
- TensorFlow.js Team
- Fitness tracking enthusiasts

---

**Status**: Block 02 Complete ✅ | Ready for Block 03 🔜

**Total Files**: 8 of 105 | **Progress**: 7.6%
