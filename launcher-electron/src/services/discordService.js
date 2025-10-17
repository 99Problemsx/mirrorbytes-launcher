/**
 * Discord Rich Presence Service
 * Zeigt deine Mirrorbytes-Aktivität in Discord
 */

const DiscordRPC = require('discord-rpc');

class DiscordService {
  constructor() {
    this.client = null;
    // TODO: Erstelle eine Discord Application auf https://discord.com/developers/applications
    // und ersetze diese ID mit deiner echten Application ID
    this.clientId = process.env.DISCORD_CLIENT_ID || '1234567890123456789';
    this.isConnected = false;
    this.currentActivity = null;
    this.startTimestamp = null;
    this.enabled = process.env.DISCORD_CLIENT_ID ? true : false;
  }

  /**
   * Initialisiere Discord RPC
   */
  async initialize() {
    try {
      if (!this.enabled) {
        console.log('⚠️  Discord Rich Presence disabled - set DISCORD_CLIENT_ID environment variable');
        return false;
      }

      if (this.isConnected) {
        console.log('Discord RPC already connected');
        return true;
      }

      this.client = new DiscordRPC.Client({ transport: 'ipc' });
      
      this.client.on('ready', () => {
        console.log('✅ Discord Rich Presence connected!');
        console.log('Logged in as:', this.client.user.username);
        this.isConnected = true;
        this.startTimestamp = Date.now();
        this.setLauncherActivity();
      });

      this.client.on('disconnected', () => {
        console.log('❌ Discord Rich Presence disconnected');
        this.isConnected = false;
      });

      await this.client.login({ clientId: this.clientId });
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord RPC:', error);
      return false;
    }
  }

  /**
   * Setze Activity wenn Launcher offen ist
   */
  setLauncherActivity(selectedGame = null) {
    if (!this.isConnected) return;

    const state = selectedGame 
      ? `Schaut sich ${selectedGame.name} an`
      : 'Bereit zum Spielen';

    this.currentActivity = {
      details: 'Im Mirrorbytes Studio',
      state: state,
      startTimestamp: this.startTimestamp,
      largeImageKey: 'mirrorbytes_logo',
      largeImageText: 'Mirrorbytes Studio',
      smallImageKey: selectedGame ? this.getGameIcon(selectedGame.id) : 'launcher_icon',
      smallImageText: selectedGame ? selectedGame.name : 'Launcher',
      instance: false,
    };

    this.updateActivity();
  }

  /**
   * Gibt das passende Icon für ein Spiel zurück
   */
  getGameIcon(gameId) {
    const icons = {
      'illusion': 'illusion_icon',
      'zorua': 'zorua_icon'
    };
    return icons[gameId] || 'game_icon';
  }

  /**
   * Setze Activity wenn Game läuft
   */
  setGameActivity(gameInfo = {}, selectedGame = {}) {
    if (!this.isConnected) return;

    const {
      location = 'Unterwegs',
      map = null,
      playtime = '0h 0m',
      badges = 0,
      partySize = 0,
      partyMax = 6,
      playerName = null
    } = gameInfo;

    const gameName = selectedGame.name || 'Pokémon Game';
    const gameId = selectedGame.id || 'game';
    const repoUrl = `https://github.com/99Problemsx/${selectedGame.repo}`;

    // Formatiere die Location-Anzeige
    let stateText = location;
    if (map) {
      stateText = `${location} - ${map}`;
    }
    if (badges > 0) {
      stateText += ` • ${badges} Orden`;
    }
    if (playerName) {
      stateText = `${playerName} in ${stateText}`;
    }

    this.currentActivity = {
      details: `Spielt ${gameName}`,
      state: stateText,
      startTimestamp: this.startTimestamp,
      largeImageKey: this.getGameIcon(gameId),
      largeImageText: gameName,
      smallImageKey: map ? `map_${map.toLowerCase().replace(/\s+/g, '_')}` : 'playing_icon',
      smallImageText: map || `${playtime} gespielt`,
      instance: false,
      buttons: [
        {
          label: '🎮 Game Info',
          url: repoUrl
        },
        {
          label: '💬 Discord Server',
          url: 'https://discord.gg/your-server' // TODO: Discord Link
        }
      ]
    };

    // Optional: Party Info wenn multiplayer
    if (partySize > 0) {
      this.currentActivity.partySize = partySize;
      this.currentActivity.partyMax = partyMax;
    }

    this.updateActivity();
  }

