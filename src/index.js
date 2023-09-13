require('dotenv').config();
const { Client, IntentsBitField, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildMessages, interaction, options, getString } = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
  ],
});

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'requestchannel') {
    const channelname = interaction.options.getString("channelname");
    const channelvisibility = interaction.options.getString("channelvisibility");
    const channelcategory = interaction.options.getString("channelcategory");
    const channel = client.channels.cache.get("1131157987285803048");
    const embed = new EmbedBuilder()
      .setTitle("The request has been sent for review!")
      .setColor("#ff6b35")
      .addFields({
        name: "Channel Name",
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
      });

    interaction.reply({ embeds: [embed] })
    const row = new ActionRowBuilder()
    const embed1 = new EmbedBuilder()
      .setTitle("Project Channel Request")
      .setDescription(
        String(String(interaction.member )) + "requested a project channel"
      )
      .setColor("#ff6b35")
      .addFields({
        name: "Channel Name",
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
      });
      

    channel.send({
      embeds: [embed1],
      components: [
        new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("approve_ID")
                .setLabel("Approve")
                .setEmoji("✔️")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId("deny_ID")
                .setLabel("Deny")
                .setEmoji("✖️")
                .setStyle(ButtonStyle.Danger)
        ) 
      ],
    });
  }
});

// Create a Map to store categories, channel names and visibility for each interaction
const categories = new Map();
const channelNames = new Map();
const channelVisibilityMap = new Map();
const channelTypeMap = new Map();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options, user } = interaction;
  if (commandName === 'requestchannel') {
    const category = options.getString("channelcategory");
    const channelName = options.getString("channelname");
    const channelVisibility = options.getString("channelvisibility");
    const channelType = options.getString("channeltype");
    categories.set(user.id, category); // Store the category in the Map
    channelNames.set(user.id, channelName); // Store the channel name in the Map
    channelVisibilityMap.set(user.id, channelVisibility); // Store the visibility in the Map
    channelTypeMap.set(user.id, channelType);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const user = interaction.user;
  if (interaction.customId === "approve_ID") {
    const embed1 = new EmbedBuilder()
      .setTitle("Request Approved")
      .setColor("#2ecc70")
      .setDescription("The channel has been created");
    await interaction.update({ embeds: [embed1] });
    let parentID;
    const category = categories.get(user.id); // Get the category from the Map
    if (category === "prjs") {
      parentID = "1137107855766462665"; // replace with the ID of the 'prjs' category
    } else if (category === "apps") {
      parentID = "1137107834178388071"; // replace with the ID of the 'other' category
    }
    const channelName = channelNames.get(user.id); // Get the channel name from the Map
    const isPrivate = channelVisibilityMap.get(user.id) === "private"; // Get the visibility from the Map
    
    if(channelName) { // Check if channelName is not undefined or empty
      const channelType = channelTypeMap.get(user.id); // Get the channel type from the Map
      let type;
      if (channelType === 'txt') {
        type = ChannelType.GuildText;
      } else if (channelType === 'forum') {
        type = ChannelType.GuildForum;
      }
      
      await interaction.guild.channels.create({
        name: channelName,
        type: type,
        parent: parentID,
        permissionOverwrites: isPrivate ? [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: '1138620674383024199',
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageRoles],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageRoles],
          }
        ] : [],
      });
    } else {
      console.log('Channel name is missing');
    }
    
  } else if (interaction.customId === "deny_ID") {
    const embed1 = new EmbedBuilder()
      .setTitle("Request Denied")
      .setColor("#e74c3c")
      .setDescription("The request has been denied");
    await interaction.update({ embeds: [embed1] });
    // Create an embed for the DM
    const dmEmbed = new EmbedBuilder()
      .setTitle("Request Denied")
      .setColor("#e74c3c")
      .setDescription("Your request has been denied.");
    // Send the embed to the user
    await user.send({ embeds: [dmEmbed] });
  }
});


client.on("guildMemberAdd", (c) => {
  const channel = client.channels.cache.get("1131157987285803048");
  channel.send(`Good day, ${c.user}! Welcome to the server; I hope you enjoy your stay! `)
})

client.login(process.env.TOKEN);