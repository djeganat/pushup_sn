/**
 * FitChallenge v1 - deployment inventory check.
 * Run in: System Definition > Scripts - Background, scope x_fitchal_fitness.
 * Expected: every line PASS.
 */
(function () {
    function cnt(t, q) { var a = new GlideAggregate(t); a.addEncodedQuery(q); a.addAggregate('COUNT'); a.setGroup(false); a.query(); return a.next() ? parseInt(a.getAggregate('COUNT'), 10) : 0; }
    var out = [], ok = true;
    function check(name, actual, expected) { var p = actual === expected; ok = ok && p; out.push((p ? 'PASS ' : 'FAIL ') + name + ' = ' + actual + (p ? '' : ' (expected ' + expected + ')')); }
    var fields = { activity: 10, user_profile: 10, badge: 7, user_badge: 4, challenge: 11, participant: 6 };
    var choices = { activity: 7, badge: 7, challenge: 11 };
    for (var t in fields) {
        var n = 'x_fitchal_fitness_' + t;
        check('table ' + n, new GlideRecord(n).isValid(), true);
        check('  fields', cnt('sys_dictionary', 'name=' + n + '^elementISNOTEMPTY^elementNOT LIKEsys_'), fields[t]);
        if (choices[t]) check('  choices', cnt('sys_choice', 'name=' + n), choices[t]);
    }
    check('script include FitnessUtils', cnt('sys_script_include', 'api_name=x_fitchal_fitness.FitnessUtils^active=true'), 1);
    check('business rules', cnt('sys_script', 'collection=x_fitchal_fitness_activity^active=true'), 4);
    check('scheduled jobs', cnt('sysauto_script', 'nameSTARTSWITHFitChallenge^active=true'), 2);
    check('properties', cnt('sys_properties', 'nameSTARTSWITHx_fitchal_fitness.'), 4);
    check('roles', cnt('sys_user_role', 'nameSTARTSWITHx_fitchal_fitness.'), 2);
    check('REST operations', cnt('sys_ws_operation', 'web_service_definition.service_id=fitness^active=true'), 7);
    check('seed badges', cnt('x_fitchal_fitness_badge', ''), 10);
    gs.print((ok ? 'ALL PASS' : 'FAILURES FOUND') + '\n' + out.join('\n'));
})();
