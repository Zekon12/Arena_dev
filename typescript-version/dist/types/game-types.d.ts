export interface Attributes {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    agility: number;
    luck: number;
}
export interface AlchemyFurnace {
    level: number;
    lastProductionTime: number;
    totalProduced: number;
}
export interface Rewards {
    experience: number;
    gold: number;
    dropRate: number;
}
export interface DamageEvent {
    attacker: Character;
    defender: Character;
    damage: number;
    isCritical: boolean;
}
export interface BattleResult {
    winner: Character;
    loser: Character;
    totalDamageDealt?: number;
}
export interface ReviveEvent {
    type: 'countdown' | 'revived';
    time?: number;
}
export interface StageProgress {
    currentStage: number;
    enemiesDefeated: number;
    totalEnemies: number;
    isCompleted: boolean;
}
export interface Position {
    x: number;
    y: number;
}
export interface VisualEffect {
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
    duration: number;
    startTime: number;
}
export interface Character {
    id: string;
    name: string;
    level: number;
    attributes: Attributes;
    takeDamage(damage: number): void;
    isDead(): boolean;
}
export type BattleState = 'idle' | 'fighting' | 'stage_completed' | 'player_defeated' | 'reviving';
export type MessageType = 'info' | 'damage' | 'heal' | 'critical' | 'warning' | 'error' | 'success';
