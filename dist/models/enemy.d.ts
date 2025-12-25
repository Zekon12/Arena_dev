import type { Attributes, Rewards, Character } from '../types/game-types.js';
export declare class Enemy implements Character {
    id: string;
    stageLevel: number;
    level: number;
    isBoss: boolean;
    name: string;
    attributes: Attributes;
    rewards: Rewards;
    constructor(stageLevel: number, isBoss?: boolean);
    private generateName;
    private generateAttributes;
    private calculateRewards;
    takeDamage(damage: number): void;
    isDead(): boolean;
    resetHealth(): void;
}
