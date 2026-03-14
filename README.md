# Discord Moderation Bot

A feature-rich Discord bot built with **Node.js**, **discord.js**, and **discord-player** that supports **moderation**, **utility commands**, and **music playback** with playlist support.

---

## Features

### Moderation
- `/kick` — Kick a user from the server
- `/ban` — Ban a user
- `/unban` — Unban a user by ID
- `/timeout` — Timeout a user for a specific duration
- `/clear` — Bulk delete messages

### Utility
- `/userinfo` — Display information about a user
- `/serverinfo` — Display information about the server

### Music
- `/play <query>` — Play a song or playlist
- `/pause` — Pause the current song
- `/resume` — Resume playback
- `/skip` — Skip the current song
- `/stop` — Stop playback and clear the queue
- `/queue` — View the current queue
- `/nowplaying` — Show the currently playing track
- `/playlist create/load/delete/list` — Manage custom playlists

---

## Architecture Diagram

```mermaid
flowchart TD
    A[Discord User] --> B[Discord Server]
    B --> C[index.js Bot Client]

    C --> D[Command Loader]
    D --> E[Moderation Commands]
    D --> F[Music Commands]
    D --> G[Utility Commands]

    F --> H[discord-player]
    H --> I[utils/stream-loader.js]
    I --> J[yt-dlp]
    I --> K[YouTube / Search Source]

    F --> L[playlists.json]

    C --> M[.env Configuration]
    C --> N[config.json]
    O[deploy-commands.js] --> P[Discord Slash Command Registration]


    ---Tech Stack👇---

💠 Node.js

💠 discord.js

💠 discord-player

💠 @discord-player/extractor

💠 discord-player-youtubei

💠 yt-dlp-wrap

💠 ffmpeg-static

💠 dotenv

---Project Structure✨---

.
├── commands
│   ├── moderation
│   │   ├── ban.js
│   │   ├── clear.js
│   │   ├── kick.js
│   │   ├── timeout.js
│   │   └── unban.js
│   ├── music
│   │   ├── nowplaying.js
│   │   ├── pause.js
│   │   ├── play.js
│   │   ├── playlist.js
│   │   ├── queue.js
│   │   ├── resume.js
│   │   ├── skip.js
│   │   └── stop.js
│   └── utility
│       ├── serverinfo.js
│       └── userinfo.js
├── utils
│   └── stream-loader.js
├── config.json
├── deploy-commands.js
├── index.js
├── playlists.json
├── package.json
└── README.md

---How It Works---

1. Bot Startup

   The bot starts from index.js, creates the Discord client, initializes the player, loads extractors, and registers all commands    from the commands/ folder.

2. Slash Command Handling

   When a user runs a slash command, the bot listens for the interaction and routes it to the correct command file.

3. Music Playback

   Music commands use discord-player for queue management.
   A custom stream-loader.js hook uses yt-dlp to create audio streams for playback.

4. Playlist Storage

   Custom playlists are saved in playlists.json, allowing users to create and reload saved queues.

  ---Installation👇---

1. Clone the Repository

    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name

2. Install Dependencies

    npm install

3. Configure Environment Variables

    DISCORD_TOKEN=your_bot_token
    CLIENT_ID=your_client_id
    GUILD_ID=your_guild_id
    AUTO_JOIN_CHANNEL_ID=optional_voice_channel_id

4. Update config.json

    {
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "botColor": "#0099ff"
  }

5. Register Slash Commands

    node deploy-commands.js

6. Start the Bot

    node index.js

---Notes---

💠 Music playback depends on external sources and extractors, so availability may vary over time.

💠 playlists.json is used for simple local storage and is suitable for small to medium projects.

💠 The bot automatically downloads yt-dlp if it is not already present.

---Author---

[---Made by Midhun M---

Linkedin🎊

(www.linkedin.com/in/midhun-m-09578a38a)]

If you like this project, consider starring the repository.

A few quick improvements before you upload it:

- replace `your-username/your-repo-name.git`
- add 1 or 2 screenshots
- keep `.env` out of Git
- add a `.gitignore` if you do not already have one

I can also make this even better with badges and a more attractive top section for GitHub.