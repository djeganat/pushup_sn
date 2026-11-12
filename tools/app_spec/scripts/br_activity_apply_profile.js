(function executeRule(current, previous /*null when async*/) {
    var fu = new FitnessUtils();
    var earned = fu.applyActivityToProfile(current);
    if (earned.length) gs.addInfoMessage('Badge earned: ' + earned.join(', '));
})(current, previous);
