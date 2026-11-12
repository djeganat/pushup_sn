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

## 📦 Deployment Status — v1.0.0 (deployed to dev instance, 2026-11-12)

The whole app is generated from one spec (`tools/build_app.py`) into
`x_fitchal_fitness/src/` — the path Studio imports (see `sn_source_control.properties`).

| Block | Component | Status | Records |
|-------|-----------|--------|---------|
| 01 | App Shell (`x_fitchal_fitness`) | ✅ Deployed | 1 |
| 02 | Tables | ✅ Deployed | 6 |
| 03 | Fields | ✅ Deployed | 48 |
| 04 | Choices | ✅ Deployed | 25 (7 lists) |
| 05 | Script Include `FitnessUtils` | ✅ Deployed | 1 |
| 06 | Business Rules (activity) | ✅ Deployed | 4 |
| 07 | Scheduled Jobs | ✅ Deployed | 2 |
| 08 | Properties | ✅ Deployed | 4 |
| 09 | Roles | ✅ Deployed | 2 (+ admin contains user) |
| 10 | REST Definition `/api/x_fitchal_fitness/fitness` | ✅ Deployed | 1 |
| 11 | REST Operations | ✅ Deployed | 7 |
| 12 | Widget (Sensor rep counter) | 🔜 Next | — |
| 13 | Widget (Camera / MoveNet) | 🔜 Next | — |
| 14 | Mobile Card | 🔜 Pending | — |
| 15–19 | Workspace + Dashboard/Leaderboard/Challenges/Profile pages | 🔜 Pending | — |
| 20 | Seed Data (badges) | ✅ Deployed | 10 badges |

### Push-up rules (v1)

| Rule | Behaviour | Configured by |
|------|-----------|---------------|
| XP | push-up 1/rep, pull-up 2/rep, run 50/km, plank 0.3/s | `FitnessUtils.RULES` |
| Daily cap | Activity XP per user-local day capped | `x_fitchal_fitness.max_daily_xp` (1000) |
| Levels | `floor(total_xp / xp_per_level) + 1` | `x_fitchal_fitness.xp_per_level` (500) |
| Anti-cheat | Reject > N reps per activity; reject sensor/camera pace faster than N ms/rep | `max_reps_per_activity` (500), `min_rep_duration_ms` (300) |
| Edit lock | Scoring fields of a logged activity can't be edited | BR "Lock activity scoring fields" |
| Calories | Estimated when not supplied | `FitnessUtils.RULES[*].kcal` |
| Streaks | +1 on consecutive local days, reset after a gap; nightly reset job | BR + "Reset broken streaks" job |
| Badges | streak (longest streak), milestone (total push-ups), achievement (activity count); XP bonus not capped | `x_fitchal_fitness_badge` rows |
| Challenges | Progress from activities during active challenges; 1v1/team auto-complete at goal; hourly close at end date + leaderboard ranks | BR + hourly job |

### REST API (`/api/x_fitchal_fitness/fitness`, authenticated)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/activity` | Log an activity `{activity_type, reps_count, duration, distance, detection_method, notes}` → XP, profile, new badges |
| GET | `/activity?limit=&activity_type=` | My recent activities |
| GET | `/profile` | My XP, level, streaks, totals, push-ups, rank, badges, XP left today |
| GET | `/leaderboard?limit=` | Top users by XP |
| GET | `/badges` | All badges with my earned state |
| GET | `/challenges?status=active` | Challenges with my participation |
| POST | `/challenges/{id}/join` | Join (`team_name` required for team challenges) |

## 🚀 Build & Deploy

```bash
python3 tools/build_app.py      # regenerates x_fitchal_fitness/src and dist/deploy/*.js
```

* **Studio:** Import from Source Control, path `/x_fitchal_fitness/src`.
* **Scripted:** run `dist/deploy/02_tables.js` … `08_seed.js` in order as background scripts
  in scope `x_fitchal_fitness` (create the app first). Each step is idempotent and keeps the repo's sys_ids.
* **Verify:** run `tools/tests/validate_v1.js`, then `feature_tests.js` / `rest_ops_tests.js` (see `tools/tests/README.md`).

Edit scripts in `tools/app_spec/scripts/` and metadata in `tools/build_app.py` — never hand-edit generated XML.

### Known gaps in v1
* No ACLs yet: REST/business logic run server-side, but non-admin users can't open the tables in the UI.
* `user` / `created_by` have no `gs.getUserID()` dictionary default (rejected by the instance); the activity BR sets `user`.
* The legacy `block-0x/` folders keep their `PROMPT.md`/`VALIDATE.js` for reference; their XML was removed
  (invalid sys_ids) and is superseded by `x_fitchal_fitness/src`.

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

**Status**: v1.0.0 deployed (blocks 01–11, 20) ✅ | Next: sensor & camera rep counters (blocks 12–13) 🔜

