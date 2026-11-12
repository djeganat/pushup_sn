(function executeRule(current, previous /*null when async*/) {
    var fu = new FitnessUtils();
    if (current.user.nil()) current.setValue('user', gs.getUserID());
    if (current.activity_date.nil()) current.setValue('activity_date', new GlideDateTime());
    if (current.detection_method.nil()) current.setValue('detection_method', 'manual');

    var err = fu.validateActivity(current);
    if (err) {
        gs.addErrorMessage(err);
        current.setAbortAction(true);
        return;
    }
    if (current.calories_burned.nil()) current.setValue('calories_burned', fu.estimateCalories(current));
    current.setValue('xp_earned', fu.scoreActivity(current));
})(current, previous);
