var fu = new x_fitchal_fitness.FitnessUtils();
var closed = fu.closeExpiredChallenges();
var ranked = fu.recalculateRanks();
gs.info('FitChallenge: closed ' + closed + ' challenge(s), ranked ' + ranked + ' profile(s)');
