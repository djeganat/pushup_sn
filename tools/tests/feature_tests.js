/* FitChallenge v1 - behavioural feature tests (31 checks). See README.md for how to run. */
var FitnessUtils = x_fitchal_fitness.FitnessUtils;
var T = FitnessUtils.T, me = gs.getUserID(), res = [];
function check(name, cond, detail) { res.push((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' -> ' + detail : '')); }
function log(type, fields) { var a = new GlideRecord(T.ACTIVITY); a.initialize(); a.setValue('activity_type', type); for (var k in fields) a.setValue(k, fields[k]); var id = a.insert(); if (id) a.get(id); return id ? a : null; }
function prof() { var p = new GlideRecord(T.PROFILE); p.get('user', me); return p; }

var pre = new GlideRecord(T.PROFILE); check('precondition: no profile for running user', !pre.get('user', me));
var other = new GlideRecord('sys_user'); other.addQuery('user_name', 'abel.tuter'); other.query(); other.next();

// Scoring, calories, defaults, profile, first badge
var a1 = log('pushup', { reps_count: 20 });
check('pushup 20 reps logged', !!a1);
check('xp = 20 (1/rep)', a1.getValue('xp_earned') == '20', a1.getValue('xp_earned'));
check('calories estimated = 8', a1.getValue('calories_burned') == '8', a1.getValue('calories_burned'));
check('detection defaults manual, user defaults me', a1.getValue('detection_method') == 'manual' && a1.getValue('user') == me);
var p = prof(); check('profile auto-created', p.isValidRecord());
check('First Rep badge (+10) -> total_xp 30', p.getValue('total_xp') == '30', p.getValue('total_xp'));
check('streak = 1', p.getValue('current_streak') == '1' && p.getValue('longest_streak') == '1');

// Milestone badge
var a2 = log('pushup', { reps_count: 100, detection_method: 'camera', duration: 120 });
p = prof(); check('camera 100 reps/120s accepted, xp 100', a2 && a2.getValue('xp_earned') == '100');
check('Century badge (+50) -> total_xp 180', p.getValue('total_xp') == '180', p.getValue('total_xp'));
check('same-day activity keeps streak 1', p.getValue('current_streak') == '1');
var ub = new GlideAggregate(T.USER_BADGE); ub.addQuery('user', me); ub.addAggregate('COUNT'); ub.setGroup(false); ub.query(); ub.next();
check('2 badges owned', ub.getAggregate('COUNT') == '2', ub.getAggregate('COUNT'));

// Anti-cheat validation
check('rejects 600 reps (limit 500)', log('pushup', { reps_count: 600 }) === null);
check('rejects sensor 50 reps in 5s (implausible pace)', log('pushup', { reps_count: 50, detection_method: 'sensor', duration: 5 }) === null);
check('rejects 0 reps', log('pushup', { reps_count: 0 }) === null);
check('rejects unknown type', log('burpee', { reps_count: 5 }) === null);

// Daily XP cap (1000)
var a3 = log('pushup', { reps_count: 500 }); var a4 = log('pushup', { reps_count: 500 }); var a5 = log('pushup', { reps_count: 10 });
check('cap: 500 -> 500 xp', a3.getValue('xp_earned') == '500');
check('cap: next 500 -> 380 xp (1000 - 620)', a4.getValue('xp_earned') == '380', a4.getValue('xp_earned'));
check('cap: next 10 -> 0 xp', a5.getValue('xp_earned') == '0', a5.getValue('xp_earned'));
p = prof(); check('level = floor(xp/500)+1', p.getValue('level') == String(Math.floor(parseInt(p.getValue('total_xp'), 10) / 500) + 1), 'xp=' + p.getValue('total_xp') + ' level=' + p.getValue('level'));
check('Push-up Pro (1000 reps) awarded: xp = 1000+10+50+250', p.getValue('total_xp') == '1310', p.getValue('total_xp'));

// Edit lock
var e = new GlideRecord(T.ACTIVITY); e.get(a1.getUniqueValue()); e.setValue('reps_count', 999); e.update(); e.get(a1.getUniqueValue());
check('editing reps on a logged activity is blocked', e.getValue('reps_count') == '20');

// 1v1 challenge
var today = new GlideDateTime().getLocalDate().getValue();
var c = new GlideRecord(T.CHALLENGE); c.initialize(); c.setValue('name', 'TEST 1v1'); c.setValue('challenge_type', '1v1'); c.setValue('goal_type', 'reps'); c.setValue('goal_value', 50); c.setValue('status', 'active'); c.setValue('start_date', today); c.setValue('end_date', today); c.setValue('created_by', me); var cid = c.insert();
[me, other.getUniqueValue()].forEach(function (u) { var pp = new GlideRecord(T.PARTICIPANT); pp.initialize(); pp.setValue('challenge', cid); pp.setValue('user', u); pp.setValue('current_progress', 0); pp.setValue('joined_date', new GlideDateTime()); pp.insert(); });
var a6 = log('pushup', { reps_count: 60 });
check('over-cap activity still counts for challenges (xp 0)', a6.getValue('xp_earned') == '0');
var mp = new GlideRecord(T.PARTICIPANT); mp.addQuery('challenge', cid); mp.addQuery('user', me); mp.query(); mp.next();
c.get(cid); check('challenge progress +60', mp.getValue('current_progress') == '60', mp.getValue('current_progress'));
check('1v1 completed, winner = me, rank 1', c.getValue('status') == 'completed' && c.getValue('winner') == me && mp.getValue('rank') == '1', c.getValue('status') + '/' + mp.getValue('rank'));

// Streak rules (unit test on an unsaved record)
var fu = new FitnessUtils(); var s = new GlideRecord(T.PROFILE); s.initialize();
s.setValue('last_activity_date', '2026-11-10'); s.setValue('current_streak', 4); s.setValue('longest_streak', 4); fu.updateStreak(s, '2026-11-11');
check('next day -> streak 5', s.getValue('current_streak') == '5' && s.getValue('longest_streak') == '5');
fu.updateStreak(s, '2026-11-14'); check('gap -> streak 1, longest stays 5', s.getValue('current_streak') == '1' && s.getValue('longest_streak') == '5');
fu.updateStreak(s, '2026-11-01'); check('back-dated -> unchanged', s.getValue('current_streak') == '1' && s.getValue('last_activity_date') == '2026-11-14');

// Ranks, jobs, aggregates
fu.recalculateRanks(); check('leaderboard rank 1', prof().getValue('rank') == '1');
check('resetBrokenStreaks runs', fu.resetBrokenStreaks() >= 0);
check('getTotalReps = 1190', fu.getTotalReps(me, 'pushup') == 1190, fu.getTotalReps(me, 'pushup'));

var cl = fu.purgeUserData(me);
var passed = 0, fails = []; res.forEach(function (r) { if (r.indexOf('PASS') == 0) passed++; else fails.push(r); });
gs.print('@@TEST@@ ' + passed + '/' + res.length + ' passed\n' + fails.join('\n') + '\ncleanup ' + JSON.stringify(cl) + ' leftover challenge=' + cid);
