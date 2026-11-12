(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var body = request.body.data || {};
    var fu = new FitnessUtils();
    var userId = gs.getUserID();
    var started = new GlideDateTime();

    var a = new GlideRecord(FitnessUtils.T.ACTIVITY);
    a.initialize();
    a.setValue('user', userId);
    a.setValue('activity_type', body.activity_type || 'pushup');
    a.setValue('detection_method', body.detection_method || 'manual');
    a.setValue('activity_date', new GlideDateTime());
    var nums = ['reps_count', 'duration', 'distance', 'calories_burned'];
    for (var i = 0; i < nums.length; i++)
        if (body[nums[i]] !== undefined && body[nums[i]] !== null && body[nums[i]] !== '') a.setValue(nums[i], body[nums[i]]);
    if (body.notes) a.setValue('notes', String(body.notes).substring(0, 1000));

    var err = fu.validateActivity(a);
    if (err) {
        response.setStatus(400);
        return { error: err };
    }
    var id = a.insert();
    if (!id) {
        response.setStatus(400);
        return { error: 'Activity was rejected.' };
    }
    a.get(id);
    var p = fu.getOrCreateProfile(userId);
    var badges = [];
    var ub = new GlideRecord(FitnessUtils.T.USER_BADGE);
    ub.addQuery('user', userId);
    ub.addQuery('sys_created_on', '>=', started);
    ub.query();
    while (ub.next()) badges.push(ub.badge.getDisplayValue());

    response.setStatus(201);
    return {
        activity: {
            sys_id: id,
            activity_type: a.getValue('activity_type'),
            reps_count: parseInt(a.getValue('reps_count'), 10) || 0,
            xp_earned: parseInt(a.getValue('xp_earned'), 10) || 0,
            calories_burned: parseInt(a.getValue('calories_burned'), 10) || 0,
            detection_method: a.getValue('detection_method')
        },
        profile: {
            total_xp: parseInt(p.getValue('total_xp'), 10) || 0,
            level: parseInt(p.getValue('level'), 10) || 1,
            current_streak: parseInt(p.getValue('current_streak'), 10) || 0,
            xp_remaining_today: Math.max(0, fu.maxDailyXP - fu.getXPEarnedToday(userId))
        },
        new_badges: badges
    };
})(request, response);
