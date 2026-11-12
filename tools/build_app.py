#!/usr/bin/env python3
"""
FitChallenge (x_fitchal_fitness) application generator.

Single source of truth for the app's metadata. Produces:
  * x_fitchal_fitness/src/<table>/<name>.xml   -> source-control / Studio import format
  * dist/deploy/NN_<step>.js                     -> idempotent background scripts used to
                                                    deploy the same records (same sys_ids)

sys_ids are deterministic (md5 of the record's update name) so re-running the
generator never changes them, and the repo and instance stay in sync.

Usage:  python3 tools/build_app.py
"""
import hashlib
import json
import os
import shutil
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'x_fitchal_fitness', 'src')
DIST = os.path.join(ROOT, 'dist', 'deploy')
SCRIPTS = os.path.join(ROOT, 'tools', 'app_spec', 'scripts')

SCOPE = 'x_fitchal_fitness'
APP_ID = 'a1b2c3d4e5f6789012345678abcdef01'
APP_NAME = 'FitChallenge'
VERSION = '1.0.0'

# Records created before the generator existed keep their instance sys_ids.
FIXED_IDS = {
    'sys_db_object_x_fitchal_fitness_badge': 'b6e3a1c4f0a14f1d9e2b7c5d8a9f0e11',
    'sys_dictionary_x_fitchal_fitness_badge_name': 'ed26777c53641310a28656a0a0490e84',
}


def sid(update_name):
    return FIXED_IDS.get(update_name) or hashlib.md5(('%s:%s' % (SCOPE, update_name)).encode()).hexdigest()


def script(name):
    with open(os.path.join(SCRIPTS, name)) as f:
        return f.read()


# --------------------------------------------------------------------------- tables
TABLES = [
    ('x_fitchal_fitness_activity', 'Fitness Activity'),
    ('x_fitchal_fitness_user_profile', 'User Profile'),
    ('x_fitchal_fitness_badge', 'Badge'),
    ('x_fitchal_fitness_user_badge', 'User Badge'),
    ('x_fitchal_fitness_challenge', 'Challenge'),
    ('x_fitchal_fitness_participant', 'Participant'),
]

# (element, label, type, max_length, extras)
S, I, DEC, REF, DT, D, URL = 'string', 'integer', 'decimal', 'reference', 'glide_date_time', 'glide_date', 'url'
FIELDS = {
    'x_fitchal_fitness_activity': [
        # No script default: the instance's 'Validate Default Value' rule rejects it; the BR sets user instead.
        ('user', 'User', REF, 32, dict(reference='sys_user', mandatory=True)),
        ('activity_type', 'Activity Type', S, 40, dict(mandatory=True, choice=3, default_value='pushup')),
        ('reps_count', 'Reps', I, None, {}),
        ('duration', 'Duration (seconds)', I, None, {}),
        ('distance', 'Distance (km)', DEC, None, {}),
        ('calories_burned', 'Calories Burned', I, None, {}),
        # Computed by business rule, so read-only and not mandatory on the form.
        ('xp_earned', 'XP Earned', I, None, dict(read_only=True)),
        ('activity_date', 'Activity Date', DT, None, dict(mandatory=True, default_value='javascript:new GlideDateTime().getDisplayValue()')),
        ('notes', 'Notes', S, 1000, {}),
        ('detection_method', 'Detection Method', S, 40, dict(choice=3, default_value='manual')),
    ],
    'x_fitchal_fitness_user_profile': [
        ('user', 'User', REF, 32, dict(reference='sys_user', mandatory=True, unique=True, display=True)),
        ('total_xp', 'Total XP', I, None, dict(mandatory=True, default_value='0', read_only=True)),
        ('level', 'Level', I, None, dict(mandatory=True, default_value='1', read_only=True)),
        ('current_streak', 'Current Streak', I, None, dict(mandatory=True, default_value='0', read_only=True)),
        ('longest_streak', 'Longest Streak', I, None, dict(mandatory=True, default_value='0', read_only=True)),
        ('last_activity_date', 'Last Activity Date', D, None, dict(read_only=True)),
        ('total_activities', 'Total Activities', I, None, dict(mandatory=True, default_value='0', read_only=True)),
        ('total_calories', 'Total Calories', I, None, dict(mandatory=True, default_value='0', read_only=True)),
        ('rank', 'Rank', I, None, dict(read_only=True)),
        ('avatar_url', 'Avatar URL', URL, 255, {}),
    ],
    'x_fitchal_fitness_badge': [
        ('name', 'Name', S, 100, dict(mandatory=True, display=True)),
        ('description', 'Description', S, 500, {}),
        ('badge_type', 'Badge Type', S, 40, dict(mandatory=True, choice=3)),
        ('requirement_value', 'Requirement Value', I, None, dict(mandatory=True)),
        ('icon_url', 'Icon URL', URL, 255, {}),
        ('xp_reward', 'XP Reward', I, None, dict(mandatory=True, default_value='0')),
        ('rarity', 'Rarity', S, 40, dict(mandatory=True, choice=3, default_value='common')),
    ],
    'x_fitchal_fitness_user_badge': [
        ('user', 'User', REF, 32, dict(reference='sys_user', mandatory=True)),
        ('badge', 'Badge', REF, 32, dict(reference='x_fitchal_fitness_badge', mandatory=True)),
        ('earned_date', 'Earned Date', DT, None, dict(mandatory=True)),
        ('progress', 'Progress', I, None, {}),
    ],
    'x_fitchal_fitness_challenge': [
        ('name', 'Name', S, 100, dict(mandatory=True, display=True)),
        ('description', 'Description', S, 1000, {}),
        ('challenge_type', 'Challenge Type', S, 40, dict(mandatory=True, choice=3, default_value='solo')),
        ('start_date', 'Start Date', D, None, dict(mandatory=True)),
        ('end_date', 'End Date', D, None, dict(mandatory=True)),
        ('goal_type', 'Goal Type', S, 40, dict(mandatory=True, choice=3, default_value='reps')),
        ('goal_value', 'Goal Value', I, None, dict(mandatory=True)),
        ('status', 'Status', S, 40, dict(mandatory=True, choice=3, default_value='draft')),
        ('created_by', 'Created By', REF, 32, dict(reference='sys_user', mandatory=True)),
        ('winner', 'Winner', REF, 32, dict(reference='sys_user')),
        ('winner_team', 'Winner Team', S, 100, {}),
    ],
    'x_fitchal_fitness_participant': [
        ('challenge', 'Challenge', REF, 32, dict(reference='x_fitchal_fitness_challenge', mandatory=True)),
        ('user', 'User', REF, 32, dict(reference='sys_user', mandatory=True)),
        ('team_name', 'Team Name', S, 100, {}),
        ('current_progress', 'Current Progress', I, None, dict(mandatory=True, default_value='0')),
        ('rank', 'Rank', I, None, {}),
        ('joined_date', 'Joined Date', DT, None, dict(mandatory=True, default_value='javascript:new GlideDateTime().getDisplayValue()')),
    ],
}

