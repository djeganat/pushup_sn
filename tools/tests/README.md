# FitChallenge tests

Run these as background scripts (System Definition > Scripts - Background) with the
application scope set to **FitChallenge** (`x_fitchal_fitness`), as an admin.

| Script | What it checks |
|---|---|
| `validate_v1.js` | Deployment inventory: 6 tables, 48 fields, 25 choices, logic, jobs, properties, roles, REST, seed badges |
| `feature_tests.js` | 31 behavioural checks: XP scoring, calories, badges, daily XP cap, anti-cheat, edit lock, 1v1 challenge, streaks, ranks |
| `rest_ops_tests.js` | 15 checks that execute each Scripted REST operation with a mock request/response |

`feature_tests.js` and `rest_ops_tests.js` create data for the running user and remove it
with `FitnessUtils.purgeUserData()`. They each leave behind one `TEST ...` challenge and its
other participants (background scripts run in the global scope and can't delete app rows);
delete those from the Challenge list afterwards. Both expect no existing profile for the running user.
