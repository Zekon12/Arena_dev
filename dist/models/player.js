import { GAME_CONFIG } from '../config/game-config.js';
export class Player {
    constructor() {
        this.id = 'player';
        this.name = '勇者';
        this.level = 1;
        this.experience = 0;
        this.availablePoints = 0;
        this.gold = 0;
        this.diamonds = 0;
        this.currentStage = 1;
        this.attributes = {
            health: 150, // 提高初始生命值
            maxHealth: 150,
            attack: 25, // 提高初始攻击力
            defense: 8, // 提高初始防御力
            agility: 12, // 提高初始敏捷
            luck: 15 // 提高初始幸运
        };
        // 炼金炉系统
        this.alchemyFurnace = {
            level: 1,
            lastProductionTime: Date.now(),
            totalProduced: 0
        };
    }
    getRequiredExp() {
        return Math.floor(GAME_CONFIG.BASE_EXP_REQUIREMENT * Math.pow(GAME_CONFIG.EXP_GROWTH_RATE, this.level - 1));
    }
    canLevelUp() {
        return this.experience >= this.getRequiredExp();
    }
    levelUp() {
        if (!this.canLevelUp())
            return false;
        const requiredExp = this.getRequiredExp();
        this.experience -= requiredExp;
        this.level += 1;
        this.availablePoints += GAME_CONFIG.ATTRIBUTE_POINTS_PER_LEVEL;
        // 升级时增加属性
        this.attributes.maxHealth += 20;
        this.attributes.health = this.attributes.maxHealth;
        this.attributes.attack += 3;
        this.attributes.defense += 2;
        return true;
    }
    allocateAttribute(attribute, points) {
        if (points <= 0 || points > this.availablePoints)
            return false;
        if (attribute === 'health') {
            this.attributes.health += points;
            this.attributes.maxHealth += points;
        }
        else if (attribute !== 'maxHealth') {
            this.attributes[attribute] += points;
        }
        this.availablePoints -= points;
        return true;
    }
    gainExperience(amount) {
        this.experience = Math.floor(this.experience + amount);
    }
    gainGold(amount) {
        this.gold = Math.floor(this.gold + amount);
    }
    // 炼金炉相关方法
    getAlchemyProductionRate() {
        // 计算每秒产量，确保返回整数
        const baseProduction = GAME_CONFIG.ALCHEMY_BASE_PRODUCTION;
        const levelMultiplier = Math.pow(GAME_CONFIG.ALCHEMY_PRODUCTION_MULTIPLIER, this.alchemyFurnace.level - 1);
        return Math.floor(baseProduction * levelMultiplier);
    }
    getAlchemyInterval() {
        // 炼金炉产出间隔（毫秒）
        return GAME_CONFIG.ALCHEMY_BASE_INTERVAL;
    }
    getAlchemyUpgradeCost() {
        // 计算升级费用，确保返回整数
        const baseCost = GAME_CONFIG.ALCHEMY_UPGRADE_COST_BASE;
        const levelMultiplier = Math.pow(GAME_CONFIG.ALCHEMY_UPGRADE_COST_MULTIPLIER, this.alchemyFurnace.level - 1);
        return Math.floor(baseCost * levelMultiplier);
    }
    canUpgradeAlchemy() {
        return this.gold >= this.getAlchemyUpgradeCost();
    }
    upgradeAlchemy() {
        if (!this.canUpgradeAlchemy())
            return false;
        const cost = this.getAlchemyUpgradeCost();
        this.gold -= cost;
        this.alchemyFurnace.level += 1;
        return true;
    }
    collectAlchemyProduction() {
        const now = Date.now();
        const timeDiff = now - this.alchemyFurnace.lastProductionTime;
        const interval = this.getAlchemyInterval();
        if (timeDiff >= interval) {
            const cycles = Math.floor(timeDiff / interval);
            const production = Math.floor(this.getAlchemyProductionRate() * cycles);
            this.gold = Math.floor(this.gold + production);
            this.alchemyFurnace.totalProduced = Math.floor(this.alchemyFurnace.totalProduced + production);
            this.alchemyFurnace.lastProductionTime = now - (timeDiff % interval);
            return production;
        }
        return 0;
    }
    getOfflineProduction(offlineTime) {
        // 计算离线收益（毫秒），确保返回整数
        const interval = this.getAlchemyInterval();
        const cycles = Math.floor(offlineTime / interval);
        const production = Math.floor(this.getAlchemyProductionRate() * cycles);
        return production;
    }
    getNextProductionTime() {
        const now = Date.now();
        const interval = this.getAlchemyInterval();
        const timeSinceLastProduction = now - this.alchemyFurnace.lastProductionTime;
        const timeToNext = interval - (timeSinceLastProduction % interval);
        return timeToNext;
    }
    takeDamage(damage) {
        this.attributes.health = Math.max(0, this.attributes.health - damage);
    }
    isDead() {
        return this.attributes.health <= 0;
    }
    revive() {
        this.attributes.health = this.attributes.maxHealth;
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            experience: this.experience,
            availablePoints: this.availablePoints,
            gold: this.gold,
            diamonds: this.diamonds,
            currentStage: this.currentStage,
            attributes: { ...this.attributes },
            alchemyFurnace: { ...this.alchemyFurnace }
        };
    }
    fromJSON(data) {
        // 从保存数据恢复玩家状态
        Object.assign(this, data);
        if (data.alchemyFurnace) {
            this.alchemyFurnace = { ...data.alchemyFurnace };
        }
    }
    resetToDefault() {
        // 重置玩家到初始状态
        this.level = 1;
        this.experience = 0;
        this.availablePoints = 0;
        this.gold = 0;
        this.diamonds = 0;
        this.currentStage = 1;
        // 重置属性到初始值
        this.attributes = {
            health: 150,
            maxHealth: 150,
            attack: 25,
            defense: 8,
            agility: 12,
            luck: 15
        };
        // 重置炼金炉到初始状态
        this.alchemyFurnace = {
            level: 1,
            lastProductionTime: Date.now(),
            totalProduced: 0
        };
    }
}
//# sourceMappingURL=player.js.map