# ------------------------------------------------------------------------- choices
CHOICES = {
    ('x_fitchal_fitness_activity', 'activity_type'): [('pushup', 'Push-up'), ('pullup', 'Pull-up'), ('run', 'Run'), ('plank', 'Plank')],
    ('x_fitchal_fitness_activity', 'detection_method'): [('sensor', 'Sensor'), ('camera', 'Camera (AI)'), ('manual', 'Manual')],
    ('x_fitchal_fitness_badge', 'badge_type'): [('streak', 'Streak'), ('milestone', 'Milestone'), ('achievement', 'Achievement')],
    ('x_fitchal_fitness_badge', 'rarity'): [('common', 'Common'), ('rare', 'Rare'), ('epic', 'Epic'), ('legendary', 'Legendary')],
    ('x_fitchal_fitness_challenge', 'challenge_type'): [('team', 'Team'), ('1v1', '1v1'), ('solo', 'Solo')],
    ('x_fitchal_fitness_challenge', 'goal_type'): [('reps', 'Reps'), ('distance', 'Distance'), ('calories', 'Calories'), ('activities', 'Activities')],
    ('x_fitchal_fitness_challenge', 'status'): [('draft', 'Draft'), ('active', 'Active'), ('completed', 'Completed'), ('cancelled', 'Cancelled')],
}

# ---------------------------------------------------------------------- properties
PROPERTIES = [
    ('max_daily_xp', '1000', 'Maximum XP that can be earned from activities in a single day (badge rewards excluded).'),
    ('xp_per_level', '500', 'XP required per level. Level = floor(total_xp / xp_per_level) + 1.'),
    ('max_reps_per_activity', '500', 'Maximum reps accepted in a single push-up/pull-up activity (anti-cheat).'),
    ('min_rep_duration_ms', '300', 'Minimum average milliseconds per rep for sensor/camera activities (anti-cheat).'),
]

ROLES = [
    ('x_fitchal_fitness.user', 'FitChallenge user: log activities, join challenges.'),
    ('x_fitchal_fitness.admin', 'FitChallenge administrator: manage badges and challenges.'),
]

