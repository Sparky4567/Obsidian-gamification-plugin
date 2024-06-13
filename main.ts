import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  MarkdownView,
  Notice,
} from "obsidian";

interface PluginData {
  streak: number;
  lastDate: string;
  xp: number;
  level: number;
  health: number;
  class: string;
  skills: Record<string, number>;
  totalWords: number;
}

interface Enemy {
  name: string;
  health: number;
  damage: number;
  xpReward: number;
}

const classes = ["Warrior", "Mage", "Rogue", "Archer", "Healer"];
const skills = [
  // Warrior skills
  { name: "Strength", classes: ["Warrior"], points: 0 },
  { name: "Endurance", classes: ["Warrior"], points: 0 },
  { name: "Speed", classes: ["Warrior"], points: 0 },
  { name: "Shield Mastery", classes: ["Warrior"], points: 0 },
  { name: "Swordsmanship", classes: ["Warrior"], points: 0 },
  { name: "Battle Cry", classes: ["Warrior"], points: 0 },
  { name: "Berserk", classes: ["Warrior"], points: 0 },
  { name: "Heavy Armor", classes: ["Warrior"], points: 0 },

  // Mage skills
  { name: "Magic", classes: ["Mage"], points: 0 },
  { name: "Wisdom", classes: ["Mage"], points: 0 },
  { name: "Elemental Mastery", classes: ["Mage"], points: 0 },
  { name: "Arcane Power", classes: ["Mage"], points: 0 },
  { name: "Mana Control", classes: ["Mage"], points: 0 },
  { name: "Spellcasting", classes: ["Mage"], points: 0 },
  { name: "Teleportation", classes: ["Mage"], points: 0 },
  { name: "Alchemy", classes: ["Mage"], points: 0 },

  // Rogue skills
  { name: "Stealth", classes: ["Rogue"], points: 0 },
  { name: "Agility", classes: ["Rogue"], points: 0 },
  { name: "Lockpicking", classes: ["Rogue"], points: 0 },
  { name: "Backstab", classes: ["Rogue"], points: 0 },
  { name: "Pickpocketing", classes: ["Rogue"], points: 0 },
  { name: "Evasion", classes: ["Rogue"], points: 0 },
  { name: "Poison Mastery", classes: ["Rogue"], points: 0 },
  { name: "Dual Wield", classes: ["Rogue"], points: 0 },

  // Archer skills
  { name: "Marksmanship", classes: ["Archer"], points: 0 },
  { name: "Eagle Eye", classes: ["Archer"], points: 0 },
  { name: "Quick Shot", classes: ["Archer"], points: 0 },
  { name: "Tracking", classes: ["Archer"], points: 0 },
  { name: "Trap Setting", classes: ["Archer"], points: 0 },
  { name: "Survival", classes: ["Archer"], points: 0 },
  { name: "Camouflage", classes: ["Archer"], points: 0 },
  { name: "Arrow Crafting", classes: ["Archer"], points: 0 },

  // Healer skills
  { name: "Healing Touch", classes: ["Healer"], points: 0 },
  { name: "Restoration", classes: ["Healer"], points: 0 },
  { name: "Purification", classes: ["Healer"], points: 0 },
  { name: "Revive", classes: ["Healer"], points: 0 },
  { name: "Protective Aura", classes: ["Healer"], points: 0 },
  { name: "Divine Light", classes: ["Healer"], points: 0 },
  { name: "Herbalism", classes: ["Healer"], points: 0 },
  { name: "Meditation", classes: ["Healer"], points: 0 },
];

