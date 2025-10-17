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
  setLauncherActivity() {
    if (!this.isConnected) return;

    this.currentActivity = {
      details: 'Im Launcher',
      state: 'Bereit zum Spielen',
      startTimestamp: this.startTimestamp,
      largeImageKey: 'mirrorbytes_logo',
      largeImageText: 'Pokémon Mirrorbytes',
      smallImageKey: 'launcher_icon',
      smallImageText: 'Launcher',
      instance: false,
    };

    this.updateActivity();
  }

  /**
   * Setze Activity wenn Game läuft
   */
  setGameActivity(gameInfo = {}, selectedGame = {}) {
    if (!this.isConnected) return;

    const {
      location = 'Unterwegs',
      playtime = '0h 0m',
      badges = 0,
      partySize = 0,
      partyMax = 6
    } = gameInfo;

    const gameName = selectedGame.name || 'Pokémon Game';
    const repoUrl = `https://github.com/99Problemsx/${selectedGame.repo}`;

    this.currentActivity = {
      details: `Spielt ${gameName}`,
      state: location,
      startTimestamp: this.startTimestamp,
      largeImageKey: 'mirrorbytes_logo',
      largeImageText: gameName,
      smallImageKey: 'playing_icon',
      smallImageText: `${playtime} gespielt`,
      instance: false,
      buttons: [
        {
          label: 'Game Info',
          url: repoUrl
        },
        {
          label: 'Discord Server',
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

    switch (type) {
      case 'battle':
        this.currentActivity = {
          details: 'Im Kampf',
          state: data.opponent || 'Trainer Kampf',
          startTimestamp: Date.now(),
          largeImageKey: 'battle_icon',
          largeImageText: 'Pokémon Kampf',
          smallImageKey: data.pokemon || 'pokeball',
          smallImageText: data.pokemonName || 'Im Kampf',
        };
        break;

      case 'training':
        this.currentActivity = {
          details: 'Training',
          state: data.location || 'Trainiert Pokémon',
          startTimestamp: this.startTimestamp,
          largeImageKey: 'training_icon',
          largeImageText: 'Training',
        };
        break;

      case 'trading':
        this.currentActivity = {
          details: 'Tauscht Pokémon',
          state: data.partner || 'Mit Freund',
          startTimestamp: Date.now(),
          largeImageKey: 'trade_icon',
          largeImageText: 'Pokémon Tausch',
        };
        break;

      case 'exploring':
        this.currentActivity = {
          details: 'Erkundet',
          state: data.location || 'Neue Orte',
          startTimestamp: this.startTimestamp,
          largeImageKey: 'explore_icon',
          largeImageText: 'Exploration',
        };
        break;

      case 'menu':
        this.currentActivity = {
          details: 'Im Menü',
          state: data.section || 'Schaut sich um',
          startTimestamp: this.startTimestamp,
          largeImageKey: 'menu_icon',
          largeImageText: 'Menü',
        };
        break;

      default:
        this.setLauncherActivity();
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