BUSINESS_RULES = [
    # name, when, order, insert, update, script
    ('FitChallenge - Validate and score activity', 'before', 100, True, False, 'br_activity_validate_score.js'),
    ('FitChallenge - Lock activity scoring fields', 'before', 100, False, True, 'br_activity_lock_scoring.js'),
    ('FitChallenge - Update profile and badges', 'after', 200, True, False, 'br_activity_apply_profile.js'),
    ('FitChallenge - Update challenge progress', 'after', 300, True, False, 'br_activity_challenge_progress.js'),
]

JOBS = [
    # name, run_type, run_time, run_period, script
    ('FitChallenge - Reset broken streaks', 'daily', '1970-01-01 00:15:00', '', 'job_reset_streaks.js'),
    ('FitChallenge - Close challenges and rank leaderboard', 'periodically', '1970-01-01 00:00:00', '1970-01-01 01:00:00', 'job_ranks_challenges.js'),
]

REST_API = dict(name='FitChallenge API', service_id='fitness')
REST_OPS = [
    # name, method, relative_path, script
    ('Log activity', 'POST', '/activity', 'rest_post_activity.js'),
    ('List my activities', 'GET', '/activity', 'rest_get_activities.js'),
    ('Get my profile', 'GET', '/profile', 'rest_get_profile.js'),
    ('Get leaderboard', 'GET', '/leaderboard', 'rest_get_leaderboard.js'),
    ('List badges', 'GET', '/badges', 'rest_get_badges.js'),
    ('List challenges', 'GET', '/challenges', 'rest_get_challenges.js'),
    ('Join challenge', 'POST', '/challenges/{id}/join', 'rest_post_join_challenge.js'),
]

BADGES = [
    # name, type, requirement, xp_reward, rarity, description
    ('First Rep', 'achievement', 1, 10, 'common', 'Log your first activity.'),
    ('Getting Serious', 'achievement', 10, 50, 'common', 'Log 10 activities.'),
    ('Dedicated', 'achievement', 50, 200, 'rare', 'Log 50 activities.'),
    ('Century', 'milestone', 100, 50, 'common', 'Complete 100 push-ups in total.'),
    ('Push-up Pro', 'milestone', 1000, 250, 'rare', 'Complete 1,000 push-ups in total.'),
    ('Iron Chest', 'milestone', 10000, 1000, 'epic', 'Complete 10,000 push-ups in total.'),
    ('Week Warrior', 'streak', 7, 100, 'common', 'Keep a 7-day streak.'),
    ('Fortnight Fighter', 'streak', 14, 200, 'rare', 'Keep a 14-day streak.'),
    ('Monthly Machine', 'streak', 30, 500, 'epic', 'Keep a 30-day streak.'),
    ('Unbreakable', 'streak', 365, 5000, 'legendary', 'Keep a 365-day streak.'),
]