const uniqueSkills = [
  {
    name: "Dragon Slayer",
    description: "Increases damage to dragons by 50%",
    rarity: "unique",
  },
  {
    name: "Ethereal Form",
    description: "Allows passing through objects",
    rarity: "rare",
  },
  {
    name: "Phoenix Rebirth",
    description: "Revives once upon death",
    rarity: "legendary",
  },
  {
    name: "Shadow Strike",
    description: "Deals 200% damage when attacking from stealth",
    rarity: "unique",
  },
  {
    name: "Arcane Shield",
    description: "Absorbs all damage for 5 seconds",
    rarity: "rare",
  },
  {
    name: "Vampiric Touch",
    description:
      "Drains life from enemy, healing you for 50% of the damage dealt",
    rarity: "rare",
  },
  {
    name: "Celestial Guidance",
    description: "Grants a chance to avoid all damage from an attack",
    rarity: "legendary",
  },
  {
    name: "Berserker Rage",
    description: "Increases attack speed and damage by 30% for 10 seconds",
    rarity: "unique",
  },
  {
    name: "Mana Surge",
    description: "Instantly restores 50% of maximum mana",
    rarity: "rare",
  },
  {
    name: "Spirit Bond",
    description: "Links your spirit to an ally, sharing health between you",
    rarity: "legendary",
  },
  {
    name: "Frozen Heart",
    description: "Reduces all incoming damage by 20%",
    rarity: "unique",
  },
  {
    name: "Lightning Reflexes",
    description: "Dodges the next incoming attack",
    rarity: "rare",
  },
  {
    name: "Blessing of the Ancients",
    description: "Increases all attributes by 10% for 1 hour",
    rarity: "legendary",
  },
  {
    name: "Necromancer's Call",
    description: "Summons a powerful undead minion to fight for you",
    rarity: "unique",
  },
  {
    name: "Astral Projection",
    description: "Allows you to explore areas without your physical body",
    rarity: "rare",
  },
  {
    name: "Temporal Mastery",
    description: "Slows down time for everyone except you for 5 seconds",
    rarity: "legendary",
  },
  {
    name: "Inferno Blast",
    description: "Deals massive fire damage to all enemies in a large area",
    rarity: "unique",
  },
  {
    name: "Healing Light",
    description: "Heals you and nearby allies for a significant amount",
    rarity: "rare",
  },
  {
    name: "Guardian's Oath",
    description: "Reduces damage taken by allies within 10 meters by 20%",
    rarity: "legendary",
  },
];

const enemies: Enemy[] = [
  { name: "Rat", health: 5, damage: 5, xpReward: 1 },
  { name: "Wild wolf", health: 15, damage: 15, xpReward: 20 },
  { name: "Duck", health: 5, damage: 5, xpReward: 1 },
  { name: "Chicken", health: 5, damage: 5, xpReward: 1 },
  { name: "Wild boar", health: 20, damage: 10, xpReward: 15 },
  { name: "Goblin", health: 30, damage: 10, xpReward: 10 },
  { name: "Orc", health: 50, damage: 20, xpReward: 25 },
  { name: "Dragon", health: 100, damage: 40, xpReward: 100 },
  { name: "Zombie", health: 20, damage: 8, xpReward: 15 },
  { name: "Vampire", health: 60, damage: 25, xpReward: 30 },
  { name: "Skeleton", health: 10, damage: 10, xpReward: 5 },
  { name: "Giant Spider", health: 40, damage: 20, xpReward: 20 },
  { name: "Troll", health: 80, damage: 30, xpReward: 50 },
  { name: "Hydra", health: 150, damage: 50, xpReward: 150 },
  { name: "Necromancer", health: 70, damage: 35, xpReward: 70 },
  { name: "Bandit", health: 25, damage: 15, xpReward: 10 },
  { name: "Witch", health: 45, damage: 30, xpReward: 25 },
  { name: "Elemental", health: 90, damage: 45, xpReward: 80 },
  { name: "Dark Knight", health: 120, damage: 50, xpReward: 90 },
  { name: "Ghost", health: 30, damage: 20, xpReward: 20 },
  { name: "Minotaur", health: 100, damage: 55, xpReward: 110 },
  { name: "Demon", health: 200, damage: 70, xpReward: 200 },
  { name: "Phoenix", health: 150, damage: 60, xpReward: 150 },
  { name: "Giant", health: 180, damage: 65, xpReward: 180 },
  { name: "Lich", health: 130, damage: 55, xpReward: 130 },
  { name: "Banshee", health: 50, damage: 30, xpReward: 50 },
  { name: "Golem", health: 200, damage: 60, xpReward: 190 },
  { name: "Manticore", health: 170, damage: 65, xpReward: 170 },
  { name: "Cyclops", health: 140, damage: 50, xpReward: 140 },
  { name: "Harpy", health: 70, damage: 35, xpReward: 70 },
  { name: "Satyr", health: 60, damage: 30, xpReward: 60 },
  { name: "Chimera", health: 160, damage: 70, xpReward: 160 },
  { name: "Kraken", health: 250, damage: 80, xpReward: 250 },
  { name: "Medusa", health: 120, damage: 45, xpReward: 120 },
  { name: "Griffin", health: 130, damage: 55, xpReward: 130 },
  { name: "Werewolf", health: 100, damage: 50, xpReward: 100 },
  { name: "Ogre", health: 150, damage: 60, xpReward: 150 },
  { name: "Treant", health: 140, damage: 50, xpReward: 140 },
  { name: "Wyvern", health: 160, damage: 70, xpReward: 160 },
  { name: "Basilisk", health: 110, damage: 45, xpReward: 110 },
  { name: "Behemoth", health: 220, damage: 75, xpReward: 220 },
  { name: "Djinn", health: 130, damage: 55, xpReward: 130 },
  { name: "Wraith", health: 90, damage: 40, xpReward: 90 },
  { name: "Naga", health: 120, damage: 50, xpReward: 120 },
  { name: "Yeti", health: 150, damage: 60, xpReward: 150 },
  { name: "Sea Serpent", health: 200, damage: 70, xpReward: 200 },
  { name: "Gargoyle", health: 100, damage: 45, xpReward: 100 },
  { name: "Mummy", health: 80, damage: 35, xpReward: 80 },
  { name: "Imp", health: 40, damage: 20, xpReward: 40 },
  { name: "Gremlin", health: 60, damage: 25, xpReward: 60 },
  { name: "Shadow", health: 90, damage: 40, xpReward: 90 },
  { name: "Wendigo", health: 180, damage: 70, xpReward: 180 },
];

