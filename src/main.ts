import * as Log4js  from 'log4js';
import {BumjuBot}   from './bumju';

const BOT_TOKEN: string = require('../settings.json').token;

Log4js.configure('./log_config.json');
const ALL_LOGGER = Log4js.getLogger('default');

const bot: BumjuBot = new BumjuBot();

process.on('SIGINT', async () =>
{
    ALL_LOGGER.info('SIGINT received');

    await bot.onServerExit();

    ALL_LOGGER.info('Discord client destroyed');

    process.exit();
});

process.on('SIGTERM', async () =>
{
    ALL_LOGGER.info('SIGTERM received');

    await bot.onServerExit();

    ALL_LOGGER.info('Discord client destroyed');

    process.exit();
});


bot.run(BOT_TOKEN);
