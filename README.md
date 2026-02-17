# Discord Moderation Bot

A simple yet powerful moderation bot for Discord built with [discord.js](https://discord.js.org/).

## Features

- **Moderation**:
  - `/kick`: Kick a user.
  - `/ban`: Ban a user.
  - `/unban`: Unban a user by ID.
  - `/timeout`: Mute a user for a specific duration.
  - `/clear`: Bulk delete messages.
- **Utility**:
  - `/userinfo`: Get information about a user.
  - `/serverinfo`: Get information about the server.
- **Music**:
  - `/play <query>`: Play a song or playlist from YouTube/Spotify.
  - `/pause` / `/resume`: Pause or resume playback.
  - `/skip`: Skip the current song.
  - `/stop`: Stop music and leave the channel.
  - `/queue`: View the current song queue.
  - `/nowplaying`: View the currently playing song.
  - `/playlist <create/load/delete/list>`: Manage custom playlists.

## Setup

1.  **Install Node.js**: Ensure you have Node.js installed (v16.9.0 or higher).
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *Note: This also installs `ffmpeg-static` and `@discordjs/voice` required for music.*
3.  **Configuration**:
    - Rename `.env` (or create it) and fill in your details:
      ```env
      DISCORD_TOKEN=your_bot_token
      CLIENT_ID=your_client_id
      GUILD_ID=your_guild_id
      ```
    - Update `config.json` if you want to change the bot's embed color.
4.  **Register Commands**:
    Run the following command to register slash commands with Discord:
    ```bash
    node deploy-commands.js
    ```
5.  **Run the Bot**:
    ```bash
    node index.js
    ```

## Permissions

Make sure the bot has the `applications.commands` scope and the necessary permissions (Kick Members, Ban Members, Manage Messages, Moderate Members) in your server.
