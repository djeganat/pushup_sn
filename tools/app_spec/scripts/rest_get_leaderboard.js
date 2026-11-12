(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var limit = Math.min(parseInt(request.queryParams.limit, 10) || 10, 100);
    var out = [];
    var pos = 0;
    var p = new GlideRecord(FitnessUtils.T.PROFILE);
    p.orderByDesc('total_xp');
    p.orderBy('sys_created_on');
    p.setLimit(limit);
    p.query();
    while (p.next()) {
        pos++;
        out.push({
            position: pos,
            user: p.user.getDisplayValue(),
            is_me: p.getValue('user') === gs.getUserID(),
            total_xp: parseInt(p.getValue('total_xp'), 10) || 0,
            level: parseInt(p.getValue('level'), 10) || 1,
            current_streak: parseInt(p.getValue('current_streak'), 10) || 0
        });
    }
    return { leaderboard: out };
})(request, response);
