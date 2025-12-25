export class UIManager {
    constructor() {
        this.messageContainer = document.getElementById('battle-messages');
    }
    updatePlayerInfo(player) {
        // 更新玩家信息显示
        this.updateElement('player-level', `Lv.${player.level}`);
        this.updateElement('player-hp', `${player.attributes.health}/${player.attributes.maxHealth}`);
        this.updateElement('player-attack', player.attributes.attack.toString());
        this.updateElement('player-defense', player.attributes.defense.toString());
        this.updateElement('player-agility', player.attributes.agility.toString());
        this.updateElement('player-luck', player.attributes.luck.toString());
        this.updateElement('gold-display', `💰 ${Math.floor(player.gold)}`);
        this.updateElement('diamond-display', `💎 ${Math.floor(player.diamonds)}`);
        // 更新经验条
        this.updateProgressBar('exp-progress', player.experience, player.getRequiredExp());
        this.updateElement('exp-text', `${Math.floor(player.experience)}/${Math.floor(player.getRequiredExp())}`);
        // 更新可用属性点和按钮状态
        if (player.availablePoints > 0) {
            this.showElement('level-up-btn');
            this.updateElement('available-points', `可用属性点: ${player.availablePoints}`);
            this.showElement('available-points');
            // 启用所有属性升级按钮
            this.updateAttributeButtons(true);
        }
        else {
            this.hideElement('level-up-btn');
            this.hideElement('available-points');
            // 禁用所有属性升级按钮
            this.updateAttributeButtons(false);
        }
        // 更新炼金炉信息
        this.updateAlchemyInfo(player);
    }
    updateAttributeButtons(enabled) {
        const attributes = ['health', 'attack', 'defense', 'agility', 'luck'];
        attributes.forEach(attr => {
            const btn = document.getElementById(`upgrade-${attr}-btn`);
            if (btn) {
                btn.disabled = !enabled;
            }
        });
    }
    updateAlchemyInfo(player) {
        // 更新炼金炉等级
        this.updateElement('alchemy-level', player.alchemyFurnace.level.toString());
        // 更新产量显示
        const productionRate = Math.floor(player.getAlchemyProductionRate());
        const intervalSeconds = player.getAlchemyInterval() / 1000; // 转换为秒
        this.updateElement('alchemy-production', `${productionRate}金币/${intervalSeconds}秒`);
        // 更新总产出
        this.updateElement('alchemy-total', Math.floor(player.alchemyFurnace.totalProduced).toString());
        // 更新升级费用
        const upgradeCost = Math.floor(player.getAlchemyUpgradeCost());
        this.updateElement('upgrade-cost', upgradeCost.toString());
        // 更新升级按钮状态
        const upgradeBtn = document.getElementById('upgrade-alchemy-btn');
        if (upgradeBtn) {
            upgradeBtn.disabled = !player.canUpgradeAlchemy();
        }
        // 更新生产进度
        const timeToNext = player.getNextProductionTime();
        const intervalMs = player.getAlchemyInterval();
        const progress = ((intervalMs - timeToNext) / intervalMs) * 100;
        this.updateProgressBar('alchemy-progress', intervalMs - timeToNext, intervalMs);
        this.updateElement('alchemy-time', `${Math.ceil(timeToNext / 1000)}s`);
    }
    updateEnemyInfo(enemy) {
        if (!enemy) {
            this.updateElement('enemy-name', '等待敌人...');
            this.updateElement('enemy-hp-text', '-/-');
            this.updateProgressBar('enemy-hp-progress', 0, 1);
            return;
        }
        const displayName = enemy.name + (enemy.isBoss ? ' (Boss)' : '');
        this.updateElement('enemy-name', displayName);
        this.updateElement('enemy-hp-text', `${enemy.attributes.health}/${enemy.attributes.maxHealth}`);
        this.updateProgressBar('enemy-hp-progress', enemy.attributes.health, enemy.attributes.maxHealth);
    }
    updateBattleStatus(status) {
        const statusNames = {
            'idle': '空闲',
            'fighting': '战斗中',
            'stage_completed': '关卡完成',
            'player_defeated': '玩家失败',
            'reviving': '复活中...'
        };
        this.updateElement('battle-status', statusNames[status] || status);
    }
    updateStageInfo(stageLevel, enemiesDefeated, totalEnemies) {
        this.updateElement('current-stage', `第${stageLevel}关`);
        this.updateElement('enemies-defeated', `${enemiesDefeated}/${totalEnemies}`);
        this.updateProgressBar('stage-progress-fill', enemiesDefeated, totalEnemies);
    }
    addBattleMessage(message, type = 'info') {
        if (!this.messageContainer)
            return;
        const messageElement = document.createElement('div');
        messageElement.className = `battle-message ${type}`;
        messageElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.messageContainer.appendChild(messageElement);
        // 限制消息数量
        const messages = this.messageContainer.children;
        if (messages.length > 50) {
            this.messageContainer.removeChild(messages[0]);
        }
        // 滚动到底部
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    showNotification(message, type = 'info') {
        // 简化的通知实现
        console.log(`[${type.toUpperCase()}] ${message}`);
        this.addBattleMessage(message, type);
    }
    showModal(title, content, buttons) {
        // 简化的模态框实现
        const result = confirm(`${title}\n\n${content}`);
        if (result && buttons.length > 0) {
            buttons[0].action();
        }
    }
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    updateProgressBar(id, current, max) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            const percentage = max > 0 ? (current / max) * 100 : 0;
            progressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        }
    }
    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = '';
        }
    }
    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }
}
//# sourceMappingURL=ui-manager.js.map