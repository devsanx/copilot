require('dotenv').config();
const { Client, IntentsBitField, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildMessages, interaction, options, getString } = require('discord.js');
const req = require('express/lib/request');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
    ],
});

const requestData = new Map();

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online.`);
});

client.on("interactionCreate", (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'requestchannel') {
        const channelname = interaction.options.getString("channelname");
        const channelvisibility = interaction.options.getString("channelvisibility");
        const channelcategory = interaction.options.getString("channelcategory");
        const channeltype = interaction.options.getString("channeltype");
        const channel = client.channels.cache.get("1124711101452521623");
        const embed = new EmbedBuilder()
            .setTitle("The request has been sent for review!")
            .setColor("#ff6b35")
            .addFields({
                name: "Name",
                value: channelname,
                inline: true,
            })
            .addFields({
                name: "Visibility",
                value: channelvisibility,
                inline: true,
            })
            .addFields({
                name: "Category",
                value: channelcategory,
                inline: true,
            })
            .addFields({
                name: "Type",
                value: channeltype,
                inline: true,
            });

        let requestId = Date.now();

        requestData.set(requestId, {
            user: interaction.user.id,
            name: channelname,
            visibility: channelvisibility,
            category: channelcategory,
            type: channeltype
        });

        interaction.reply({ embeds: [embed] })
        const row = new ActionRowBuilder()
        const embed1 = new EmbedBuilder()
            .setTitle("Project Channel Request")
            .setDescription(
                String(String(interaction.member)) + "requested a project channel"
            )
            .setColor("#ff6b35")
            .addFields({
                name: "Name",
                value: channelname,
                inline: true,
            })
            .addFields({
                name: "Visibility",
                value: channelvisibility,
                inline: true,
            })
            .addFields({
                name: "Category",
                value: channelcategory,
                inline: true,
            })
            .addFields({
                name: "Type",
                value: channeltype,
                inline: true,
            });


        channel.send({
            embeds: [embed1],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`approve_ID_${requestId}`)
                        .setLabel("Approve")
                        .setEmoji("✔️")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`deny_ID_${requestId}`)
                        .setLabel("Deny")
                        .setEmoji("✖️")
                        .setStyle(ButtonStyle.Danger)
                )
            ],
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith("approve_ID")) {
        const embed1 = new EmbedBuilder()
            .setTitle("Request Approved")
            .setColor("#2ecc70")
            .setDescription("The channel has been created");
        await interaction.update({ embeds: [embed1], components: [] });

        const requestId = interaction.customId.split('_')[2]; // Get request id from custom id
        const data = requestData.get(requestId); // Get request data from map

        let parentID;
        const category = data.category;
        if (category === "prjs") {
            parentID = "720358859939512370"; // replace with the ID of the 'prjs' category
        } else if (category === "apps") {
            parentID = "932070279042187294"; // replace with the ID of the 'other' category
        }

        const isPrivate = data.visibility === "private";

        const channelName = data.name;
        if (channelName) { // Check if channelName is not undefined or empty
            const channelType = data.type;
            let type;
            if (channelType === 'txt') {
                type = ChannelType.GuildText;
            } else if (channelType === 'forum') {
                type = ChannelType.GuildForum;
            }

            await interaction.guild.channels.create({
                name: channelName,
                type: type,
                parent: parentID
            });
        } else {
            console.log('Channel name is missing');
        }

    } else if (interaction.customId.startsWith("deny_ID")) {
        const requestId = interaction.customId.split('_')[2];
        const data = requestData.get(requestId);

        const embed1 = new EmbedBuilder()
            .setTitle("Request Denied")
            .setColor("#e74c3c")
            .setDescription("The request has been denied");
        await interaction.update({ embeds: [embed1], components: [] });
        // Create an embed for the DM
        const dmEmbed = new EmbedBuilder()
            .setTitle("Request Denied")
            .setColor("#e74c3c")
            .setDescription("Your request has been denied.");
        // Send the embed to the user
        await interaction.guild.members.fetch(data.user).then(u => {
            u.send({ embeds: [dmEmbed] });
        })
    }
});


client.login(process.env.TOKEN);