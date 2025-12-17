# FitChallenge ServiceNow App

## Overview
FitChallenge is a gamified fitness tracking application built for ServiceNow. It features XP tracking, badges, streaks, and challenges to motivate users in their fitness journey.

## Application Structure

This ServiceNow scoped application follows the standard fluent app file structure for IDE deployment:

```
x_fitchal_fitness/
├── src/
│   ├── sys_app/                    # Application definition
│   ├── sys_properties/              # System properties
│   ├── sys_db_object/               # Table definitions
│   ├── sys_dictionary/              # Field definitions
│   ├── sys_ui_section/              # Form sections
│   ├── sys_ui_form_section/         # Form layouts
│   ├── sys_ui_list/                 # List views
│   ├── sys_script_include/          # Server-side scripts
│   ├── sys_ws_operation/            # REST API operations
│   ├── sp_widget/                   # Service Portal widgets
│   ├── ux_app_config/               # UI Builder app config
│   ├── ux_app_route/                # UI Builder routes
│   ├── ux_page/                     # UI Builder pages
│   ├── ux_page_property/            # Page properties
│   ├── sys_ux_lib_source_script/    # UX library scripts
│   ├── sys_ux_client_script/        # UX client scripts
│   ├── sys_ux_data_broker_transform/# Data broker transforms
│   ├── sys_ux_macroponent/          # Macroponents
│   └── sn_source_control.properties # Source control config
└── README.md
```

## Key Components

### Tables
- **x_fitchal_fitness_activity**: Stores fitness activities tracked by users

### Script Includes
- **FitnessUtils**: Utility functions for XP calculation and streak tracking

### UI Builder
- **FitChallenge App**: Main app configuration
- **Dashboard**: Main dashboard route and page

### System Properties
- **x_fitchal_fitness.max_daily_xp**: Maximum XP that can be earned per day (default: 1000)

## Features

1. **Activity Tracking**: Log various types of fitness activities (pushups, pullups, runs, planks)
2. **XP System**: Earn experience points based on activity type and volume
3. **Streak Tracking**: Monitor consecutive days of activity
4. **Milestone Badges**: Unlock achievements at streak milestones (7, 14, 30, 60, 90, 180, 365 days)

## Installation

### Via ServiceNow Studio

1. Open ServiceNow Studio
2. Select "Import from Source Control"
3. Connect to your Git repository
4. Select the branch containing this app
5. Set the application path to `/x_fitchal_fitness/src`
6. Click Import

### Via IDE

1. Clone this repository
2. Open the `x_fitchal_fitness` folder in your ServiceNow IDE
3. Connect to your ServiceNow instance
4. The IDE will automatically recognize the app structure

## Development

To develop this app:

1. Make changes to files in the `src/` directory
2. Test in your ServiceNow development instance
3. Commit changes to source control
4. Deploy to other instances via Update Sets or CI/CD pipeline

## App Scope

- **Scope**: x_fitchal_fitness
- **Name**: FitChallenge
- **Version**: 1.0.0

## License

See LICENSE file in repository root.
