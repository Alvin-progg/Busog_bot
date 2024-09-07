require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(process.env.PORT || 3000, () => console.log('HTTP server is running'));

// Replace with your bot token and server details
const DISCORD_TOKEN = process.env.Token; // Add your bot token in .env file
const MINECRAFT_SERVER = 'double-organizing.joinmc.link'; // Replace with your Minecraft server address
const MINECRAFT_PORT = 25565; // Default Minecraft port
const CHANNEL_NAME = 'server-status'; // Name of the channel to send updates

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Find the channel by name once the bot is ready
  const channel = client.channels.cache.find(
    (ch) => ch.name === CHANNEL_NAME && ch.isTextBased()
  );

  // If the channel is found, send the initial embed message
  if (channel) {
    // Create the initial embed message
    let statusMessage;
    try {
      const response = await status(MINECRAFT_SERVER, MINECRAFT_PORT);

      // Create an initial embed with placeholder data
      const embed = new EmbedBuilder()
        .setColor(0x57f287) // Set color (green) for success
        .setTitle('Minecraft Server Status')
        .setDescription(`**Busog Server is online!**`)
        .addFields(
          { name: 'Players Online', value: `${response.players.online} / ${response.players.max}`, inline: true },
          { name: 'Version', value: response.version.name, inline: true }
        )
        .setTimestamp() // Adds the current timestamp
        .setFooter({ text: 'Server Status Update' });

      // Send the initial message and store it in a variable for later editing
      statusMessage = await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // Set color (red) for error
        .setTitle('Minecraft Server Status')
        .setDescription('The Busog server is offline or the address is incorrect.')
        .setTimestamp()
        .setFooter({ text: 'Server Status Update' });

      // Send the initial error message and store it
      statusMessage = await channel.send({ embeds: [errorEmbed] });
    }

    // Set up an interval to check the server status and update the embed
    setInterval(async () => {
      try {
        const response = await status(MINECRAFT_SERVER, MINECRAFT_PORT);

        // Update the embed with the new data
        const updatedEmbed = new EmbedBuilder()
          .setColor(0x57f287) 
          .setTitle('Minecraft Server Status')
          .setDescription(`**Busog Server is online!**`)
          .addFields(
            { name: 'Players Online', value: `${response.players.online} / ${response.players.max}`, inline: true },
            { name: 'Version', value: response.version.name, inline: true }
          )
          .setTimestamp() 
          .setFooter({ text: 'Server Status Update' });

        
        await statusMessage.edit({ embeds: [updatedEmbed] });
      } catch (error) {
        console.error(error);

        
        const errorEmbed = new EmbedBuilder()
          .setColor(0xed4245) 
          .setTitle('Minecraft Server Status')
          .setDescription('The Busog server is offline or the address is incorrect.')
          .setTimestamp()
          .setFooter({ text: 'Server Status Update' });

       
        await statusMessage.edit({ embeds: [errorEmbed] });
      }
    }, 5000); 
  } else {
    console.error(`Channel "${CHANNEL_NAME}" not found!`);
  }
});

client.login(DISCORD_TOKEN);
