import * as Discord from 'discord.js';
import * as Log4js  from 'log4js';

import { MergedChannel } from './merged_channel';

const ERROR_LOGGER  = Log4js.getLogger('error');
const ALL_LOGGER    = Log4js.getLogger('default');
const OUT_LOGGER    = Log4js.getLogger('out');

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
        if (mergedChannel != null)
        {
            await mergedChannel.handlePlayerLeave(member);
        }
    }

    public async handlePlayerJoinChannel(member: Discord.GuildMember)
    {
        let vChannel = member.voiceChannel;
        let mergedChannel = this.mergedChannels.get(vChannel.id);
        if (mergedChannel == null) 
        {
            mergedChannel = await this.createNewMergedChannel(vChannel);
        }
        await mergedChannel.handlePlayerJoin(member);
    }

    public async handlePlayerSwitchChannel(oldMember: Discord.GuildMember, newMember: Discord.GuildMember)
    {
        await this.handlePlayerLeaveChannel(oldMember);
        await this.handlePlayerJoinChannel(newMember);
    }

    private async createNewMergedChannel(voiceChannel: Discord.VoiceChannel)
    {
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
}