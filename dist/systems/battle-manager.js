import { GAME_CONFIG } from '../config/game-config.js';
import { Enemy } from '../models/enemy.js';
export class BattleManager {
    constructor(player) {
        this.currentStage = null;
        this.battleTimer = null;
        this.reviveTimer = null;
        this.state = 'idle';
        this.playerNextAttack = 0;
        this.enemyNextAttack = 0;
        // 事件回调
        this.onBattleResult = null;
        this.onDamageDealt = null;
        this.onEnemyDefeated = null;
        this.onPlayerLevelUp = null;
        this.onPlayerRevive = null;
        this.player = player;
    }
    startStage(stageLevel) {
        if (this.state !== 'idle') {
            return false;
        }
        // 确保清理所有定时器
        this.stopBattle();
        // 生成敌人
        const enemies = [];
        for (let i = 0; i < 15; i++) {
            enemies.push(new Enemy(stageLevel, false));
        }
        enemies.push(new Enemy(stageLevel, true)); // Boss
        this.currentStage = {
            stageLevel,
            enemies,
            currentEnemyIndex: 0,
            enemiesDefeated: 0,
            isCompleted: false
        };
        this.player.currentStage = stageLevel;
        this.startNextBattle();
        return true;
    }
    startNextBattle() {
        if (!this.currentStage)
            return;
        // 确保清理之前的定时器
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        const stage = this.currentStage;
        if (stage.currentEnemyIndex >= stage.enemies.length) {
            this.completeStage();
            return;
        }
        const currentEnemy = stage.enemies[stage.currentEnemyIndex];
        if (currentEnemy.isDead()) {
            currentEnemy.resetHealth();
        }
        this.state = 'fighting';
        this.startBattleLoop(currentEnemy);
    }
    startBattleLoop(enemy) {
        // 确保清理之前的战斗定时器
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        // 检查状态是否正确
        if (this.state !== 'fighting') {
            return;
        }
        const now = Date.now();
        this.playerNextAttack = now + this.getAttackInterval(this.player);
        this.enemyNextAttack = now + this.getAttackInterval(enemy);
        this.battleTimer = window.setInterval(() => {
            // 再次检查状态，防止异常情况
            if (this.state !== 'fighting') {
                if (this.battleTimer) {
                    clearInterval(this.battleTimer);
                    this.battleTimer = null;
                }
                return;
            }
            this.processBattleTick(enemy);
        }, 100);
    }
    processBattleTick(enemy) {
        const now = Date.now();
        // 玩家攻击
        if (now >= this.playerNextAttack && this.player.attributes.health > 0) {
            this.executeAttack(this.player, enemy);
            this.playerNextAttack = now + this.getAttackInterval(this.player);
        }
        // 敌人攻击
        if (now >= this.enemyNextAttack && enemy.attributes.health > 0) {
            this.executeAttack(enemy, this.player);
            this.enemyNextAttack = now + this.getAttackInterval(enemy);
        }
        // 检查战斗结束
        if (this.player.attributes.health <= 0 || enemy.attributes.health <= 0) {
            this.finishBattle(enemy);
        }
    }
    executeAttack(attacker, defender) {
        const damage = this.calculateDamage(attacker, defender);
        defender.takeDamage(damage.damage);
        // 触发伤害事件
        if (this.onDamageDealt) {
            this.onDamageDealt({
                attacker,
                defender,
                damage: damage.damage,
                isCritical: damage.isCritical
            });
        }
    }
    calculateDamage(attacker, defender) {
        const baseDamage = Math.max(1, attacker.attributes.attack - defender.attributes.defense);
        const criticalChance = attacker.attributes.luck / 200;
        const isCritical = Math.random() < criticalChance;
        return {
            damage: isCritical ? baseDamage * GAME_CONFIG.CRITICAL_DAMAGE_MULTIPLIER : baseDamage,
            isCritical
        };
    }
    getAttackInterval(character) {
        return Math.max(GAME_CONFIG.MIN_ATTACK_INTERVAL, GAME_CONFIG.BASE_ATTACK_INTERVAL - Math.floor(character.attributes.agility / GAME_CONFIG.AGILITY_ATTACK_REDUCTION) * 100);
    }
    finishBattle(enemy) {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        if (this.player.attributes.health > 0) {
            // 玩家获胜
            this.handlePlayerVictory(enemy);
        }
        else {
            // 玩家失败，开始复活流程
            this.handlePlayerDeath(enemy);
        }
    }
    handlePlayerDeath(enemy) {
        this.state = 'player_defeated';
        // 触发玩家死亡事件
        if (this.onBattleResult) {
            this.onBattleResult({ winner: enemy, loser: this.player });
        }
        // 开始复活倒计时
        this.startReviveCountdown(enemy);
    }
    startReviveCountdown(enemy) {
        let countdown = Math.floor(GAME_CONFIG.REVIVE_TIME / 1000); // 转换为秒
        this.state = 'reviving';
        // 显示复活倒计时
        const showCountdown = () => {
            if (countdown > 0 && this.state === 'reviving') {
                // 更新复活状态显示
                if (this.onPlayerRevive) {
                    this.onPlayerRevive({ type: 'countdown', time: countdown });
                }
                countdown--;
                this.reviveTimer = window.setTimeout(showCountdown, 1000);
            }
            else if (this.state === 'reviving') {
                // 复活玩家
                this.revivePlayer(enemy);
            }
        };
        showCountdown();
    }
    revivePlayer(enemy) {
        // 清理复活定时器
        if (this.reviveTimer) {
            clearTimeout(this.reviveTimer);
            this.reviveTimer = null;
        }
        // 复活玩家
        this.player.revive();
        // 重置敌人生命值
        if (enemy) {
            enemy.resetHealth();
        }
        // 触发复活事件
        if (this.onPlayerRevive) {
            this.onPlayerRevive({ type: 'revived' });
        }
        // 重新开始战斗 - 设置正确的状态
        this.state = 'fighting';
        setTimeout(() => {
            if (enemy && this.currentStage && this.state === 'fighting') {
                this.startBattleLoop(enemy);
            }
        }, 1000);
    }
    handlePlayerVictory(enemy) {
        const stage = this.currentStage;
        // 给予奖励
        this.player.gainExperience(enemy.rewards.experience);
        this.player.gainGold(enemy.rewards.gold);
        // 触发敌人击败事件
        if (this.onEnemyDefeated) {
            this.onEnemyDefeated(enemy);
        }
        // 检查升级
        while (this.player.canLevelUp()) {
            const oldLevel = this.player.level;
            this.player.levelUp();
            if (this.onPlayerLevelUp) {
                this.onPlayerLevelUp(this.player.level);
            }
        }
        // 移动到下一个敌人
        stage.currentEnemyIndex++;
        stage.enemiesDefeated++;
        if (stage.currentEnemyIndex >= stage.enemies.length) {
            this.completeStage();
        }
        else {
            this.state = 'idle';
            setTimeout(() => {
                this.startNextBattle();
            }, 1000);
        }
    }
    completeStage() {
        this.currentStage.isCompleted = true;
        this.state = 'stage_completed';
        setTimeout(() => {
            const nextStage = this.currentStage.stageLevel;
            this.currentStage = null;
            this.state = 'idle';
            this.startStage(nextStage);
        }, 2000);
    }
    getCurrentEnemy() {
        if (!this.currentStage || this.currentStage.currentEnemyIndex >= this.currentStage.enemies.length) {
            return null;
        }
        return this.currentStage.enemies[this.currentStage.currentEnemyIndex];
    }
    getStageProgress() {
        if (!this.currentStage)
            return null;
        return {
            currentStage: this.currentStage.stageLevel,
            enemiesDefeated: this.currentStage.enemiesDefeated,
            totalEnemies: this.currentStage.enemies.length,
            isCompleted: this.currentStage.isCompleted
        };
    }
    getState() {
        return this.state;
    }
    stopBattle() {
        // 清除所有定时器
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        if (this.reviveTimer) {
            clearTimeout(this.reviveTimer);
            this.reviveTimer = null;
        }
        // 重置状态
        this.state = 'idle';
        // 如果玩家处于死亡状态，复活玩家
        if (this.player.attributes.health <= 0) {
            this.player.revive();
        }
    }
    resetStage() {
        this.stopBattle();
        this.currentStage = null;
        this.state = 'idle';
    }
}
//# sourceMappingURL=battle-manager.js.map