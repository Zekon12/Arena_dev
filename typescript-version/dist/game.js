import { Player } from './models/player.js';
import { BattleManager } from './systems/battle-manager.js';
import { CanvasRenderer } from './systems/canvas-renderer.js';
import { VisualEffects } from './systems/visual-effects.js';
import { UIManager } from './systems/ui-manager.js';
export class Game {
    constructor() {
        this.updateInterval = null;
        // 检查离线收益
        this.checkOfflineRewards();
        // 创建玩家
        this.player = new Player();
        // 尝试加载保存的游戏数据
        this.loadGame();
        // 创建战斗管理器
        this.battleManager = new BattleManager(this.player);
        // 创建Canvas渲染器
        this.canvasRenderer = new CanvasRenderer('battle-canvas');
        // 创建视觉效果管理器
        this.visualEffects = new VisualEffects('effects-canvas');
        // 创建UI管理器
        this.uiManager = new UIManager();
        // 设置事件监听
        this.setupEventListeners();
        // 开始更新循环
        this.startUpdateLoop();
        // 初始化UI
        this.updateUI();
        console.log('🎮 完整游戏系统初始化完成！');
    }
    setupEventListeners() {
        // 战斗按钮
        const startBattleBtn = document.getElementById('start-battle-btn');
        const stopBattleBtn = document.getElementById('stop-battle-btn');
        const nextStageBtn = document.getElementById('next-stage-btn');
        const prevStageBtn = document.getElementById('prev-stage-btn');
        const levelUpBtn = document.getElementById('level-up-btn');
        const saveBtn = document.getElementById('save-btn');
        const resetBtn = document.getElementById('reset-btn');
        if (startBattleBtn)
            startBattleBtn.onclick = () => this.startBattle();
        if (stopBattleBtn)
            stopBattleBtn.onclick = () => this.stopBattle();
        if (nextStageBtn)
            nextStageBtn.onclick = () => this.nextStage();
        if (prevStageBtn)
            prevStageBtn.onclick = () => this.prevStage();
        if (levelUpBtn)
            levelUpBtn.onclick = () => this.showLevelUpDialog();
        if (saveBtn)
            saveBtn.onclick = () => this.saveGame();
        if (resetBtn)
            resetBtn.onclick = () => this.resetGame();
        // 炼金炉按钮
        const upgradeAlchemyBtn = document.getElementById('upgrade-alchemy-btn');
        const collectAlchemyBtn = document.getElementById('collect-alchemy-btn');
        if (upgradeAlchemyBtn)
            upgradeAlchemyBtn.onclick = () => this.upgradeAlchemy();
        if (collectAlchemyBtn)
            collectAlchemyBtn.onclick = () => this.collectAlchemy();
        // 战斗管理器事件
        this.battleManager.onBattleResult = (result) => this.handleBattleResult(result);
        this.battleManager.onDamageDealt = (event) => this.handleDamageEvent(event);
        this.battleManager.onEnemyDefeated = (enemy) => this.handleEnemyDefeated(enemy);
        this.battleManager.onPlayerLevelUp = (newLevel) => this.handlePlayerLevelUp(newLevel);
        this.battleManager.onPlayerRevive = (event) => this.handlePlayerRevive(event);
    }
    startUpdateLoop() {
        // 逻辑更新循环：10FPS (100ms) - 处理游戏逻辑
        this.updateInterval = window.setInterval(() => {
            this.updateLogic();
        }, 100);
        // 渲染更新循环：60FPS - 处理画面渲染
        this.startRenderLoop();
    }
    updateLogic() {
        // 只处理游戏逻辑，不涉及渲染
        this.player.collectAlchemyProduction();
        // 更新关卡按钮状态
        this.updateStageButtons();
    }
    startRenderLoop() {
        const render = () => {
            // 只处理渲染相关的更新
            this.updateUI();
            this.canvasRenderer.update();
            this.visualEffects.update();
            // 继续下一帧渲染
            requestAnimationFrame(render);
        };
        // 开始渲染循环
        requestAnimationFrame(render);
    }
    updateUI() {
        this.uiManager.updatePlayerInfo(this.player);
        this.uiManager.updateEnemyInfo(this.battleManager.getCurrentEnemy());
        this.uiManager.updateBattleStatus(this.battleManager.getState());
        const stageProgress = this.battleManager.getStageProgress();
        if (stageProgress) {
            this.uiManager.updateStageInfo(stageProgress.currentStage, stageProgress.enemiesDefeated, stageProgress.totalEnemies);
        }
    }
    startBattle() {
        const currentStage = this.battleManager.getStageProgress()?.currentStage || 1;
        if (this.battleManager.startStage(currentStage)) {
            this.uiManager.addBattleMessage(`开始第 ${currentStage} 关挑战！`, 'info');
            const currentEnemy = this.battleManager.getCurrentEnemy();
            if (currentEnemy) {
                this.canvasRenderer.setupBattle(this.player, currentEnemy);
            }
        }
    }
    stopBattle() {
        const currentState = this.battleManager.getState();
        this.battleManager.stopBattle();
        // 根据当前状态提供不同的反馈
        if (currentState === 'fighting') {
            this.uiManager.addBattleMessage('战斗已停止', 'info');
        }
        else if (currentState === 'reviving') {
            this.uiManager.addBattleMessage('复活倒计时已取消，玩家已复活', 'heal');
        }
        else if (currentState === 'player_defeated') {
            this.uiManager.addBattleMessage('战斗已停止，玩家已复活', 'heal');
        }
        else {
            this.uiManager.addBattleMessage('战斗已停止', 'info');
        }
        // 清除画布上的战斗场景
        this.canvasRenderer.clearBattle();
    }
    nextStage() {
        const currentStage = this.battleManager.getStageProgress()?.currentStage || 1;
        const nextStage = currentStage + 1;
        this.battleManager.resetStage();
        if (this.battleManager.startStage(nextStage)) {
            this.uiManager.addBattleMessage(`跳转到第 ${nextStage} 关`, 'info');
            const currentEnemy = this.battleManager.getCurrentEnemy();
            if (currentEnemy) {
                this.canvasRenderer.setupBattle(this.player, currentEnemy);
            }
        }
        this.updateStageButtons();
    }
    prevStage() {
        const currentStage = this.battleManager.getStageProgress()?.currentStage || 1;
        if (currentStage <= 1) {
            this.uiManager.showNotification('已经是第一关了！', 'warning');
            return;
        }
        const prevStage = currentStage - 1;
        this.battleManager.resetStage();
        if (this.battleManager.startStage(prevStage)) {
            this.uiManager.addBattleMessage(`返回到第 ${prevStage} 关`, 'info');
            const currentEnemy = this.battleManager.getCurrentEnemy();
            if (currentEnemy) {
                this.canvasRenderer.setupBattle(this.player, currentEnemy);
            }
        }
        this.updateStageButtons();
    }
    updateStageButtons() {
        const currentStage = this.battleManager.getStageProgress()?.currentStage || 1;
        const prevBtn = document.getElementById('prev-stage-btn');
        if (prevBtn) {
            prevBtn.disabled = currentStage <= 1;
        }
    }
    handleBattleResult(result) {
        const isPlayerWin = result.winner.id === this.player.id;
        if (isPlayerWin) {
            this.uiManager.addBattleMessage(`胜利！造成 ${result.totalDamageDealt || 0} 伤害，获得奖励！`, 'heal');
        }
        else {
            this.uiManager.addBattleMessage('战斗失败！', 'damage');
        }
    }
    handleDamageEvent(event) {
        const isPlayerAttack = event.attacker.id === this.player.id;
        const attackerName = isPlayerAttack ? '玩家' : event.attacker.name;
        const defenderName = isPlayerAttack ? event.defender.name : '玩家';
        const critText = event.isCritical ? ' (暴击!)' : '';
        const message = `${attackerName} 对 ${defenderName} 造成 ${event.damage} 伤害${critText}`;
        this.uiManager.addBattleMessage(message, event.isCritical ? 'critical' : 'damage');
        // 添加视觉效果
        const pos = isPlayerAttack ?
            this.canvasRenderer.getEnemyPosition() :
            this.canvasRenderer.getPlayerPosition();
        if (pos) {
            this.visualEffects.createDamageEffect(pos.x, pos.y, event.damage, event.isCritical);
        }
    }
    handleEnemyDefeated(enemy) {
        this.uiManager.addBattleMessage(`${enemy.name} 被击败！获得 ${enemy.rewards.experience} 经验，${enemy.rewards.gold} 金币`, 'heal');
        // 添加击败效果
        const pos = this.canvasRenderer.getEnemyPosition();
        if (pos) {
            this.visualEffects.createHitEffect(pos.x, pos.y);
        }
    }
    handlePlayerLevelUp(newLevel) {
        this.uiManager.addBattleMessage(`恭喜升级到 Lv.${newLevel}！`, 'heal');
        this.uiManager.showNotification(`升级到 Lv.${newLevel}！`, 'success');
        // 添加升级效果
        const pos = this.canvasRenderer.getPlayerPosition();
        if (pos) {
            this.visualEffects.createLevelUpEffect(pos.x, pos.y);
        }
    }
    handlePlayerRevive(event) {
        if (event.type === 'countdown') {
            // 显示复活倒计时
            this.uiManager.addBattleMessage(`${event.time}秒后复活...`, 'info');
        }
        else if (event.type === 'revived') {
            // 玩家复活
            this.uiManager.addBattleMessage('玩家复活！战斗继续！', 'heal');
            this.uiManager.showNotification('复活成功！', 'success');
            // 添加复活效果
            const pos = this.canvasRenderer.getPlayerPosition();
            if (pos) {
                this.visualEffects.createReviveEffect(pos.x, pos.y);
            }
        }
    }
    showLevelUpDialog() {
        if (this.player.availablePoints <= 0)
            return;
        this.uiManager.showModal('属性升级', `可用属性点: ${this.player.availablePoints}\n选择要提升的属性:`, [
            { text: '攻击力 +1', action: () => this.allocateAttribute('attack', 1) },
            { text: '防御力 +1', action: () => this.allocateAttribute('defense', 1) },
            { text: '敏捷 +1', action: () => this.allocateAttribute('agility', 1) },
            { text: '幸运 +1', action: () => this.allocateAttribute('luck', 1) },
            { text: '取消', action: () => { }, type: 'secondary' }
        ]);
    }
    allocateAttribute(attribute, points) {
        if (this.player.allocateAttribute(attribute, points)) {
            this.uiManager.showNotification(`${attribute} +${points}`, 'success');
        }
    }
    // 新增：单个属性升级方法
    upgradeAttribute(attribute) {
        if (this.player.availablePoints <= 0) {
            this.uiManager.showNotification('没有可用属性点！', 'warning');
            return;
        }
        if (this.player.allocateAttribute(attribute, 1)) {
            const attributeNames = {
                'health': '生命值',
                'attack': '攻击力',
                'defense': '防御力',
                'agility': '敏捷',
                'luck': '幸运'
            };
            this.uiManager.showNotification(`${attributeNames[attribute]} +1`, 'success');
            this.uiManager.addBattleMessage(`提升了 ${attributeNames[attribute]}`, 'heal');
        }
        else {
            this.uiManager.showNotification('升级失败！', 'error');
        }
    }
    saveGame() {
        // 更新最后保存时间
        this.player.alchemyFurnace.lastProductionTime = Date.now();
        const saveData = {
            player: this.player.toJSON(),
            stage: this.battleManager.getStageProgress()?.currentStage || 1,
            timestamp: Date.now()
        };
        localStorage.setItem('idle_game_save', JSON.stringify(saveData));
        this.uiManager.showNotification('游戏已保存', 'success');
    }
    resetGame() {
        this.uiManager.showModal('重置游戏', '确定要重置所有进度吗？此操作不可撤销！', [
            {
                text: '确定重置',
                action: () => {
                    localStorage.removeItem('idle_game_save');
                    location.reload();
                },
                type: 'primary'
            },
            { text: '取消', action: () => { }, type: 'secondary' }
        ]);
    }
    // 炼金炉相关方法
    upgradeAlchemy() {
        if (this.player.upgradeAlchemy()) {
            this.uiManager.showNotification('炼金炉升级成功！', 'success');
            this.uiManager.addBattleMessage(`炼金炉升级到 Lv.${this.player.alchemyFurnace.level}`, 'heal');
        }
        else {
            this.uiManager.showNotification('金币不足，无法升级！', 'warning');
        }
    }
    collectAlchemy() {
        const production = this.player.collectAlchemyProduction();
        if (production > 0) {
            this.uiManager.showNotification(`收集了 ${production} 金币！`, 'success');
            this.uiManager.addBattleMessage(`炼金炉产出 ${production} 金币`, 'heal');
        }
        else {
            this.uiManager.showNotification('暂无可收集的产出', 'info');
        }
    }
    checkOfflineRewards() {
        const saveData = localStorage.getItem('idle_game_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                const lastSaveTime = data.timestamp || Date.now();
                const offlineTime = Date.now() - lastSaveTime;
                // 如果离线超过1分钟，显示离线收益
                if (offlineTime > 60000) {
                    this.showOfflineRewards(offlineTime, data);
                }
            }
            catch (error) {
                console.error('读取存档失败:', error);
            }
        }
    }
    showOfflineRewards(offlineTime, saveData) {
        // 创建临时玩家对象计算离线收益
        const tempPlayer = new Player();
        if (saveData.player && saveData.player.alchemyFurnace) {
            tempPlayer.fromJSON(saveData.player);
        }
        const offlineProduction = Math.floor(tempPlayer.getOfflineProduction(offlineTime));
        const offlineHours = Math.floor(offlineTime / (1000 * 60 * 60));
        const offlineMinutes = Math.floor((offlineTime % (1000 * 60 * 60)) / (1000 * 60));
        // 创建离线收益模态框
        const modal = document.createElement('div');
        modal.className = 'offline-modal';
        modal.innerHTML = `
            <div class="offline-content">
                <div class="offline-title">🌙 离线收益</div>
                <div class="offline-time">离线时间: ${offlineHours}小时 ${offlineMinutes}分钟</div>
                <div class="offline-rewards">
                    <div>炼金炉持续工作中...</div>
                    <div class="offline-gold">+${offlineProduction} 💰</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #ffc107; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    收取奖励
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        // 点击收取后更新玩家数据
        const button = modal.querySelector('button');
        if (button) {
            button.onclick = () => {
                // 这里会在loadGame中处理离线收益
                modal.remove();
            };
        }
    }
    loadGame() {
        const saveData = localStorage.getItem('idle_game_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                if (data.player) {
                    this.player.fromJSON(data.player);
                    // 计算并添加离线收益
                    const lastSaveTime = data.timestamp || Date.now();
                    const offlineTime = Date.now() - lastSaveTime;
                    const offlineProduction = this.player.getOfflineProduction(offlineTime);
                    if (offlineProduction > 0) {
                        this.player.gold += offlineProduction;
                        this.player.alchemyFurnace.totalProduced += offlineProduction;
                    }
                    // 更新最后生产时间
                    this.player.alchemyFurnace.lastProductionTime = Date.now();
                }
                console.log('游戏数据加载成功');
            }
            catch (error) {
                console.error('加载游戏数据失败:', error);
            }
        }
    }
}
//# sourceMappingURL=game.js.map