import * as Discord     from 'discord.js';
import * as Log4js      from 'log4js';
import { TextChannel }  from 'discord.js';

const ERROR_LOGGER = Log4js.getLogger('error');
const OUT_LOGGER    = Log4js.getLogger('out');

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
            try
            {
                OUT_LOGGER.info(`Creating text channel for ${this.voiceChannel.name}`);
                this.textChannel = (await guild.createChannel(`TEXT-${this.voiceChannel.name.replace(/'/g, '-')}`, 'text',
                [
                    {
                        id: guild.id, //everyone role
                        deny: 
                            Discord.Permissions.ALL
                    }
                ])) as TextChannel;
                OUT_LOGGER.info(`Setting category for text channel ${this.textChannel.name}`);
               await this.textChannel.setParent(this.voiceChannel.parent);
            }
            catch (e)
            {
                ERROR_LOGGER.error('An error occured while creating associated channel');
                ERROR_LOGGER.error(e);
            }
        }
    }

    public async handlePlayerJoin(member: Discord.GuildMember)
    {
        if (this.textChannel != null)
        {
            try
            {
                OUT_LOGGER.info(`Adding permissions for channel [${this.textChannel.name}] to ${member.displayName}`)
                await this.textChannel.overwritePermissions(member, CHANNEL_PERMISSIONS_IN, 'BUMJU');
            }
            catch (e)
            {
                ERROR_LOGGER.error('An error occured while handling player join');
                ERROR_LOGGER.error(e);
            }
        }
    }

    public async handlePlayerLeave(member: Discord.GuildMember) {
        if (this.textChannel != null)
        {
            try
            {
                OUT_LOGGER.info(`Removing permissions for channel [${this.textChannel.name}] from ${member.displayName}`)
                let permissions = this.textChannel.permissionOverwrites.get(member.id);
                if (permissions != null)
                {
                    await permissions.delete();
                }
            }
            catch (exception)
            {
                ERROR_LOGGER.error('An error occured while handling player leave');
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
                OUT_LOGGER.info(`Deleting text channel : ${this.textChannel.name}`);
                await this.textChannel.delete();
            }
            catch (exception)
            {
                ERROR_LOGGER.error('An error occured while deleting associated channel');
                ERROR_LOGGER.error(exception);
            }
        }
    }
}