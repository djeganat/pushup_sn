(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var limit = Math.min(parseInt(request.queryParams.limit, 10) || 20, 100);
    var out = [];
    var a = new GlideRecord(FitnessUtils.T.ACTIVITY);
    a.addQuery('user', gs.getUserID());
    if (request.queryParams.activity_type) a.addQuery('activity_type', String(request.queryParams.activity_type));
    a.orderByDesc('activity_date');
    a.setLimit(limit);
    a.query();
    while (a.next()) {
        out.push({
            sys_id: a.getUniqueValue(),
            activity_type: a.getValue('activity_type'),
            reps_count: parseInt(a.getValue('reps_count'), 10) || 0,
            duration: parseInt(a.getValue('duration'), 10) || 0,
            distance: parseFloat(a.getValue('distance')) || 0,
            calories_burned: parseInt(a.getValue('calories_burned'), 10) || 0,
            xp_earned: parseInt(a.getValue('xp_earned'), 10) || 0,
            detection_method: a.getValue('detection_method'),
            activity_date: a.getValue('activity_date')
        });
    }
    return { activities: out };
})(request, response);
