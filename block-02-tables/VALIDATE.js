/**
 * BLOCK 02: Database Tables - Validation Script
 *
 * Run this in: System Definition → Scripts - Background
 *
 * Expected Result: All checks should show ✅ PASS
 */

(function validateBlock02() {
    var results = [];
    var allPassed = true;

    gs.info('═══════════════════════════════════════════════════════════');
    gs.info('   BLOCK 02: DATABASE TABLES - VALIDATION');
    gs.info('═══════════════════════════════════════════════════════════');

    // Required tables with their labels
    var requiredTables = [
        { name: 'x_fitchal_fitness_activity', label: 'Fitness Activity' },
        { name: 'x_fitchal_fitness_user_profile', label: 'User Profile' },
        { name: 'x_fitchal_fitness_badge', label: 'Badge' },
        { name: 'x_fitchal_fitness_user_badge', label: 'User Badge' },
        { name: 'x_fitchal_fitness_challenge', label: 'Challenge' },
        { name: 'x_fitchal_fitness_participant', label: 'Challenge Participant' }
    ];

    // Test: Check each table exists
    var tablesFound = 0;
    requiredTables.forEach(function(tableInfo) {
        var table = new GlideRecord('sys_db_object');
        table.addQuery('name', tableInfo.name);
        table.query();

        if (table.next()) {
            var actualLabel = table.getValue('label');
            if (actualLabel === tableInfo.label) {
                results.push('✅ PASS: Table "' + tableInfo.name + '" exists with correct label');
                tablesFound++;
            } else {
                results.push('⚠️ WARN: Table "' + tableInfo.name + '" exists but label is "' + actualLabel + '" (expected "' + tableInfo.label + '")');
                tablesFound++;
            }

            // Check if table is in correct scope
            var scopeName = table.sys_scope.getDisplayValue();
            if (scopeName === 'FitChallenge' || table.getValue('sys_scope') === 'a1b2c3d4e5f6789012345678abcdef01') {
                // Scope is correct (no output to reduce noise)
            } else {
                results.push('⚠️ WARN: Table "' + tableInfo.name + '" may not be in FitChallenge scope');
            }
        } else {
            results.push('❌ FAIL: Table "' + tableInfo.name + '" not found');
            allPassed = false;
        }
    });

    // Summary test: All 6 tables should exist
    if (tablesFound === 6) {
        results.push('✅ PASS: All 6 required tables exist (' + tablesFound + '/6)');
    } else {
        results.push('❌ FAIL: Only ' + tablesFound + '/6 tables found');
        allPassed = false;
    }

    // Test: Can query tables (basic accessibility)
    try {
        var activity = new GlideRecord('x_fitchal_fitness_activity');
        activity.setLimit(1);
        activity.query();
        results.push('✅ PASS: Tables are accessible for queries');
    } catch (e) {
        results.push('❌ FAIL: Cannot query tables: ' + e.message);
        allPassed = false;
    }

    // Test: Application still exists (Block 01 dependency)
    var app = new GlideRecord('sys_app');
    app.addQuery('scope', 'x_fitchal_fitness');
    app.query();
    if (app.next()) {
        results.push('✅ PASS: Application "FitChallenge" exists (Block 01 dependency)');
    } else {
        results.push('❌ FAIL: Application "FitChallenge" not found - Deploy Block 01 first');
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
        gs.info('   ✅ BLOCK 02 VALIDATION PASSED - Proceed to Block 03');
        gs.info('');
        gs.info('   📊 Tables Created:');
        gs.info('   • x_fitchal_fitness_activity (Fitness Activity)');
        gs.info('   • x_fitchal_fitness_user_profile (User Profile)');
        gs.info('   • x_fitchal_fitness_badge (Badge)');
        gs.info('   • x_fitchal_fitness_user_badge (User Badge)');
        gs.info('   • x_fitchal_fitness_challenge (Challenge)');
        gs.info('   • x_fitchal_fitness_participant (Challenge Participant)');
        gs.info('');
        gs.info('   ➡️ Next: Block 03 will add fields to these tables');
    } else {
        gs.info('   ❌ BLOCK 02 VALIDATION FAILED - Fix issues before proceeding');
    }
    gs.info('═══════════════════════════════════════════════════════════');

    return allPassed;
})();
