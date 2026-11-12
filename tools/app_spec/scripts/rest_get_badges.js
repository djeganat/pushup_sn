(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var owned = {};
    var ub = new GlideRecord(FitnessUtils.T.USER_BADGE);
    ub.addQuery('user', gs.getUserID());
    ub.query();
    while (ub.next()) owned[ub.getValue('badge')] = ub.getValue('earned_date');
    var out = [];
    var b = new GlideRecord(FitnessUtils.T.BADGE);
    b.orderBy('badge_type');
    b.orderBy('requirement_value');
    b.query();
    while (b.next()) {
        out.push({
            sys_id: b.getUniqueValue(),
            name: b.getValue('name'),
            description: b.getValue('description'),
            badge_type: b.getValue('badge_type'),
            requirement_value: parseInt(b.getValue('requirement_value'), 10) || 0,
            xp_reward: parseInt(b.getValue('xp_reward'), 10) || 0,
            rarity: b.getValue('rarity'),
            earned: !!owned[b.getUniqueValue()],
            earned_date: owned[b.getUniqueValue()] || null
        });
    }
    return { badges: out };
})(request, response);
