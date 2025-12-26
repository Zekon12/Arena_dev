import type { VisualEffect } from '../models/interfaces/game-types.js';

export class VisualEffects {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private effects: VisualEffect[] = [];

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = ctx;
    }

    update(): void {
        this.render();
    }

    private render(): void {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染所有效果
        const currentTime = Date.now();
        this.effects = this.effects.filter(effect => {
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;
            
            if (progress >= 1) return false;
            
            this.renderEffect(effect, progress);
            return true;
        });
    }

    private renderEffect(effect: VisualEffect, progress: number): void {
        const alpha = 1 - progress;
        const offsetY = -progress * 50;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.font = `bold ${effect.fontSize}px Arial`;
        this.ctx.fillStyle = effect.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText(effect.text, effect.x, effect.y + offsetY);
        this.ctx.restore();
    }

    createDamageEffect(x: number, y: number, damage: number, isCritical: boolean = false): void {
        this.effects.push({
            x, y,
            text: damage.toString(),
            color: isCritical ? '#ff1744' : '#ff5722',
            fontSize: isCritical ? 24 : 18,
            duration: 1500,
            startTime: Date.now()
        });
    }

    createHitEffect(x: number, y: number): void {
        this.effects.push({
            x, y,
            text: 'HIT!',
            color: '#ff5722',
            fontSize: 16,
            duration: 800,
            startTime: Date.now()
        });
    }

    createLevelUpEffect(x: number, y: number): void {
        this.effects.push({
            x, y,
            text: 'LEVEL UP!',
            color: '#ffc107',
            fontSize: 20,
            duration: 2000,
            startTime: Date.now()
        });
    }

    createReviveEffect(x: number, y: number): void {
        this.effects.push({
            x, y,
            text: 'REVIVED!',
            color: '#28a745',
            fontSize: 22,
            duration: 2500,
            startTime: Date.now()
        });
    }

    clearAllEffects(): void {
        this.effects = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}