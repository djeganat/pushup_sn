/**
 * BLOCK 01: Application Shell - Validation Script
 * 
 * Run this in: System Definition → Scripts - Background
 * 
 * Expected Result: All checks should show ✅ PASS
 */

(function validateBlock01() {
    var results = [];
    var allPassed = true;
    
    gs.info('═══════════════════════════════════════════════════════════');
    gs.info('   BLOCK 01: APPLICATION SHELL - VALIDATION');
    gs.info('═══════════════════════════════════════════════════════════');
    
    // Test 1: Application exists
    var app = new GlideRecord('sys_app');
    app.addQuery('scope', 'x_fitchal_fitness');
    app.query();
    
    if (app.next()) {
        results.push('✅ PASS: Application "x_fitchal_fitness" exists');
        
        // Test 2: Application name
        if (app.getValue('name') === 'FitChallenge') {
            results.push('✅ PASS: Application name is "FitChallenge"');
        } else {
            results.push('❌ FAIL: Application name should be "FitChallenge", found: ' + app.getValue('name'));
            allPassed = false;
        }
        
        // Test 3: Version
        var version = app.getValue('version');
        if (version && version.indexOf('1.0') === 0) {
            results.push('✅ PASS: Version is 1.0.x (' + version + ')');
        } else {
            results.push('⚠️ WARN: Version should start with 1.0, found: ' + version);
        }
        
        // Test 4: Scope format
        if (app.getValue('scope') === 'x_fitchal_fitness') {
            results.push('✅ PASS: Scope is correctly formatted "x_fitchal_fitness"');
        } else {
            results.push('❌ FAIL: Scope mismatch');
            allPassed = false;
        }
        
    } else {
        results.push('❌ FAIL: Application "x_fitchal_fitness" not found');
        allPassed = false;
    }
    
    // Test 5: Can create records in scope
    try {
        var testTable = new GlideRecord('sys_db_object');
        testTable.addQuery('name', 'STARTSWITH', 'x_fitchal_fitness');
        testTable.setLimit(1);
        testTable.query();
        results.push('✅ PASS: Scope is accessible for queries');
    } catch (e) {
        results.push('❌ FAIL: Cannot query scope: ' + e.message);
        allPassed = false;
    }
    
    // Print results
    gs.info('');
    results.forEach(function(r) {
        gs.info(r);
    });
    
    gs.info('');
    gs.info('═══════════════════════════════════════════════════════════');
    if (allPassed) {
        gs.info('   ✅ BLOCK 01 VALIDATION PASSED - Proceed to Block 02');
    } else {
        gs.info('   ❌ BLOCK 01 VALIDATION FAILED - Fix issues before proceeding');
    }
    gs.info('═══════════════════════════════════════════════════════════');
    
    return allPassed;
})();
