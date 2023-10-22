require("dotenv").config();
const fs = require("fs");
const ms = require("ms")
const { Client, IntentsBitField, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events } = require("discord.js");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildModeration,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

// --------------- Project Channel Request System --------------- //
let requestData = new Map();
let requestUser = new Map();

client.on(Events.InteractionCreate, (interaction) => {
  if (interaction.commandName === "requestchannel") {
    let intAuthor = interaction.member.id;
    console.log(intAuthor);
    requestUser.set("IntMember", intAuthor);
  }
});
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "requestchannel") {
    const channelname = interaction.options.getString("channelname");
    const channelvisibility = interaction.options.getString("channelvisibility");
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
        name: "Type",
        value: channeltype,
        inline: true,
      });

    interaction.options.data.forEach((option) => {
      requestData.set(option.name, option.value);
    });

    interaction.reply({ embeds: [embed] });
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
        name: "Type",
        value: channeltype,
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
        ),
      ],
    });
  }
});
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId.startsWith("approve_ID")) {
    const embed1 = new EmbedBuilder()
      .setTitle("Request Approved")
      .setColor("#2ecc70")
      .setDescription("The channel has been created");
    await interaction.update({ embeds: [embed1], components: [] });

    const channelName = requestData.get("channelname");
    const channelVis = requestData.get("channelvisibility");

    let parentID = "720358859939512370";
    let requester = requestUser.get("IntMember");
    if (channelName) {
      const channelType = requestData.get("channeltype");
      let type;
      if (channelType === "txt") {
        type = ChannelType.GuildText;
      } else if (channelType === "forum") {
        type = ChannelType.GuildForum;
      }

      if (channelVis === "private") {
        await interaction.guild.channels.create({
          name: channelName,
          type: type,
          parent: parentID,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: requester,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageRoles,
              ],
            },
            {
              id: process.env.ADMINROLE_ID,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageRoles,
              ],
            },
          ],
        });
      } else if (channelVis === "public") {
        await interaction.guild.channels.create({
          name: channelName,
          type: type,
          parent: parentID,
          permissionOverwrites: [
            {
              id: requester,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageRoles,
              ],
            },
            {
              id: process.env.ADMINROLE_ID,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageRoles,
              ],
            },
          ],
        });
      }
    } else {
      console.log("Channel name is missing");
    }
  } else if (interaction.customId.startsWith("deny_ID")) {
    const embed1 = new EmbedBuilder()
      .setTitle("Request Denied")
      .setColor("#e74c3c")
      .setDescription("The request has been denied");
    await interaction.update({ embeds: [embed1], components: [] });

    const dmEmbed = new EmbedBuilder()
      .setTitle("Request Denied")
      .setColor("#e74c3c")
      .setDescription("Your request has been denied.");

    let user = interaction.user;
    await user.send({ embeds: [dmEmbed] });
  }
});

// ----------------------- Counting System --------------------- //
let count;
let lastUserId;
try {
  const data = JSON.parse(fs.readFileSync("data.json"));
  count = data.count;
  lastUserId = data.lastUserId;
} catch {
  count = 0;
  lastUserId = null;
}
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === "754969003176362025") {
    if (isNaN(parseInt(message.content.charAt(0)))) return;
    if (parseInt(message.content) !== count + 1) {
      await message.react("❌");
      await message.channel.send(
        `<@${lastUserId}> **Wrong number!** The next number is ${count + 1}`
      );
      return;
    } else if (message.author.id === lastUserId) {
      await message.react("❌");
      await message.channel.send(
        `<@${lastUserId}> **Don't count twice in a row!** The next number is ${count + 1}`
      );
      return;
    }

    count++;
    lastUserId = message.author.id;
    fs.writeFileSync("data.json", JSON.stringify({ count, lastUserId }));
    message.react("✔️");
  }
});

