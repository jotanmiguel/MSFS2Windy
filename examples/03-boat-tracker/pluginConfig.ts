import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'teste',
    version: '0.1.0',
    title: 'Boat Tracker',
    icon: '✈️',
    description: 'This plugin demonstrates how to create simple race tracker.',
    author: 'John Doe (optional company name)',
    repository: 'https://github.com/jotanmiguel/MSFS2Windy',
    desktopUI: 'rhpane',
    mobileUI: 'small',
    desktopWidth: 200,
    routerPath: '/boat-tracker',
};

export default config;
