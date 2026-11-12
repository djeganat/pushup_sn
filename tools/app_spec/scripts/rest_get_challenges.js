(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var status = String(request.queryParams.status || 'active');
    var mine = {};
    var part = new GlideRecord(FitnessUtils.T.PARTICIPANT);
    part.addQuery('user', gs.getUserID());
    part.query();
    while (part.next()) mine[part.getValue('challenge')] = { progress: parseInt(part.getValue('current_progress'), 10) || 0, rank: parseInt(part.getValue('rank'), 10) || null, team_name: part.getValue('team_name') };
    var out = [];
    var ch = new GlideRecord(FitnessUtils.T.CHALLENGE);
    ch.addQuery('status', status);
    ch.orderBy('end_date');
    ch.query();
    while (ch.next()) {
        out.push({
            sys_id: ch.getUniqueValue(),
            name: ch.getValue('name'),
            description: ch.getValue('description'),
            challenge_type: ch.getValue('challenge_type'),
            goal_type: ch.getValue('goal_type'),
            goal_value: parseInt(ch.getValue('goal_value'), 10) || 0,
            start_date: ch.getValue('start_date'),
            end_date: ch.getValue('end_date'),
            status: ch.getValue('status'),
            joined: !!mine[ch.getUniqueValue()],
            my_progress: mine[ch.getUniqueValue()] || null
        });
    }
    return { challenges: out };
})(request, response);
