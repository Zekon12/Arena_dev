export declare class VisualEffects {
    private canvas;
    private ctx;
    private effects;
    constructor(canvasId: string);
    update(): void;
    private render;
    private renderEffect;
    createDamageEffect(x: number, y: number, damage: number, isCritical?: boolean): void;
    createHitEffect(x: number, y: number): void;
    createLevelUpEffect(x: number, y: number): void;
    createReviveEffect(x: number, y: number): void;
}
