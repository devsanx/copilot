require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

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
        name: "channelcategory",
        description:
          "Choose the category in which your channel will get created",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "Apps Category",
            value: "apps",
          },
          {
            name: "Projects Category",
            value: "prjs",
          },
        ],
        required: true,
      },
      {
        name: "channeltype",
        description:
          "Choose the type of your channel",
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
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

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