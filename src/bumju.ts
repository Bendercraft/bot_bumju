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
        this.client.on('error', this.onWebsocketError);
        this.client.on('rateLimit', this.onRateLimitReached);
        this.client.on('warn', this.onWarning);
        this.client.on('disconnect', this.onDisconnect);
        this.client.on('voiceStateUpdate', this.onVoiceChannelUpdate);
        this.client.on('message', this.onMessage);
    }

    public onReady = () => 
    {
        LOGGER_ALL.info(`Logged in as ${this.client.user.tag}`);
        this.client.user.setActivity('Avatar Horizon');
    }

    public onWebsocketError = (error: Error) => 
    {
        LOGGER_ALL.info('A websocket error occured');
        LOGGER_ERROR.error(error);
    }

    public onRateLimitReached = (rateLimitInfo: any) =>
    {
        LOGGER_ALL.info('Rate limmit reached');
        LOGGER_ERROR.error(rateLimitInfo);
    }

    public onWarning = (warning: string) => 
    {
        LOGGER_ALL.warn(warning);
    }

    public onDisconnect = (event: CloseEvent) => 
    {
        LOGGER_ALL.info('The websocket got disconnected');
        LOGGER_ERROR.error(event);
        this.client.destroy().then(this.client.login.bind(this.client));
    }

    public async executeResetCommand(message: Discord.Message) 
    {
        try
        {
            if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR))
            {
                await this.controller.clearAllChannels();
                await message.channel.send('Channels deleted'); 
            }
            else 
            {
                await message.member.send('Vous n\'avez pas la permission d\'exécuter cette commande.');
            }
            if (message.deletable) { await message.delete(); }
        }
        catch (e) 
        {
            LOGGER_ALL.warn('An exception occured while trying to reset channels');
            LOGGER_ERROR.error(e);
        }
    }

    public async executeDebugCommand(message: Discord.Message)
    {
        try
        {
            if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR))
            {
                let response = 'I do know about the following channels: \n'; 
                response += this.controller.getDebugMessage();
                await message.channel.send(response)
            }
            else 
            {
                await message.member.send('Vous n\'avez pas la permission d\'exécuter cette commande.');
            }
            if (message.deletable) { await message.delete(); }
        }
        catch (e) 
        {
            LOGGER_ALL.warn('An exception occured while trying to debug channels');
            LOGGER_ERROR.error(e);
        }
    }

    public onMessage = async (message: Discord.Message) =>
    {
        if (message.channel.type === 'text') 
        {
            if (message.content === 'b!reset') 
            {
                await this.executeResetCommand(message);
            }
            else if (message.content === 'b!debug')
            {
                await this.executeDebugCommand(message);
            }
        }
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
    }
}