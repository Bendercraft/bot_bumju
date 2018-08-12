import * as Discord from 'discord.js';
import * as Log4js  from 'log4js';

import { ChannelsController } from './channels_controller';

const LOGGER_ALL = Log4js.getLogger('default');

export class BumjuBot
{
    private client: Discord.Client;
    private controller: ChannelsController;

    constructor ()
    {
        this.client = new Discord.Client();
        this.controller = new ChannelsController();

        this.client.on('ready', this.onReady);
        this.client.on('voiceStateUpdate', this.onVoiceChannelUpdate);
    }

    public onReady =  () => 
    {
        LOGGER_ALL.info(`Logged in as ${this.client.user.tag}`);
        this.client.user.setActivity('Avatar Horizon');
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

    public run (token: string): void 
    {
        this.client.login(token);
    }
}