  /**
   * Setze Activity für spezifische Szenarien
   */
  setCustomActivity(type, data = {}) {
    if (!this.isConnected) return;

    const gameId = data.gameId || 'game';
    const gameName = data.gameName || 'Pokémon Game';

    switch (type) {
      case 'battle':
        this.currentActivity = {
          details: `${gameName} - Im Kampf`,
          state: data.opponent ? `vs ${data.opponent}` : 'Trainer Kampf',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: data.pokemon || 'pokeball',
          smallImageText: data.pokemonName || 'Im Kampf',
        };
        if (data.location) {
          this.currentActivity.state += ` • ${data.location}`;
        }
        break;

      case 'training':
        this.currentActivity = {
          details: `${gameName} - Training`,
          state: data.location || 'Trainiert Pokémon',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'training_icon',
          smallImageText: 'Training',
        };
        break;

      case 'trading':
        this.currentActivity = {
          details: `${gameName} - Tauscht`,
          state: data.partner || 'Mit Freund',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'trade_icon',
          smallImageText: 'Pokémon Tausch',
        };
        break;

      case 'exploring':
        const exploreState = data.map 
          ? `${data.location || 'Erkundet'} - ${data.map}`
          : data.location || 'Neue Orte';
        
        this.currentActivity = {
          details: `${gameName} - Erkundet`,
          state: exploreState,
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: data.map ? `map_${data.map.toLowerCase().replace(/\s+/g, '_')}` : 'explore_icon',
          smallImageText: data.map || 'Exploration',
        };
        break;

      case 'menu':
        this.currentActivity = {
          details: `${gameName} - Im Menü`,
          state: data.section || 'Schaut sich um',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'menu_icon',
          smallImageText: 'Menü',
        };
        break;

      case 'gym':
        this.currentActivity = {
          details: `${gameName} - Arena Kampf`,
          state: data.gymLeader ? `vs ${data.gymLeader}` : 'Arena Herausforderung',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'gym_icon',
          smallImageText: data.city || 'Arena',
        };
        if (data.badges) {
          this.currentActivity.state += ` • ${data.badges} Orden`;
        }
        break;

      case 'catching':
        this.currentActivity = {
          details: `${gameName} - Fängt Pokémon`,
          state: data.location || 'Auf der Jagd',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'pokeball',
          smallImageText: data.pokemon || 'Fängt Pokémon',
        };
        break;

      default:
        this.setLauncherActivity(data.selectedGame);
    }

    this.updateActivity();
  }

  /**
   * Update die aktuelle Activity
   */
  async updateActivity() {
    if (!this.isConnected || !this.currentActivity) return;

    try {
      await this.client.setActivity(this.currentActivity);
      console.log('✅ Discord activity updated:', this.currentActivity.details);
    } catch (error) {
      console.error('Failed to update Discord activity:', error);
    }
  }

  /**
   * Clear Activity
   */
  async clearActivity() {
    if (!this.isConnected) return;

    try {
      await this.client.clearActivity();
      this.currentActivity = null;
      console.log('✅ Discord activity cleared');
    } catch (error) {
      console.error('Failed to clear Discord activity:', error);
    }
  }

  /**
   * Disconnect from Discord
   */
  async disconnect() {
    if (!this.isConnected) return;

    try {
      await this.clearActivity();
      await this.client.destroy();
      this.isConnected = false;
      this.client = null;
      console.log('✅ Discord RPC disconnected');
    } catch (error) {
      console.error('Failed to disconnect Discord RPC:', error);
    }
  }

  /**
   * Reconnect
   */
  async reconnect() {
    await this.disconnect();
    await this.initialize();
  }
}

// Singleton instance
let discordServiceInstance = null;

module.exports = {
  getDiscordService: () => {
    if (!discordServiceInstance) {
      discordServiceInstance = new DiscordService();
    }
    return discordServiceInstance;
  }
};
