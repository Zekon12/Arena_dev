// 角色接口定义

export interface States{
    health: number;
    maxHealth: number;
    minAttack: number,
    maxAttack: number;
    attackSpeed: number;
    criticalRate: number;
    criticalMultiplier: number;
    armor: number;
    blockSkill: number,
    blockValue: number,
    dougeSkill: number,
    parrySkill: number,
    stance: Stance
}

enum Stance {
    Aggresive,
    Balance,
    Defensive
}

export interface Attributes {
    stength: number;
    agility: number;
    stamina: number;
    basicHealth: number;
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