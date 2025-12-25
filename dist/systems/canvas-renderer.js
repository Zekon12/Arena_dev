export class CanvasRenderer {
    constructor(canvasId) {
        this.playerPos = { x: 100, y: 150 };
        this.enemyPos = { x: 300, y: 150 };
        this.player = null;
        this.enemy = null;
        const canvas = document.getElementById(canvasId);
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
    setupBattle(player, enemy) {
        this.player = player;
        this.enemy = enemy;
    }
    update() {
        this.render();
    }
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#e3f2fd');
        gradient.addColorStop(1, '#bbdefb');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制玩家
        if (this.player) {
            this.drawCharacter(this.playerPos.x, this.playerPos.y, '勇', '#2196f3', this.player);
        }
        // 绘制敌人
        if (this.enemy) {
            const isBoss = 'isBoss' in this.enemy ? this.enemy.isBoss : false;
            this.drawCharacter(this.enemyPos.x, this.enemyPos.y, isBoss ? '王' : '敌', '#f44336', this.enemy);
        }
    }
    drawCharacter(x, y, text, color, character) {
        const radius = 30;
        // 绘制角色圆形
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color === '#2196f3' ? '#1976d2' : '#d32f2f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        // 绘制角色文字
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        // 绘制生命值条
        if (character) {
            this.drawHealthBar(character, x, y - 50);
        }
    }
    drawHealthBar(character, centerX, y) {
        const barWidth = 60;
        const barHeight = 6;
        const x = centerX - barWidth / 2;
        const healthPercent = character.attributes.health / character.attributes.maxHealth;
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        // 生命值
        this.ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' :
            healthPercent > 0.2 ? '#ff9800' : '#f44336';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        // 边框
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }
    getPlayerPosition() {
        return this.playerPos;
    }
    getEnemyPosition() {
        return this.enemyPos;
    }
    clearBattle() {
        this.player = null;
        this.enemy = null;
        // 清空画布并绘制空背景
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制空闲状态背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f5f5f5');
        gradient.addColorStop(1, '#e0e0e0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // 显示等待文字
        this.ctx.fillStyle = '#666';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('等待战斗开始...', this.canvas.width / 2, this.canvas.height / 2);
    }
}
//# sourceMappingURL=canvas-renderer.js.map