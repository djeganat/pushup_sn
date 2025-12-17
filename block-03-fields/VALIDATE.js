/**
 * BLOCK 03: Database Fields - Validation Script
 *
 * Run this in: System Definition → Scripts - Background
 *
 * Expected Result: All checks should show ✅ PASS
 */

(function validateBlock03() {
    var results = [];
    var allPassed = true;

    gs.info('═══════════════════════════════════════════════════════════');
    gs.info('   BLOCK 03: DATABASE FIELDS - VALIDATION');
    gs.info('═══════════════════════════════════════════════════════════');

    // Define expected fields for each table
    var tableFields = {
        'x_fitchal_fitness_activity': [
            'user', 'activity_type', 'reps_count', 'duration', 'distance',
            'calories_burned', 'xp_earned', 'activity_date', 'notes', 'detection_method'
        ],
        'x_fitchal_fitness_user_profile': [
            'user', 'total_xp', 'level', 'current_streak', 'longest_streak',
            'last_activity_date', 'total_activities', 'total_calories', 'rank', 'avatar_url'
        ],
        'x_fitchal_fitness_badge': [
            'name', 'description', 'badge_type', 'requirement_value',
            'icon_url', 'xp_reward', 'rarity'
        ],
        'x_fitchal_fitness_user_badge': [
            'user', 'badge', 'earned_date', 'progress'
        ],
        'x_fitchal_fitness_challenge': [
            'name', 'description', 'challenge_type', 'start_date', 'end_date',
            'goal_type', 'goal_value', 'status', 'created_by', 'winner', 'winner_team'
        ],
        'x_fitchal_fitness_participant': [
            'challenge', 'user', 'team_name', 'current_progress', 'rank', 'joined_date'
        ]
    };

    var totalFieldsExpected = 48;
    var totalFieldsFound = 0;

    // Test: Check each table's fields
    for (var tableName in tableFields) {
        var expectedFields = tableFields[tableName];
        var fieldsFound = 0;

        for (var i = 0; i < expectedFields.length; i++) {
            var fieldName = expectedFields[i];
            var dict = new GlideRecord('sys_dictionary');
            dict.addQuery('name', tableName);
            dict.addQuery('element', fieldName);
            dict.query();

            if (dict.next()) {
                fieldsFound++;
                totalFieldsFound++;
            } else {
                results.push('❌ FAIL: Field "' + tableName + '.' + fieldName + '" not found');
                allPassed = false;
            }
        }

        if (fieldsFound === expectedFields.length) {
            results.push('✅ PASS: Table "' + tableName + '" has all ' + fieldsFound + ' fields');
        } else {
            results.push('❌ FAIL: Table "' + tableName + '" has ' + fieldsFound + '/' + expectedFields.length + ' fields');
            allPassed = false;
        }
    }

    // Summary test: All fields should exist
    if (totalFieldsFound === totalFieldsExpected) {
        results.push('✅ PASS: All ' + totalFieldsExpected + ' custom fields exist (' + totalFieldsFound + '/' + totalFieldsExpected + ')');
    } else {
        results.push('❌ FAIL: Only ' + totalFieldsFound + '/' + totalFieldsExpected + ' fields found');
        allPassed = false;
    }

    // Test: Reference fields point to correct tables
    var refTests = [
        { table: 'x_fitchal_fitness_activity', field: 'user', refTable: 'sys_user' },
        { table: 'x_fitchal_fitness_user_profile', field: 'user', refTable: 'sys_user' },
        { table: 'x_fitchal_fitness_user_badge', field: 'user', refTable: 'sys_user' },
        { table: 'x_fitchal_fitness_user_badge', field: 'badge', refTable: 'x_fitchal_fitness_badge' },
        { table: 'x_fitchal_fitness_challenge', field: 'created_by', refTable: 'sys_user' },
        { table: 'x_fitchal_fitness_participant', field: 'challenge', refTable: 'x_fitchal_fitness_challenge' },
        { table: 'x_fitchal_fitness_participant', field: 'user', refTable: 'sys_user' }
    ];

    var refPassed = 0;
    for (var j = 0; j < refTests.length; j++) {
        var test = refTests[j];
        var dict = new GlideRecord('sys_dictionary');
        dict.addQuery('name', test.table);
        dict.addQuery('element', test.field);
        dict.query();

        if (dict.next()) {
            var refTable = dict.getValue('reference');
            if (refTable === test.refTable) {
                refPassed++;
            } else {
                results.push('⚠️ WARN: Field "' + test.table + '.' + test.field + '" references "' + refTable + '" (expected "' + test.refTable + '")');
            }
        }
    }

    if (refPassed === refTests.length) {
        results.push('✅ PASS: All reference fields point to correct tables (' + refPassed + '/' + refTests.length + ')');
    } else {
        results.push('⚠️ WARN: Some reference fields may have issues (' + refPassed + '/' + refTests.length + ' validated)');
    }

    // Test: Block 02 dependency (tables exist)
    var tablesExist = true;
    for (var tableName in tableFields) {
        var table = new GlideRecord('sys_db_object');
        table.addQuery('name', tableName);
        table.query();
        if (!table.next()) {
            results.push('❌ FAIL: Table "' + tableName + '" not found - Deploy Block 02 first');
            allPassed = false;
            tablesExist = false;
        }
    }

    if (tablesExist) {
        results.push('✅ PASS: All required tables exist (Block 02 dependency)');
    }

    // Print results
    gs.info('');
    results.forEach(function(r) {
        gs.info(r);
    });

    gs.info('');
    gs.info('═══════════════════════════════════════════════════════════');
    if (allPassed) {
        gs.info('   ✅ BLOCK 03 VALIDATION PASSED - Proceed to Block 04');
        gs.info('');
        gs.info('   📊 Fields Summary:');
        gs.info('   • Activity table: 10 fields');
        gs.info('   • User Profile table: 10 fields');
        gs.info('   • Badge table: 7 fields');
        gs.info('   • User Badge table: 4 fields');
        gs.info('   • Challenge table: 11 fields');
        gs.info('   • Participant table: 6 fields');
        gs.info('   • Total: 48 custom fields');
        gs.info('');
        gs.info('   ➡️ Next: Block 04 will add choice lists for dropdown fields');
    } else {
        gs.info('   ❌ BLOCK 03 VALIDATION FAILED - Fix issues before proceeding');
    }
    gs.info('═══════════════════════════════════════════════════════════');

    return allPassed;
})();
