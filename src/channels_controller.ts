import * as Discord from 'discord.js';
import * as Log4js  from 'log4js';

import { MergedChannel } from './merged_channel';

const ERROR_LOGGER  = Log4js.getLogger('error');
const ALL_LOGGER    = Log4js.getLogger('default');
const TRACE_LOGGER    = Log4js.getLogger('trace');

export class ChannelsController
{
    private mergedChannels : Map<string, MergedChannel>;

    constructor()
    {
        this.mergedChannels = new Map();
    }

    public async handlePlayerLeaveChannel(member: Discord.GuildMember)
    {
        let vChannel = member.voiceChannel;
        let mergedChannel = this.mergedChannels.get(vChannel.id);
        TRACE_LOGGER.info(`${member.displayName} left channel : ${vChannel.name} for merged : ${mergedChannel == null ? null : mergedChannel.textChannel.name }`);
        if (mergedChannel != null)
        {
            await mergedChannel.handlePlayerLeave(member);
        }
    }

    public async handlePlayerJoinChannel(member: Discord.GuildMember)
    {
        let vChannel = member.voiceChannel;
        let mergedChannel = this.mergedChannels.get(vChannel.id);
        TRACE_LOGGER.info(`${member.displayName} joined channel : ${vChannel.name} for merged : ${mergedChannel == null ? null : mergedChannel.textChannel.name }`);
        if (mergedChannel == null) 
        {
            mergedChannel = await this.createNewMergedChannel(vChannel);
        }
        await mergedChannel.handlePlayerJoin(member);
    }

    public async handlePlayerSwitchChannel(oldMember: Discord.GuildMember, newMember: Discord.GuildMember)
    {
        TRACE_LOGGER.info(`${oldMember.displayName} switched`);
        await this.handlePlayerLeaveChannel(oldMember);
        await this.handlePlayerJoinChannel(newMember);
    }

    private async createNewMergedChannel(voiceChannel: Discord.VoiceChannel)
    {
        TRACE_LOGGER.info(`Creating new merged channel for ${voiceChannel.name}`);
        let mergedChannel = new MergedChannel();

        mergedChannel.voiceChannel = voiceChannel;
        await mergedChannel.createAssociatedChannel();
        this.mergedChannels.set(voiceChannel.id, mergedChannel);
        
        return mergedChannel;
    }

    public async clearAllChannels()
    {
        ALL_LOGGER.info('Clearing merged channels...');
        for (let [key, channel] of this.mergedChannels)
        {
            await channel.deleteAssociatedChannel();
        }
        this.mergedChannels.clear();
    }

    public getDebugMessage() : string
    {
        let message : string = '';

        for (let [key, channel] of this.mergedChannels)
        {
            message += '- ' + channel.voiceChannel.name + '\n';
        }

        return message;
    }
}