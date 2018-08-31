import * as Discord from 'discord.js';
import * as Log4js  from 'log4js';

import { ChannelsController } from './channels_controller';

const LOGGER_ALL = Log4js.getLogger('default');
const LOGGER_ERROR = Log4js.getLogger('error');

export class BumjuBot
{
    private client: Discord.Client;
    private controller: ChannelsController;
    private token: string;

    constructor (token: string)
    {
        this.token = token;
        this.client = new Discord.Client();
        this.controller = new ChannelsController();

        this.client.on('ready', this.onReady);
        this.client.on('disconnect', this.onDisconnect);
        this.client.on('voiceStateUpdate', this.onVoiceChannelUpdate);
    }

    public onReady =  () => 
    {
        LOGGER_ALL.info(`Logged in as ${this.client.user.tag}`);
        this.client.user.setActivity('Avatar Horizon');
    }

    public onDisconnect = (event: CloseEvent) => 
    {
        LOGGER_ALL.info('The websocket got disconnected');
        LOGGER_ERROR.error(event);
        this.client.destroy().then(this.client.login.bind(this.client));
    }

    public onVoiceChannelUpdate = (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) =>
    {
        if (newMember.voiceChannel == null)
        {
            this.controller.handlePlayerLeaveChannel(oldMember);
        }
        else
        {
            if (oldMember.voiceChannel == null) 
            {
                this.controller.handlePlayerJoinChannel(newMember);
            }
            else if (oldMember.voiceChannel.id !== newMember.voiceChannel.id)
            {
                this.controller.handlePlayerSwitchChannel(oldMember, newMember);
            }
        }
    }

    public onServerExit = async () =>
    {
        await this.controller.clearAllChannels();
        await this.client.destroy();
    }

    private login(): void 
    {
        this.client.login(this.token);
    }

    public run (): void 
    {
        this.login();
        LOGGER_ALL.log('Started server');
    }
}