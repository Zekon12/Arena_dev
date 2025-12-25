export class Enemy {
    constructor(stageLevel, isBoss = false) {
        this.id = `enemy_${Date.now()}_${Math.random()}`;
        this.stageLevel = stageLevel;
        this.level = stageLevel;
        this.isBoss = isBoss;
        this.name = this.generateName();
        this.attributes = this.generateAttributes();
        this.rewards = this.calculateRewards();
    }
    generateName() {
        const normalNames = ['野蛮人', '哥布林', '骷髅兵', '兽人', '盗贼', '狼人', '蜘蛛', '食人魔', '巨魔', '暗影刺客', '火焰法师', '冰霜巨人',
            '毒蛇', '石像鬼', '幽灵', '恶魔', '龙人战士'];
        const bossNames = ['野蛮人酋长', '哥布林王', '骷髅领主', '兽人督军', '盗贼头目', '狼王', '蜘蛛女王', '食人魔王', '巨魔酋长', '暗影领主', '火焰大法师', '冰霜之王',
            '蛇王', '石像鬼首领', '幽灵王', '恶魔领主', '龙王'];
        const names = this.isBoss ? bossNames : normalNames;
        return names[Math.floor(Math.random() * names.length)];
    }
    generateAttributes() {
        const baseMultiplier = Math.pow(1.2, this.stageLevel - 1); // 降低成长倍数
        let attributes = {
            health: Math.floor((60 + this.stageLevel * 15) * 1.2 * baseMultiplier), // 降低基础血量
            maxHealth: 0,
            attack: Math.floor((6 + this.stageLevel * 2) * 1.0 * baseMultiplier), // 降低基础攻击
            defense: Math.floor((2 + this.stageLevel * 1) * 0.8 * baseMultiplier), // 降低基础防御
            agility: Math.floor((4 + this.stageLevel * 1) * 0.6 * baseMultiplier),
            luck: Math.floor((1 + this.stageLevel * 0.3) * 0.4 * baseMultiplier)
        };
        if (this.isBoss) {
            attributes.health = Math.floor(attributes.health * 2.5); // 降低Boss血量倍数
            attributes.attack = Math.floor(attributes.attack * 1.5); // 降低Boss攻击倍数
            attributes.defense = Math.floor(attributes.defense * 1.3);
        }
        attributes.maxHealth = attributes.health;
        return attributes;
    }
    calculateRewards() {
        const baseExp = 100 + this.stageLevel * 200;
        const baseGold = 50 + this.stageLevel * 300;
        let rewards = {
            experience: baseExp,
            gold: baseGold,
            dropRate: 0.1 + this.stageLevel * 0.01
        };
        if (this.isBoss) {
            rewards.experience *= 5;
            rewards.gold *= 5;
            rewards.dropRate *= 2;
        }
        return rewards;
    }
    takeDamage(damage) {
        this.attributes.health = Math.max(0, this.attributes.health - damage);
    }
    isDead() {
        return this.attributes.health <= 0;
    }
    resetHealth() {
        this.attributes.health = this.attributes.maxHealth;
    }
}
//# sourceMappingURL=enemy.js.map