// ----------------------- Server Logs --------------------- //
client.on(Events.GuildMemberRemove, async (member) => {
  const logsChannel = client.channels.cache.get("755348714935287879")
  const userLeave = await client.users.fetch(member.user.id);
  const date = new Date();
  const embedLeave = new EmbedBuilder()
    .setAuthor({ name: userLeave.tag, iconURL: userLeave.avatarURL() })
    .setDescription(`${userLeave} has left the server`)
    .setThumbnail( userLeave.avatarURL() )
    .setFooter({text: `User ID: ${userLeave.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`})
    .setColor("#da373c");
  logsChannel.send({ embeds: [embedLeave] });
})

client.on(Events.GuildMemberAdd, async (member) => {
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userJoin = await client.users.fetch(member.user.id);
  const date = new Date();

  // Calculate the time difference in milliseconds
  const diff = Date.now() - member.user.createdAt;

  // Convert the time difference to seconds, minutes, hours, days, months, and years
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  // Calculate the remaining seconds, minutes, hours, days and months after subtracting the years and months
  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;
  const remainingHours = hours % 24;
  const remainingDays = days % 30;
  const remainingMonths = months % 12;

  // Create the age string
  const age = [
    years > 0 ? `${years} years` : "",
    remainingMonths > 0 ? `${remainingMonths} months` : "",
    remainingDays > 0 ? `${remainingDays} days` : "",
    remainingHours > 0 ? `${remainingHours} hours` : "",
    remainingMinutes > 0 ? `${remainingMinutes} minutes` : "",
    remainingSeconds > 0 ? `${remainingSeconds} seconds` : "",
  ].join(", ");

  const embedJoin = new EmbedBuilder()
    .setAuthor({ name: userJoin.tag, iconURL: userJoin.avatarURL() })
    .setDescription(`${userJoin} has joined the server`)
    .setThumbnail( userJoin.avatarURL() )
    .addFields({ name: "Account Age", value: age, })
    .setFooter({text: `User ID: ${userJoin.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#2ea65a");
  logsChannel.send({ embeds: [embedJoin] });
});

client.on(Events.GuildBanAdd, async (member) => { 
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userBan = await client.users.fetch(member.user.id)
  const date = new Date();
  const embedBan = new EmbedBuilder()
    .setAuthor({ name: `${userBan.tag}`, iconURL: userBan.avatarURL() })
    .setDescription(`${userBan} **was banned**`)
    .setFooter({text: `User ID: ${userBan.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#5865f2");
  logsChannel.send({ embeds: [embedBan] })
});

client.on(Events.GuildBanRemove, async (member) => { 
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userUnBan = await client.users.fetch(member.user.id);
  const date = new Date();
  const embedUnBan = new EmbedBuilder()
    .setAuthor({ name: `${userUnBan.tag}`, iconURL: userUnBan.avatarURL() })
    .setDescription(`${userUnBan} **was unbanned**`)
    .setFooter({text: `User ID: ${userUnBan.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#5865f2");
  logsChannel.send({ embeds: [embedUnBan] })
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userUpdate = await client.users.fetch(newMember.user.id);
  const date = new Date();

  const oldRoles = oldMember.roles.cache.map(role => role.name);
  const newRoles = newMember.roles.cache.map(role => role.name);

  const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
  const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

  const embedUpRoles = new EmbedBuilder()
    .setAuthor({ name: `${userUpdate.tag}`, iconURL: userUpdate.avatarURL() })
    .setDescription(`${userUpdate}'s roles **were updated**`)
    .setFooter({text: `User ID: ${userUpdate.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#5865f2");
    if (addedRoles.length > 0) {
      embedUpRoles.addFields({
        name: "Added roles",
        value: `${addedRoles.join(', ')}`
      });
    }
    
    if (removedRoles.length > 0) {
      embedUpRoles.addFields({
        name: "Removed roles",
        value: `${removedRoles.join(', ')}`
      });
    }
  logsChannel.send({ embeds: [embedUpRoles] })
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => { 
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userEdit = oldMessage.author;
  const date = new Date();
  const messageLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;
  const messageChannel = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}`;
  if (oldMessage.partial) await oldMessage.fetch();
  if (newMessage.partial) await newMessage.fetch();
  const embedMsgEdit = new EmbedBuilder()
    .setAuthor({ name: userEdit.tag, iconURL: userEdit.displayAvatarURL() })
    .setDescription(`**Message edited** in ${messageChannel} [Jump to message](${messageLink})`)
    .addFields({ name: "Before", value: oldMessage.content || '(no content)', })
    .addFields({ name: "After", value: newMessage.content || '(no content)', })
    .setFooter({text: `User ID: ${userEdit.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#5865f2");
  logsChannel.send({ embeds: [embedMsgEdit] });
});

client.on(Events.MessageDelete, async (messageDelete) => { 
  const logsChannel = client.channels.cache.get("755348714935287879");
  const userDel = await client.users.fetch(messageDelete.author.id);
  const msgDelID = messageDelete.id
  const date = new Date();
  const messageChannel = `https://discord.com/channels/${messageDelete.guild.id}/${messageDelete.channel.id}`;
  const embedMsgDelete = new EmbedBuilder()
    .setAuthor({name: userDel.tag, iconURL: userDel.avatarURL(),})
    .setDescription(`**Message sent by ${userDel} deleted in ${messageChannel}**`)
    .addFields({name: "Deleted Message", value: `${messageDelete.content}`})
    .setFooter({text: `User ID: ${userDel.id} | Msg ID: ${msgDelID} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#da373c");
  logsChannel.send({ embeds: [embedMsgDelete] });
});

client.on(Events.ChannelCreate, async (channel) => {
  const logsChannel = client.channels.cache.get("755348714935287879");
  const date = new Date();
  const chnlLink = `https://discord.com/channels/${channel.guild.id}/${channel.id}`;
  const embedChnlCreate = new EmbedBuilder()
    .setAuthor({ name: `${channel.guild.name}`, iconURL: channel.guild.iconURL() })
    .setDescription(`${chnlLink} channel **was created**`)
    .addFields({
      name: "Name",
      value: `${channel.name}`
    })
    .setFooter({text: `Channel ID: ${channel.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#2ea65a");
  logsChannel.send({ embeds: [embedChnlCreate] })
})

client.on(Events.ChannelDelete, async (channel) => {
  const logsChannel = client.channels.cache.get("755348714935287879");
  const date = new Date();
  const embedChnlDelete = new EmbedBuilder()
    .setAuthor({ name: `${channel.guild.name}`, iconURL: channel.guild.iconURL() })
    .setDescription(`A channel **was deleted**`)
    .addFields({
      name: "Name",
      value: `${channel.name}`
    })
    .setFooter({text: `Channel ID: ${channel.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`,})
    .setColor("#da373c");
  logsChannel.send({ embeds: [embedChnlDelete] })
})

// ----------------------- Autorole --------------------- //
client.on("guildMemberAdd", (member) => {
  const role = member.guild.roles.cache.get("720365286217482410");
  member.roles.add(role).catch(console.error);
});

// ----------------------- Utility Commands --------------------- //
//Utility commands: Ban, Softban, Kick, Timeout, Purge, Whois, 
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "ban") {
    const banUser = interaction.guild.members.resolve(interaction.options.getUser("user"));
    const banReason = interaction.options.getString("reason") || "No reason provided";
    const roleIDs = ['911879842906144778', '963126197921910795'];

    if (roleIDs.some(roleID => interaction.member.roles.cache.has(roleID)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await banUser.ban(banReason)
      interaction.reply({
        content: `The user has been banned successfully`,
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "softban") {
    const fetchedMessages = await interaction.channel.messages.fetch();
    const softBanUser = interaction.guild.members.resolve(interaction.options.getUser("user"));
    const softBanReason = interaction.options.getString("reason") || "No reason provided";
    const softBanUserMsgs = fetchedMessages.filter(message => message.author.id === softBanUser.id);
    const roleIDs = ['911879842906144778', '963126197921910795'];

    if (roleIDs.some(roleID => interaction.member.roles.cache.has(roleID)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await softBanUser.kick(softBanReason)
      await interaction.channel.bulkDelete(softBanUserMsgs)
      interaction.reply({
        content: `The user has been soft-banned successfully`,
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "kick") {
    const kickUser = interaction.guild.members.resolve(interaction.options.getUser("user"));
    const kickReason = interaction.options.getString("reason") || "No reason provided";
    const roleIDs = ['911879842906144778', '963126197921910795'];

    if (roleIDs.some(roleID => interaction.member.roles.cache.has(roleID)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await kickUser.kick(kickReason)
      interaction.reply({
        content: `The user has been kicked successfully`,
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "timeout") {
    const timeoutUser = interaction.guild.members.resolve(interaction.options.getUser("user"));
    const timeoutReason = interaction.options.getString("reason") || "No reason provided";
    const timeoutDuration = interaction.options.getString("duration");
    const msTimeout = ms(timeoutDuration); // Convert duration from minutes to milliseconds
    const roleIDs = ['911879842906144778', '963126197921910795'];

    // Check if the member has one of the roles or is an administrator
    if (roleIDs.some(roleID => interaction.member.roles.cache.has(roleID)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await timeoutUser.timeout(msTimeout, timeoutReason)
      interaction.reply({
        content: `The user has been timed out for ${interaction.options.getString("duration")} minutes.`,
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }
    if (isNaN(msTimeout)) {
      console.log(msTimeout)
      interaction.reply({
        content: 'Please provide a valid number for the duration',
        ephemeral: true,
      });
      return;
    }

  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "purge") {
    const purgeAmount = interaction.options.getNumber("amount");
    const fetchedMessages = await interaction.channel.messages.fetch({ limit: purgeAmount });
    const roleIDs = ['911879842906144778', '963126197921910795'];

    if (roleIDs.some(roleID => interaction.member.roles.cache.has(roleID)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      if (!purgeAmount || purgeAmount < 1 || purgeAmount > 100) {
        interaction.reply({
          content: "You need to input a number between 1 and 100",
          ephemeral: true,
        });
        return;
      }
      interaction.channel.bulkDelete(fetchedMessages)
  
      interaction.reply({
        content: "The messages have been purged successfully",
        ephemeral: true,
      })
    } else {
      interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName === "whois") {
    const whoisUser = interaction.guild.members.resolve(interaction.options.getUser("user"));
    const date = new Date();
    const roles = whoisUser.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ');
    const roleCount = whoisUser.roles.cache.size - 1;
    const embedWhois = new EmbedBuilder()
      .setAuthor({ name: whoisUser.user.tag, iconURL: whoisUser.user.avatarURL() })
      .setDescription(`${whoisUser}`)
      .addFields({
        name: "Joined At",
        value: `${whoisUser.joinedAt.toLocaleDateString()} at ${whoisUser.joinedAt.toLocaleTimeString([], {hour12: true,})}`,
        inline: true,
      })
      .addFields({
        name: "Created At",
        value: `${whoisUser.user.createdAt.toLocaleDateString()} at ${whoisUser.user.createdAt.toLocaleTimeString([], {hour12: true,})}`,
        inline: true,
      })
      .addFields({
        name: `Roles (${roleCount})`,
        value: roles,
        inline: false,
      })
      .setThumbnail( whoisUser.avatarURL() )
      .setFooter({text: `User ID: ${whoisUser.id} | Today at ${date.toLocaleTimeString([], {hour12: true,})}`})
      .setColor("#5865f2");

    await interaction.reply({embeds: [embedWhois]})
  }
})

// ----------------------- Login using Token --------------------- //
client.login(process.env.TOKEN);