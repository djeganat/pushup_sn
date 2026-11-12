import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'aiux-color-swatch|fitchallenge': {
                        table: 'sys_aix_color_swatch'
                        id: 'f821d1f5b3da043d78e3129a05163a28'
                    }
                    'aiux-dependency|document-title.js': {
                        table: 'sys_aix_dependency'
                        id: '838b319dac049136e119ea5e99fb5df8'
                    }
                    'aiux-dependency|fitchallenge-session-result.js': {
                        table: 'sys_aix_dependency'
                        id: '62ffbed3bcdff0adf112955a9c903b8d'
                    }
                    'aiux-experience-page-rel|x-2167777-fitchal-camera-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: 'ab00c0e60e8f29e62b772593e902df7a'
                    }
                    'aiux-experience-page-rel|x-2167777-fitchal-home-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: 'ae5189355a9b918d30827d2938724ca4'
                    }
                    'aiux-experience-page-rel|x-2167777-fitchal-sensors-page': {
                        table: 'sys_aix_experience_page_rel'
                        id: '97921e3334b7a32e6e55cb08572f7e25'
                    }
                    'aiux-experience-prop|appHeadCss': {
                        table: 'sys_aix_experience_properties'
                        id: 'bb2a1a29459b9a1f6dd4656537705890'
                    }
                    'aiux-experience-prop|appPlatform': {
                        table: 'sys_aix_experience_properties'
                        id: '53b58d53ca1e8bac340bb890bb1687d7'
                    }
                    'aiux-experience-prop|appTailwindCss': {
                        table: 'sys_aix_experience_properties'
                        id: '3a96fcb59be0abc0d150610def599fff'
                    }
                    'aiux-experience|fitchallenge': {
                        table: 'sys_aix_experience'
                        id: '788d6606d52126c847fe6e743a733480'
                    }
                    'aiux-layout-widget|lifecycle': {
                        table: 'sys_aix_widget'
                        id: '1f08f9d95ab66bf2bc49edaa960e5df0'
                    }
                    'aiux-m2m-widget-dep|aiux-pushup-camera-counter|fitchallenge-session-result.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '258838109cdd19e1b7f728ff49caf37a'
                    }
                    'aiux-m2m-widget-dep|aiux-pushup-sensor-counter|fitchallenge-session-result.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: 'f622bfce6fbcf592bc00053f3eb24631'
                    }
                    'aiux-m2m-widget-dep|x-2167777-fitchal-camera-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '80d444dbe0d823bea022e01f8a45eabb'
                    }
                    'aiux-m2m-widget-dep|x-2167777-fitchal-home-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: 'e7696d3142ae449866e4309824a52c54'
                    }
                    'aiux-m2m-widget-dep|x-2167777-fitchal-sensors-page|document-title.js': {
                        table: 'sys_aix_m2m_widget_dependency'
                        id: '8d54cffab1375d9b9729bdcefda0b88e'
                    }
                    'aiux-page-widget|x-2167777-fitchal-camera-page': {
                        table: 'sys_aix_widget'
                        id: '6c909d209a75d3f36b6e1f02f1f93932'
                    }
                    'aiux-page-widget|x-2167777-fitchal-home-page': {
                        table: 'sys_aix_widget'
                        id: '0f46b2080336840cd5264ffd96123ca9'
                    }
                    'aiux-page-widget|x-2167777-fitchal-sensors-page': {
                        table: 'sys_aix_widget'
                        id: '39da7b9dd44fda37ba1902e00053cf5f'
                    }
                    'aiux-page|x-2167777-fitchal-camera-page': {
                        table: 'sys_aix_page'
                        id: '618821b5bae64da4a32dffb31639981d'
                    }
                    'aiux-page|x-2167777-fitchal-home-page': {
                        table: 'sys_aix_page'
                        id: '46c432f756a91fceda789c39f6752842'
                    }
                    'aiux-page|x-2167777-fitchal-sensors-page': {
                        table: 'sys_aix_page'
                        id: 'b258e72377d9224ea7661c84d62ec72c'
                    }
                    'aiux-project|x_2167777_fitchal_fitchallenge': {
                        table: 'sys_aix_project'
                        id: '6d689b29b7473a7546bd93650b9af83a'
                    }
                    'aiux-theme|fitchallenge': {
                        table: 'sys_aix_theme'
                        id: '711248ccdc37f4e1cfc5e5820e7280cb'
                    }
                    'aiux-widget|aiux-pushup-camera-counter': {
                        table: 'sys_aix_widget'
                        id: 'fb8efac3cbe8b5f837ea5ec2bbb55ba5'
                    }
                    'aiux-widget|aiux-pushup-sensor-counter': {
                        table: 'sys_aix_widget'
                        id: 'eef0f6e348ededef9d3c8c106c778b63'
                    }
                    'aiux-widget|aiux-studio-preview': {
                        table: 'sys_aix_widget'
                        id: 'af62ff8c10de575035b4ce06b4b416d5'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'bbe2922ee3a34958b67f795d700fe9a4'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'd3863e3d26944f8a831570d6877f3daf'
                    }
                    'sys-analytics-app|fitchallenge': {
                        table: 'sys_analytics_app'
                        id: 'd4e1556fd7a38d7e7929c9c05ee25655'
                    }
                }
                composite: [
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '32ee6079517b485f8e3bf0125912d366'
                        key: {
                            application_file: '6d689b29b7473a7546bd93650b9af83a'
                            source_artifact: 'ebb050e8a390484d8443571da9bf92f2'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'ebb050e8a390484d8443571da9bf92f2'
                        key: {
                            name: 'aiux-source 6d689b29b7473a7546bd93650b9af83a'
                        }
                    },
                ]
            }
        }
    }
}
