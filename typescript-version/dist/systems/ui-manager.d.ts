import { Player } from '../models/player.js';
import { Enemy } from '../models/enemy.js';
import type { BattleState, MessageType } from '../types/game-types.js';
export declare class UIManager {
    private messageContainer;
    constructor();
    updatePlayerInfo(player: Player): void;
    private updateAttributeButtons;
    private updateAlchemyInfo;
    updateEnemyInfo(enemy: Enemy | null): void;
    updateBattleStatus(status: BattleState): void;
    updateStageInfo(stageLevel: number, enemiesDefeated: number, totalEnemies: number): void;
    addBattleMessage(message: string, type?: MessageType): void;
    showNotification(message: string, type?: MessageType): void;
    showModal(title: string, content: string, buttons: Array<{
        text: string;
        action: () => void;
        type?: string;
    }>): void;
    private updateElement;
    private updateProgressBar;
    private showElement;
    private hideElement;
}
