import { Player } from '../models/player.js';
import { Enemy } from '../models/enemy.js';
import type { BattleState, MessageType } from '../models/interfaces/game-types.js';

export class UIManager {
    private messageContainer: HTMLElement | null;

    constructor() {
        this.messageContainer = document.getElementById('battle-messages');
    }

    updatePlayerInfo(player: Player): void {
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
        } else {
            this.hideElement('level-up-btn');
            this.hideElement('available-points');
            
            // 禁用所有属性升级按钮
            this.updateAttributeButtons(false);
        }

        // 更新炼金炉信息
        this.updateAlchemyInfo(player);
    }

    private updateAttributeButtons(enabled: boolean): void {
        const attributes = ['health', 'attack', 'defense', 'agility', 'luck'];
        attributes.forEach(attr => {
            const btn = document.getElementById(`upgrade-${attr}-btn`) as HTMLButtonElement;
            if (btn) {
                btn.disabled = !enabled;
            }
        });
    }

    private updateAlchemyInfo(player: Player): void {
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
        const upgradeBtn = document.getElementById('upgrade-alchemy-btn') as HTMLButtonElement;
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

    updateEnemyInfo(enemy: Enemy | null): void {
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

    updateBattleStatus(status: BattleState): void {
        const statusNames: Record<BattleState, string> = {
            'idle': '空闲',
            'fighting': '战斗中',
            'stage_completed': '关卡完成',
            'player_defeated': '玩家失败',
            'reviving': '复活中...'
        };
        this.updateElement('battle-status', statusNames[status] || status);
    }

    updateStageInfo(stageLevel: number, enemiesDefeated: number, totalEnemies: number): void {
        this.updateElement('current-stage', `第${stageLevel}关`);
        this.updateElement('enemies-defeated', `${enemiesDefeated}/${totalEnemies}`);
        this.updateProgressBar('stage-progress-fill', enemiesDefeated, totalEnemies);
    }

    addBattleMessage(message: string, type: MessageType = 'info'): void {
        if (!this.messageContainer) return;

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

    showNotification(message: string, type: MessageType = 'info'): void {
        // 简化的通知实现
        this.addBattleMessage(message, type);
    }

    showModal(title: string, content: string, buttons: Array<{ text: string; action: () => void; type?: string }>): void {
        try {
            // 创建模态框容器
            const modalContainer = document.getElementById('modal-container') || document.body;
            
            // 创建模态框
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;
            
            // 创建模态框内容
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                min-width: 300px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            
            // 添加标题
            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.cssText = `
                color: #333;
                margin-bottom: 15px;
                font-size: 20px;
                font-weight: 700;
            `;
            
            // 添加内容
            const contentElement = document.createElement('p');
            contentElement.textContent = content;
            contentElement.style.cssText = `
                color: #666;
                margin-bottom: 25px;
                font-size: 16px;
                line-height: 1.5;
            `;
            
            // 添加按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: center;
            `;
            
            // 创建按钮
            buttons.forEach(buttonConfig => {
                const button = document.createElement('button');
                button.textContent = buttonConfig.text;
                button.style.cssText = `
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    ${buttonConfig.type === 'primary' 
                        ? 'background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white;'
                        : 'background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); color: white;'
                    }
                `;
                
                button.addEventListener('click', () => {
                    try {
                        buttonConfig.action();
                        modal.remove();
                    } catch (error) {
                        console.error('Button action error:', error);
                        modal.remove();
                    }
                });
                
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = 'none';
                });
                
                buttonContainer.appendChild(button);
            });
            
            // 组装模态框
            modalContent.appendChild(titleElement);
            modalContent.appendChild(contentElement);
            modalContent.appendChild(buttonContainer);
            modal.appendChild(modalContent);
            
            // 添加到页面
            modalContainer.appendChild(modal);
            
            // 点击背景关闭模态框
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('Error creating modal:', error);
            // 降级到简单的confirm对话框
            const result = confirm(`${title}\n\n${content}`);
            if (result && buttons.length > 0) {
                buttons[0].action();
            }
        }
    }

    private updateElement(id: string, content: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    private updateProgressBar(id: string, current: number, max: number): void {
        const progressBar = document.getElementById(id) as HTMLElement;
        if (progressBar) {
            const percentage = max > 0 ? (current / max) * 100 : 0;
            progressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        }
    }

    private showElement(id: string): void {
        const element = document.getElementById(id) as HTMLElement;
        if (element) {
            element.style.display = '';
        }
    }

    private hideElement(id: string): void {
        const element = document.getElementById(id) as HTMLElement;
        if (element) {
            element.style.display = 'none';
        }
    }
}