# --------------------------------------------------------------------------- build
def records():
    """Yields (step, table, update_name, file_name, natural_key, fields) in deploy order."""
    for name, label in TABLES:
        un = 'sys_db_object_%s' % name
        yield ('02_tables', 'sys_db_object', un, name, {'name': name},
               dict(name=name, label=label, access='public', read_access=True, create_access=True,
                    update_access=True, delete_access=False, ws_access=True, create_access_controls=False,
                    is_extendable=False, caller_access=''))

    for table, fields in FIELDS.items():
        for el, label, typ, ml, ex in fields:
            un = 'sys_dictionary_%s_%s' % (table, el)
            f = dict(name=table, element=el, column_label=label, internal_type=typ, active=True,
                     mandatory=bool(ex.get('mandatory')), read_only=bool(ex.get('read_only')),
                     unique=bool(ex.get('unique')), display=bool(ex.get('display')),
                     choice=ex.get('choice', 0), default_value=ex.get('default_value', ''),
                     reference=ex.get('reference', ''))
            if ml:
                f['max_length'] = ml
            yield ('03_fields', 'sys_dictionary', un, '%s_%s' % (table, el), {'name': table, 'element': el}, f)

    for (table, el), items in CHOICES.items():
        for seq, (value, label) in enumerate(items, 1):
            un = 'sys_choice_%s_%s_%s' % (table, el, value)
            yield ('04_choices', 'sys_choice', un, '%s_%s_%s' % (table, el, value),
                   {'name': table, 'element': el, 'value': value, 'language': 'en'},
                   dict(name=table, element=el, value=value, label=label, sequence=seq * 10,
                        language='en', inactive=False))

    yield ('05_logic', 'sys_script_include', 'sys_script_include_FitnessUtils', 'FitnessUtils',
           {'api_name': '%s.FitnessUtils' % SCOPE},
           dict(name='FitnessUtils', api_name='%s.FitnessUtils' % SCOPE, access='public', active=True,
                client_callable=False, script=script('FitnessUtils.js'),
                description='XP scoring, daily cap, streaks, levels, badges, challenge progress and leaderboard ranking for FitChallenge.'))

    for name, when, order, ins, upd, fn in BUSINESS_RULES:
        un = 'sys_script_%s' % fn[:-3]
        yield ('05_logic', 'sys_script', un, fn[:-3], {'name': name, 'collection': 'x_fitchal_fitness_activity'},
               dict(name=name, collection='x_fitchal_fitness_activity', when=when, order=order,
                    action_insert=ins, action_update=upd, action_delete=False, action_query=False,
                    active=True, advanced=True, script=script(fn)))

    for name, run_type, run_time, period, fn in JOBS:
        un = 'sysauto_script_%s' % fn[:-3]
        f = dict(name=name, run_type=run_type, run_time=run_time, active=True, script=script(fn))
        if period:
            f['run_period'] = period
        yield ('06_jobs_props_roles', 'sysauto_script', un, fn[:-3], {'name': name}, f)

    for suffix, value, desc in PROPERTIES:
        name = '%s.%s' % (SCOPE, suffix)
        yield ('06_jobs_props_roles', 'sys_properties', 'sys_properties_%s' % name, name, {'name': name},
               dict(name=name, suffix=suffix, value=value, type='integer', description=desc, is_private=False))

    for name, desc in ROLES:
        yield ('06_jobs_props_roles', 'sys_user_role', 'sys_user_role_%s' % name, name, {'name': name},
               dict(name=name, suffix=name.split('.', 1)[1], description=desc, elevated_privilege=False))
    yield ('06_jobs_props_roles', 'sys_user_role_contains',
           'sys_user_role_contains_admin_user', 'admin_contains_user',
           {'role': sid('sys_user_role_x_fitchal_fitness.admin'), 'contains': sid('sys_user_role_x_fitchal_fitness.user')},
           dict(role=sid('sys_user_role_x_fitchal_fitness.admin'), contains=sid('sys_user_role_x_fitchal_fitness.user')))

    api_un = 'sys_ws_definition_%s' % REST_API['service_id']
    yield ('07_rest', 'sys_ws_definition', api_un, REST_API['service_id'], {'service_id': REST_API['service_id'], 'namespace': SCOPE},
           dict(name=REST_API['name'], service_id=REST_API['service_id'], namespace=SCOPE, active=True,
                consumes='application/json', produces='application/json',
                is_versioned=False, enforce_acl='', doc_link=''))
    for name, method, path, fn in REST_OPS:
        un = 'sys_ws_operation_%s' % fn[:-3]
        yield ('07_rest', 'sys_ws_operation', un, fn[:-3],
               {'web_service_definition': sid(api_un), 'http_method': method, 'relative_path': path},
               dict(name=name, web_service_definition=sid(api_un), http_method=method, relative_path=path,
                    active=True, requires_authentication=True, requires_acl_authorization=False,
                    consumes='application/json', produces='application/json',
                    operation_script=script(fn)))

    for name, typ, req, xp, rarity, desc in BADGES:
        un = 'x_fitchal_fitness_badge_%s' % name.lower().replace(' ', '_').replace('-', '_')
        yield ('08_seed', 'x_fitchal_fitness_badge', un, un, {'name': name},
               dict(name=name, badge_type=typ, requirement_value=req, xp_reward=xp, rarity=rarity, description=desc))


def xml_value(v):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    return escape(str(v))


def to_xml(table, update_name, fields):
    sys_id = sid(update_name)
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<record_update table="%s">' % table,
             '    <%s action="INSERT_OR_UPDATE">' % table]
    for k in sorted(fields):
        v = fields[k]
        if isinstance(v, str) and ('\n' in v or '<' in v or '&' in v):
            lines.append('        <%s><![CDATA[%s]]></%s>' % (k, v, k))
        elif v == '' or v is None:
            lines.append('        <%s/>' % k)
        else:
            lines.append('        <%s>%s</%s>' % (k, xml_value(v), k))
    lines += ['        <sys_class_name>%s</sys_class_name>' % table,
              '        <sys_id>%s</sys_id>' % sys_id,
              '        <sys_package display_value="%s" source="%s">%s</sys_package>' % (APP_NAME, SCOPE, APP_ID),
              '        <sys_scope display_value="%s">%s</sys_scope>' % (APP_NAME, APP_ID),
              '        <sys_update_name>%s</sys_update_name>' % update_name,
              '    </%s>' % table,
              '</record_update>', '']
    return '\n'.join(lines)


