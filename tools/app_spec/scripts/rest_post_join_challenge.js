(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var id = request.pathParams.id;
    var body = request.body.data || {};
    var ch = new GlideRecord(FitnessUtils.T.CHALLENGE);
    if (!ch.get(id)) {
        response.setStatus(404);
        return { error: 'Challenge not found.' };
    }
    if (ch.getValue('status') !== 'active' && ch.getValue('status') !== 'draft') {
        response.setStatus(409);
        return { error: 'Challenge is ' + ch.getValue('status') + ' and cannot be joined.' };
    }
    if (ch.getValue('challenge_type') === 'team' && !body.team_name) {
        response.setStatus(400);
        return { error: 'team_name is required for team challenges.' };
    }
    var p = new GlideRecord(FitnessUtils.T.PARTICIPANT);
    p.addQuery('challenge', id);
    p.addQuery('user', gs.getUserID());
    p.query();
    if (p.next()) {
        response.setStatus(200);
        return { joined: true, already_joined: true, participant: p.getUniqueValue() };
    }
    if (ch.getValue('challenge_type') === '1v1') {
        var count = new GlideAggregate(FitnessUtils.T.PARTICIPANT);
        count.addQuery('challenge', id);
        count.addAggregate('COUNT');
        count.setGroup(false);
        count.query();
        if (count.next() && parseInt(count.getAggregate('COUNT'), 10) >= 2) {
            response.setStatus(409);
            return { error: 'This 1v1 challenge already has two participants.' };
        }
    }
    p.initialize();
    p.setValue('challenge', id);
    p.setValue('user', gs.getUserID());
    p.setValue('team_name', body.team_name ? String(body.team_name).substring(0, 100) : '');
    p.setValue('current_progress', 0);
    p.setValue('joined_date', new GlideDateTime());
    var pid = p.insert();
    new FitnessUtils().evaluateChallenge(id);
    response.setStatus(201);
    return { joined: true, participant: pid };
})(request, response);
