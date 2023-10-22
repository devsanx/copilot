require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "requestchannel",
    description: "Request a project channel",
    options: [
      {
        name: "channelname",
        description: "Enter the name of your project channel",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "channelvisibility",
        description:
          "Choose whether you want your channel to be private or public",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "Public",
            value: "public",
          },
          {
            name: "Private",
            value: "private",
          },
        ],
        required: true,
      },
      {
        name: "channeltype",
        description: "Choose the type of your channel",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "Text Channel",
            value: "txt",
          },
          {
            name: "Forum Channel",
            value: "forum",
          },
        ],
        required: true,
      },
    ],
  },
  {
    name: "ban",
    description: "Ban a user",
    options: [
      {
        name: "user",
        description: "Choose a user to ban",
        type: ApplicationCommandOptionType.User,
        required: true
      },
      {
        name: "reason",
        description: "Enter the reason of banning the user",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: "softban",
    description: "Kicks the user and deletes all message sent by the user",
    options: [
      {
        name: "user",
        description: "Choose a user to softban",
        type: ApplicationCommandOptionType.User,
        required: true
      },
      {
        name: "reason",
        description: "Enter the reason of banning the user",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: "kick",
    description: "Kick a user",
    options: [
      {
        name: "user",
        description: "Choose a user to kick",
        type: ApplicationCommandOptionType.User,
        required: true
      },
      {
        name: "reason",
        description: "Enter the reason of kicking the user",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: "timeout",
    description: "Timeout a user",
    options: [
      {
        name: "user",
        description: "Choose a user to timeout",
        type: ApplicationCommandOptionType.User,
        required: true
      },
      {
        name: "duration",
        description: "Choose the duration of the timeout",
        type: ApplicationCommandOptionType.String,
        required: true
      },
      {
        name: "reason",
        description: "Enter the reason of timing out the user",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: "purge",
    description: "Deletes a specified amount of messages",
    options: [
      {
        name: "amount",
        description: "Enter the amount of messages you want to delete",
        type: ApplicationCommandOptionType.Number,
        required: true
      }
    ]
  },
  {
    name: "whois",
    description: "Displays info about a specified user",
    options: [
      {
        name: "user",
        description: "Choose a user to display info about",
        type: ApplicationCommandOptionType.User,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