APP_XML = '''<?xml version="1.0" encoding="UTF-8"?>
<record_update table="sys_app">
    <sys_app action="INSERT_OR_UPDATE">
        <active>true</active>
        <enforce_license>none</enforce_license>
        <licensable>false</licensable>
        <name>%s</name>
        <runtime_access_tracking>permissive</runtime_access_tracking>
        <scope>%s</scope>
        <scoped_administration>false</scoped_administration>
        <short_description>Gamified fitness tracking application with XP, badges, streaks, and challenges</short_description>
        <sys_class_name>sys_app</sys_class_name>
        <sys_id>%s</sys_id>
        <version>%s</version>
    </sys_app>
</record_update>
''' % (APP_NAME, SCOPE, APP_ID, VERSION)

LOADER = r'''/* FitChallenge deploy step %(step)s - generated by tools/build_app.py. Idempotent. Run in scope x_fitchal_fitness.
   Each record: [table, sys_id, [natural key fields], {fields}]. Empty/false values are omitted (platform defaults). */
var R = %(json)s;
var out = [], bad = 0;
for (var i = 0; i < R.length; i++) {
    var t = R[i][0], id = R[i][1], keys = R[i][2], f = R[i][3], k;
    var gr = new GlideRecord(t), found = gr.get(id);
    if (!found) {
        gr = new GlideRecord(t);
        for (k = 0; k < keys.length; k++) gr.addQuery(keys[k], f[keys[k]]);
        gr.query();
        found = gr.next();
    }
    if (!found) { gr = new GlideRecord(t); gr.initialize(); gr.setNewGuidValue(id); }
    for (k in f) gr.setValue(k, f[k]);
    var ok = found ? gr.update() : gr.insert();
    if (!ok) bad++;
    out.push((found ? 'U' : 'I') + (ok ? ' ok ' : ' FAIL ') + t + ' ' + (f.element || f.value || f.name || id) + (ok ? '' : ' :: ' + gr.getLastErrorMessage()));
}
gs.print('@@RESULT@@ ' + (R.length - bad) + '/' + R.length + ' ok');
gs.print(out.join('\n'));
'''


def main():
    # Fresh, generated source tree (sn_source_control.properties is preserved).
    keep = os.path.join(SRC, 'sn_source_control.properties')
    props = open(keep).read() if os.path.exists(keep) else 'path=/x_fitchal_fitness/src\n'
    if os.path.isdir(SRC):
        shutil.rmtree(SRC)
    os.makedirs(os.path.join(SRC, 'sys_app'))
    with open(keep, 'w') as f:
        f.write(props)
    with open(os.path.join(SRC, 'sys_app', '%s.xml' % SCOPE), 'w') as f:
        f.write(APP_XML)

    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    steps, counts, seen = {}, {}, set()
    for step, table, un, fname, key, fields in records():
        sys_id = sid(un)
        assert sys_id not in seen, 'duplicate sys_id for %s' % un
        seen.add(sys_id)
        d = os.path.join(SRC, table)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, '%s.xml' % fname), 'w') as f:
            f.write(to_xml(table, un, fields))
        jf = {k: (('true' if v else 'false') if isinstance(v, bool) else str(v))
              for k, v in fields.items() if v not in ('', None, False) and not (k == 'choice' and v == 0)}
        jf.update({k: str(v) for k, v in key.items()})  # natural-key values must always be present
        steps.setdefault(step, []).append([table, sys_id, sorted(key), jf])
        counts[table] = counts.get(table, 0) + 1

    for step, recs in steps.items():
        # Keep each background script small enough for the execution endpoint.
        chunk, part = [], 1
        size = 0
        for r in recs + [None]:
            if r is not None:
                rs = len(json.dumps(r))
                if chunk and size + rs > 60000:
                    pass
                else:
                    chunk.append(r); size += rs
                    continue
            name = '%s%s.js' % (step, '' if r is None and part == 1 else '_%d' % part)
            with open(os.path.join(DIST, name), 'w') as f:
                f.write(LOADER % dict(step=name, json=json.dumps(chunk, separators=(',', ':'))))
            if r is not None:
                chunk, size, part = [r], len(json.dumps(r)), part + 1

    print('Generated %d records into %s' % (sum(counts.values()) + 1, os.path.relpath(SRC, ROOT)))
    for t in sorted(counts):
        print('  %-26s %d' % (t, counts[t]))
    print('Deploy scripts:', ', '.join(sorted(os.listdir(DIST))))


if __name__ == '__main__':
    main()
