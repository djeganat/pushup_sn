import {navLayoutContext} from '@servicenow/aiux/aiux-components-nav';
import {i18n} from '@servicenow/aiux/aiux-services';
import {AppTheme} from './theme.js';

export default {
  appTheme: AppTheme,
  applicationLayout: 'aiux-nav-layout',

  setup(ctx) {
    const items = [
      {
        icon: 'home',
        title: i18n.getMessage('Home'),
        action: {type: 'navigate', path: '/home'}
      },
      {
        icon: 'video-camera',
        title: i18n.getMessage('AI camera counter'),
        action: {type: 'navigate', path: '/camera'}
      },
      {
        icon: 'mobile-phone',
        title: i18n.getMessage('Sensor counter'),
        action: {type: 'navigate', path: '/sensors'}
      }
    ];

    const activeRoute = ctx.app?.routes?.find(r => r.active);
    const itemsWithActive = items.map(item => ({
      ...item,
      ...(item.action?.path === activeRoute?.route && {active: true})
    }));

    navLayoutContext.set({
      ...navLayoutContext.get(),
      appTitle: i18n.getMessage('FitChallenge'),
      features: {
        unifiedExperience: true
      },
      items: itemsWithActive,
      defaultLogoFull: 'servicenow',
      defaultLogoIcon: 'servicenow'
    });
  },

  navigate() {
    return undefined;
  },

  teardown() {
    navLayoutContext.set({...navLayoutContext.get(), items: []});
  }
};
