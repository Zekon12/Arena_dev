import { Game } from './game.js';
// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function () {
    window.game = new Game();
    // 页面关闭时自动保存
    window.addEventListener('beforeunload', function () {
        if (window.game) {
            window.game.saveGame();
        }
    });
    // 定期自动保存（每30秒）
    setInterval(() => {
        if (window.game) {
            window.game.saveGame();
        }
    }, 30000);
});
//# sourceMappingURL=main.js.map