// Example function to update data and trigger status bar update

export default class GamificationPlugin extends Plugin {
  private data: PluginData;
  private statusBarEl: HTMLElement | null = null;
  updateStatusBar() {
    if (this.statusBarEl) {
      // Update the text content of the status bar item
      this.statusBarEl.setText(
        `XP: ${this.data.xp}, Level: ${this.data.level}, Words: ${this.data.totalWords}`
      );
      console.log("updated points");
    } else {
      ("No status bar was detected");
    }
  }
  addStatusBar() {
    // Add your status bar item and store a reference to it
    this.statusBarEl = this.addStatusBarItem();
    this.updateStatusBar(); // Ensure it's initialized correctly
  }
  async onload() {
    console.log("Loading Gamification Plugin");
    await this.loadSettings();

    this.addStatusBar();
    this.updateStatusBar();

    this.addCommand({
      id: "reset-streak",
      name: "Reset Streak",
      callback: () => this.resetStreak(),
    });

    this.addCommand({
      id: "choose-class",
      name: "Choose Class",
      callback: () => this.chooseClass(),
    });

    this.addSettingTab(new GamificationSettingTab(this.app, this));

    // Listen for changes in the active note to update word count
    this.registerEvent(
      this.app.workspace.on("editor-change", this.updateWordCount.bind(this))
    );
  }

  onunload() {
    console.log("Unloading Gamification Plugin");
  }

  async loadSettings() {
    this.data = Object.assign(
      {
        streak: 0,
        lastDate: "",
        xp: 0,
        level: 1,
        health: 100,
        class: "",
        skills: {},
        totalWords: 0,
      },
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.data);
  }

  updateStreak() {
    const today = new Date().toISOString().split("T")[0];
    if (this.data.lastDate !== today) {
      if (this.data.lastDate === this.yesterday()) {
        this.data.streak++;
      } else {
        this.data.streak = 1;
      }
      this.data.lastDate = today;
      this.saveSettings();
    }
  }

  resetStreak() {
    this.data.streak = 0;
    this.data.lastDate = "";
    this.saveSettings();
    this.addStatusBarItem().setText("Streak: 0 days");
  }

  yesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }

  async chooseClass() {
    const className = classes[Math.floor(Math.random() * classes.length)];
    this.data.class = className;
    this.data.skills = {};
    skills
      .filter((skill) => skill.classes.includes(className))
      .forEach((skill) => {
        if (!this.data.skills[skill.name]) {
          this.data.skills[skill.name] = 0;
        } else {
          this.data.skills[skill.name] = this.data.skills[skill.name];
        }
      });
    await this.saveSettings();
    new Notice(`You have chosen the ${className} class!`);
  }

  triggerRandomEvent() {
    const events = [
      { type: "gain_xp", amount: Math.floor(Math.random() * 50) + 10 },
      { type: "lose_health", amount: Math.floor(Math.random() * 20) + 5 },
      { type: "gain_health", amount: Math.floor(Math.random() * 20) + 5 },
      { type: "enemy_encounter" },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    const points = event.amount;
    if (points !== undefined) {
      if (event.type === "gain_xp") {
        this.enemyEncounter();
        // this.gainXP(points);
      } else if (event.type === "lose_health") {
        this.enemyEncounter();
        this.data.health -= points;
        if (this.data.health < 0) this.data.health = 0;
        new Notice(`You lost ${event.amount} health!`);
      } else if (event.type === "gain_health") {
        this.data.health += points;
        if (this.data.health > 100) this.data.health = 100;
        new Notice(`You gained ${event.amount} health!`);
      } else if (event.type === "enemy_encounter") {
        this.enemyEncounter();
      }
    }
  }

  enemyEncounter() {
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    new Notice(`An enemy ${enemy.name} appeared!`);

    const playerDamage = Math.floor(Math.random() * 20) + 5;
    enemy.health -= playerDamage;
    this.data.health -= enemy.damage;

    if (this.data.health < 0) this.data.health = 0;
    if (enemy.health <= 0) {
      new Notice(
        `You defeated the ${enemy.name} and gained ${enemy.xpReward} XP!`
      );
      this.gainXP(enemy.xpReward);
      this.attemptToGainUniqueSkill();
    } else {
      new Notice(
        `The ${enemy.name} attacked you and you lost ${enemy.damage} health!`
      );
    }

    this.saveSettings();
  }

  attemptToGainUniqueSkill() {
    const chance = Math.random();
    if (chance < 0.05) {
      // 5% chance to gain a unique skill
      const uniqueSkill =
        uniqueSkills[Math.floor(Math.random() * uniqueSkills.length)];
      if (!this.data.skills[uniqueSkill.name]) {
        this.data.skills[uniqueSkill.name] = 1;
        new Notice(
          `You have acquired a rare skill: ${uniqueSkill.name}! ${uniqueSkill.description}`
        );
      }
    }
  }

  updateWordCount() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
      const editor = activeLeaf.view.editor;
      const wordCount = this.countWords(editor.getValue());
      const newWords = wordCount - this.data.totalWords;
      if (newWords > 0) {
        this.data.totalWords = wordCount;
        this.updateStatusBar();
        if (wordCount > 50) {
          this.triggerRandomEvent();
          this.saveSettings();
        } else if (wordCount > 150) {
          this.gainXP(newWords);
          this.triggerRandomEvent();
          this.saveSettings();
        }
      }
    }
  }

  countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  gainXP(amount: number) {
    this.data.xp += amount;
    const requiredXP = this.calculateRequiredXP();
    if (this.data.xp >= requiredXP) {
      this.data.level++;
      this.data.xp -= requiredXP;

      const className = classes[Math.floor(Math.random() * classes.length)];

      this.data.skills = {};
      if (this.data !== undefined) {
        this.data.class = className;
        skills
          .filter((skill) => skill.classes.includes(className))
          .forEach((skill) => {
            let randomNum = Math.round(Math.random());
            if (randomNum == 1) {
              skill.points = skill.points + 1;
              new Notice(`Congratulations! ${skill.name} points were updated`);
            }
          });
        this.saveSettings();
        new Notice(`Congratulations! You've reached level ${this.data.level}`);
      }
    } else {
      new Notice(`You gained ${amount} XP!`);
    }
  }

  calculateRequiredXP(): number {
    return 100 * Math.pow(1.1, this.data.level - 1); // Exponentially increasing XP requirement
  }
}

class GamificationSettingTab extends PluginSettingTab {
  plugin: any;
  constructor(app: App, plugin: GamificationPlugin) {
    super(app, plugin);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for Gamification Plugin" });
    let classValue: any;
    new Setting(containerEl)
      .setName("Class")
      .setDesc("Choose your class")
      .addDropdown(async (drop) => {
        classes.forEach((className) => drop.addOption(className, className));
        drop.setValue(this.plugin.data.class);
        drop.onChange(async (value) => {
          this.plugin.data.class = value;
          classValue = value;
          this.plugin.data.skills = {};
          skills
            .filter((skill) => skill.classes.includes(value))
            .forEach((skill) => {
              this.plugin.data.skills[skill.name] = skill.points;
            });
          await this.plugin.saveSettings();
          this.display(); // Re-render settings to show new skills
        });
      });

    if (this.plugin.data.skills !== null) {
      console.log(this.plugin.data.skills.points);
      Object.keys(this.plugin.data.skills).forEach((skill) => {
        new Setting(containerEl)
          .setName(skill)
          .setDesc(`Skill level for ${skill}`)
          .addText((text) =>
            text.setValue(`${this.plugin.data.skills[skill]}`)
          );
      });
    }
  }
}
