import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-teste',
    version: '0.1.0',
    title: 'MSFS2Windy Plane Tracker',
    icon: '✈️',
    description: 'This plugin demonstrates how to create simple race tracker.',
    author: 'John Doe (optional company name)',
    repository: 'https://github.com/jotanmiguel/MSFS2Windy',
    desktopUI: 'embedded',
    mobileUI: 'small',
    routerPath: '/msfs2windy',
};

export default config;
