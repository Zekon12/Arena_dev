import type { Character, Position } from '../types/game-types.js';
export declare class CanvasRenderer {
    private canvas;
    private ctx;
    private playerPos;
    private enemyPos;
    private player;
    private enemy;
    constructor(canvasId: string);
    setupBattle(player: Character, enemy: Character): void;
    update(): void;
    private render;
    private drawCharacter;
    private drawHealthBar;
    getPlayerPosition(): Position;
    getEnemyPosition(): Position;
    clearBattle(): void;
}
