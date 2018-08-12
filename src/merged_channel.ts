import * as Discord     from 'discord.js';
import * as Log4js      from 'log4js';
import { TextChannel }  from 'discord.js';

const ERROR_LOGGER = Log4js.getLogger('error');

const CHANNEL_PERMISSIONS_IN =
{
    READ_MESSAGE_HISTORY: false,

    READ_MESSAGES: true,
    SEND_MESSAGES: true,
    ADD_REACTIONS: true,
    ATTACH_FILES: true,
    SEND_TTS_MESSAGES: true,
    USE_EXTERNAL_EMOJIS: true
};

export class MergedChannel
{
    public voiceChannel:    Discord.VoiceChannel;
    public textChannel:     Discord.TextChannel;

    public async createAssociatedChannel()
    {
        const guild = this.voiceChannel.guild;
        if (this.voiceChannel != null)
        {
            this.textChannel = (await guild.createChannel(`TEXT-${this.voiceChannel.name.replace(/'/g, '-')}`, 'text',
            [
                {
                    id: guild.id, //everyone role
                    deny: 
                        Discord.Permissions.ALL
                }
            ])) as TextChannel;
           await this.textChannel.setParent(this.voiceChannel.parent);
        }
    }

    public async handlePlayerJoin(member: Discord.GuildMember)
    {
        if (this.textChannel != null)
        {
            await this.textChannel.overwritePermissions(member, CHANNEL_PERMISSIONS_IN, 'BUMJU');
        }
    }

    public async handlePlayerLeave(member: Discord.GuildMember) {
        if (this.textChannel != null)
        {
            try
            {
                let permissions = this.textChannel.permissionOverwrites.get(member.id);
                if (permissions != null)
                {
                    await permissions.delete();
                }
            }
            catch (exception)
            {
                ERROR_LOGGER.error(exception);
            }
        }
    }

    public async deleteAssociatedChannel()
    {
        if (this.textChannel != null)
        {
            try
            {
                await this.textChannel.delete();
            }
            catch (exception)
            {
                ERROR_LOGGER.error(exception);
            }
        }
    }
}