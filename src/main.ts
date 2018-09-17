import * as Log4js  from 'log4js';
import {BumjuBot}   from './bumju';

const BOT_TOKEN: string = require('../settings.json').token;

Log4js.configure('./log_config.json');
const ALL_LOGGER = Log4js.getLogger('default');

const bot = new BumjuBot(BOT_TOKEN);


async function onSignalReceived(signal: NodeJS.Signals) {
    ALL_LOGGER.info(`${signal} received`);
    await bot.onServerExit();
    ALL_LOGGER.info('Discord client destroyed');
    process.exit();
}

process.on('SIGINT', onSignalReceived);
process.on('SIGTERM', onSignalReceived);


bot.run();
