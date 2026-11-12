(function executeRule(current, previous /*null when async*/) {
    // XP, profile totals and challenge progress are derived at insert time.
    // Block edits to the scoring inputs so XP cannot be farmed by editing a logged activity.
    var locked = ['user', 'activity_type', 'reps_count', 'duration', 'distance', 'calories_burned', 'xp_earned', 'activity_date'];
    for (var i = 0; i < locked.length; i++) {
        if (current[locked[i]].changes()) {
            gs.addErrorMessage('Logged activities cannot change "' + locked[i] + '". Log a new activity instead.');
            current.setAbortAction(true);
            return;
        }
    }
})(current, previous);
