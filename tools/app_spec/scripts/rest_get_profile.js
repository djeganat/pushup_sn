(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var fu = new FitnessUtils();
    var userId = gs.getUserID();
    var p = fu.getOrCreateProfile(userId);
    var xp = parseInt(p.getValue('total_xp'), 10) || 0;
    var badges = [];
    var ub = new GlideRecord(FitnessUtils.T.USER_BADGE);
    ub.addQuery('user', userId);
    ub.orderByDesc('earned_date');
    ub.query();
    while (ub.next()) badges.push({ name: ub.badge.name + '', rarity: ub.badge.rarity + '', earned_date: ub.getValue('earned_date') });
    return {
        user: gs.getUserName(),
        total_xp: xp,
        level: parseInt(p.getValue('level'), 10) || 1,
        xp_to_next_level: fu.xpPerLevel - (xp % fu.xpPerLevel),
        current_streak: parseInt(p.getValue('current_streak'), 10) || 0,
        longest_streak: parseInt(p.getValue('longest_streak'), 10) || 0,
        last_activity_date: p.getValue('last_activity_date'),
        total_activities: parseInt(p.getValue('total_activities'), 10) || 0,
        total_calories: parseInt(p.getValue('total_calories'), 10) || 0,
        total_pushups: fu.getTotalReps(userId, 'pushup'),
        rank: parseInt(p.getValue('rank'), 10) || null,
        xp_remaining_today: Math.max(0, fu.maxDailyXP - fu.getXPEarnedToday(userId)),
        badges: badges
    };
})(request, response);
