import { GAME_CONFIG } from '../config/game-config.js';
import type { Attributes, AlchemyFurnace, Character, States, Stance } from './interfaces/game-types.js';

export class Player implements Character {
    public id: string = 'player';
    public name: string = '勇者';
    public level: number = 1;
    public experience: number = 0;
    public availablePoints: number = 0;
    public gold: number = 0;
    public diamonds: number = 0;
    public currentStage: number = 1;
    public attributes: Attributes;
    public states: States;
    public alchemyFurnace: AlchemyFurnace;

    constructor() {
        this.attributes = {
            strength: 15,
            agility: 12,
            stamina:14,
            basicHealth: 50
        };

        this.states = {
            health: 100,
            maxHealth: 100,
            minAttack: 15,
            maxAttack: 20,
            attackSpeed: 2.4,
            criticalRate: 8,
            criticalMultiplier: 2,
            armor: 5,
            blockSkill: 10,
            blockValue: 3,
            dougeSkill: 8,
            parrySkill: 8,
        }
        
        // 炼金炉系统
        this.alchemyFurnace = {
            level: 1,
            lastProductionTime: Date.now(),
            totalProduced: 0
        };
    }

    updateState(): boolean {
        const curHealth = this.states.health
        this.states = {
            health: curHealth,
            maxHealth: GAME_CONFIG.BASIC_HEALTH + 10* this.attributes.stamina,
            minAttack: Math.floor(5 + 0.9 * this.attributes.strength),
            maxAttack: Math.floor(10 + 1.1 * this.attributes.strength),
            attackSpeed: 2.4,
            criticalRate: 8,
            criticalMultiplier: 2,
            armor: 5,
            blockSkill: 10,
            blockValue: 3,
            dougeSkill: 8,
            parrySkill: 8,

        }
        return true
    }

    getRequiredExp(): number {
        return Math.floor(GAME_CONFIG.BASE_EXP_REQUIREMENT * Math.pow(GAME_CONFIG.EXP_GROWTH_RATE, this.level - 1));
    }

    canLevelUp(): boolean {
        return this.experience >= this.getRequiredExp();
    }

    levelUp(): boolean {
        if (!this.canLevelUp()) return false;
        
        const requiredExp = this.getRequiredExp();
        this.experience -= requiredExp;
        this.level += 1;
        this.availablePoints += GAME_CONFIG.ATTRIBUTE_POINTS_PER_LEVEL;
        
        // 升级时增加属性
        this.attributes.basicHealth += 10 * Math.pow(this.level, 1.1);
        this.attributes.health = this.attributes.maxHealth;
        this.attributes.attack += 3;
        this.attributes.defense += 2;
        
        return true;
    }

    allocateAttribute(attribute: keyof Attributes, points: number): boolean {
        if (points <= 0 || points > this.availablePoints) return false;
        
        if (attribute === 'health') {
            this.attributes.health += points;
            this.attributes.maxHealth += points;
        } else if (attribute !== 'maxHealth') {
            this.attributes[attribute] += points;
        }
        
        this.availablePoints -= points;
        return true;
    }

    gainExperience(amount: number): void {
        this.experience = Math.floor(this.experience + amount);
    }

    gainGold(amount: number): void {
        this.gold = Math.floor(this.gold + amount);
    }

    // 炼金炉相关方法
    getAlchemyProductionRate(): number {
        // 计算每秒产量，确保返回整数
        const baseProduction = GAME_CONFIG.ALCHEMY_BASE_PRODUCTION;
        const levelMultiplier = Math.pow(GAME_CONFIG.ALCHEMY_PRODUCTION_MULTIPLIER, this.alchemyFurnace.level - 1);
        return Math.floor(baseProduction * levelMultiplier);
    }

    getAlchemyInterval(): number {
        // 炼金炉产出间隔（毫秒）
        return GAME_CONFIG.ALCHEMY_BASE_INTERVAL;
    }

    getAlchemyUpgradeCost(): number {
        // 计算升级费用，确保返回整数
        const baseCost = GAME_CONFIG.ALCHEMY_UPGRADE_COST_BASE;
        const levelMultiplier = Math.pow(GAME_CONFIG.ALCHEMY_UPGRADE_COST_MULTIPLIER, this.alchemyFurnace.level - 1);
        return Math.floor(baseCost * levelMultiplier);
    }

    canUpgradeAlchemy(): boolean {
        return this.gold >= this.getAlchemyUpgradeCost();
    }

    upgradeAlchemy(): boolean {
        if (!this.canUpgradeAlchemy()) return false;
        
        const cost = this.getAlchemyUpgradeCost();
        this.gold -= cost;
        this.alchemyFurnace.level += 1;
        return true;
    }

    collectAlchemyProduction(): number {
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

    getOfflineProduction(offlineTime: number): number {
        // 计算离线收益（毫秒），确保返回整数
        const interval = this.getAlchemyInterval();
        const cycles = Math.floor(offlineTime / interval);
        const production = Math.floor(this.getAlchemyProductionRate() * cycles);
        return production;
    }

    getNextProductionTime(): number {
        const now = Date.now();
        const interval = this.getAlchemyInterval();
        const timeSinceLastProduction = now - this.alchemyFurnace.lastProductionTime;
        const timeToNext = interval - (timeSinceLastProduction % interval);
        return timeToNext;
    }

    takeDamage(damage: number): void {
        this.attributes.health = Math.max(0, this.attributes.health - damage);
    }

    isDead(): boolean {
        return this.attributes.health <= 0;
    }

    revive(): void {
        this.attributes.health = this.attributes.maxHealth;
    }

    toJSON(): any {
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

    fromJSON(data: any): void {
        // 从保存数据恢复玩家状态
        Object.assign(this, data);
        if (data.alchemyFurnace) {
            this.alchemyFurnace = { ...data.alchemyFurnace };
        }
    }

    resetToDefault(): void {
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