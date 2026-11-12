/* FitChallenge v1 - Scripted REST operation tests (15 checks) using a mock request/response. See README.md. */
var me = gs.getUserID(), res = [];
function run(opId, body, qp, pp) {
    var op = new GlideRecord('sys_ws_operation'); op.get(opId);
    var request = { body: { data: body || {} }, queryParams: qp || {}, pathParams: pp || {} };
    var response = { status: 200, setStatus: function (s) { this.status = s; } };
    var fn = new Function('request', 'response', 'FitnessUtils', 'return ' + op.getValue('operation_script').replace(/;\s*$/, ''));
    var out; try { out = fn(request, response, x_fitchal_fitness.FitnessUtils); } catch (e) { return { status: 'EXC', body: String(e) }; }
    return { status: response.status, body: out };
}
function check(n, c, d) { res.push((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ' -> ' + JSON.stringify(d))); }
var OP = { post: '07613bb6ba42ca8055e5f19f81641282', list: 'd33e7e4b0570d65bd2882eb394196fb2', prof: '785a256c73d661ef50ad2ad6bd75778f', lb: '30839a19da5fa3a6cc17e826b95ba07c', badges: 'c6a9ab970e026e0e58f4892329643d1c', ch: 'a98853147a9f494716617597882a66f8', join: 'd9ca7a585e4a5db9d8ed674208067861' };

var r = run(OP.badges); check('GET /badges -> 10', r.status == 200 && r.body.badges.length == 10, r);
r = run(OP.prof); check('GET /profile fresh', r.status == 200 && r.body.total_xp == 0 && r.body.level == 1, r);
r = run(OP.post, { activity_type: 'pushup', reps_count: 25, detection_method: 'sensor', duration: 40 });
check('POST /activity 201 xp 25', r.status == 201 && r.body.activity.xp_earned == 25, r);
check('POST returns First Rep + profile xp 35', r.body && r.body.new_badges && r.body.new_badges.indexOf('First Rep') > -1 && r.body.profile.total_xp == 35, r.body);
r = run(OP.post, { activity_type: 'pushup', reps_count: 50, detection_method: 'sensor', duration: 3 }); check('POST implausible -> 400', r.status == 400 && /implausible/.test(r.body.error), r);
r = run(OP.post, { activity_type: 'pushup' }); check('POST no reps -> 400', r.status == 400, r);
r = run(OP.list, null, { limit: '5' }); check('GET /activity -> 1', r.status == 200 && r.body.activities.length == 1, r);
r = run(OP.lb); check('GET /leaderboard has me', r.status == 200 && r.body.leaderboard.some(function (x) { return x.is_me; }), r);
r = run(OP.prof); check('GET /profile pushups 25, 1 badge, xp_remaining 975', r.body.total_pushups == 25 && r.body.badges.length == 1 && r.body.xp_remaining_today == 975, r.body);

var today = new GlideDateTime().getLocalDate().getValue(); var c = new GlideRecord('x_fitchal_fitness_challenge'); c.initialize(); c.setValue('name', 'TEST team'); c.setValue('challenge_type', 'team'); c.setValue('goal_type', 'reps'); c.setValue('goal_value', 30); c.setValue('status', 'active'); c.setValue('start_date', today); c.setValue('end_date', today); c.setValue('created_by', me); var cid = c.insert();
r = run(OP.ch); check('GET /challenges lists team challenge, not joined', r.status == 200 && r.body.challenges.some(function (x) { return x.sys_id == cid && !x.joined; }), r);
r = run(OP.join, {}, {}, { id: cid }); check('join team w/o team_name -> 400', r.status == 400, r);
r = run(OP.join, { team_name: 'Red' }, {}, { id: cid }); check('join team -> 201', r.status == 201, r);
r = run(OP.join, { team_name: 'Red' }, {}, { id: cid }); check('re-join -> already_joined', r.status == 200 && r.body.already_joined, r);
r = run(OP.post, { activity_type: 'pushup', reps_count: 30 }); c.get(cid); check('team goal reached -> completed, winner_team Red', c.getValue('status') == 'completed' && c.getValue('winner_team') == 'Red', c.getValue('status'));
r = run(OP.join, {}, {}, { id: '00000000000000000000000000000000' }); check('join unknown -> 404', r.status == 404, r);

var cl = new x_fitchal_fitness.FitnessUtils().purgeUserData(me);
var p = 0, f = []; res.forEach(function (x) { if (x.indexOf('PASS') == 0) p++; else f.push(x); });
gs.print('@@REST@@ ' + p + '/' + res.length + ' passed\n' + f.join('\n') + '\ncleanup ' + JSON.stringify(cl) + ' leftover challenge=' + cid);
