import Phaser from 'phaser';
import { ScoreManager, IRankInfo } from '../utils/ScoreManager';
import { Difficulty } from '../types';
import { ITaskUpdateResult, TaskType } from '../utils/TaskManager';

interface GameOverData {
  winner: 'landlord' | 'farmer';
  winnerName: string;
  scoreChange: number;
  isPlayerWin: boolean;
  baseScore: number;
  multiplier: number;
  playerIsLandlord: boolean;
  taskUpdateResult?: ITaskUpdateResult;
}

export class GameOverScene extends Phaser.Scene {
  private gameData!: GameOverData;
  private playerStats!: ReturnType<typeof ScoreManager.getDefaultPlayerStats>;
  private rankInfo!: IRankInfo;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.gameData = data;
    this.playerStats = ScoreManager.loadPlayerStats('player_0', '玩家');
    this.rankInfo = ScoreManager.getRankInfo(this.playerStats.totalScore);
  }

  create(): void {
    this.createBackground();
    this.createResultPanel();
    this.createScoreDetails();
    this.createButtons();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a5c3a, 0x0d3d24, 0x1a5c3a, 0x0d3d24);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    this.add.graphics()
      .lineStyle(3, 0x2d7a4c, 0.5)
      .strokeRoundedRect(20, 20, this.scale.width - 40, this.scale.height - 40, 25);
  }

  private createResultPanel(): void {
    const panelY = 150;
    const panelHeight = 200;

    const panel = this.add.graphics();
    panel.fillStyle(this.gameData.isPlayerWin ? 0x4caf50 : 0xf44336, 0.9);
    panel.fillRoundedRect(50, panelY, this.scale.width - 100, panelHeight, 20);
    panel.lineStyle(4, this.gameData.isPlayerWin ? 0x388e3c : 0xd32f2f, 1);
    panel.strokeRoundedRect(50, panelY, this.scale.width - 100, panelHeight, 20);

    const icon = this.gameData.isPlayerWin ? '🎉' : '😢';
    this.add.text(this.scale.width / 2, panelY + 50, icon, {
      font: '60px Arial'
    }).setOrigin(0.5);

    const resultText = this.gameData.isPlayerWin ? '恭喜获胜！' : '很遗憾，输了...';
    this.add.text(this.scale.width / 2, panelY + 110, resultText, {
      font: 'bold 32px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const winnerText = this.gameData.winner === 'landlord' 
      ? `地主 ${this.gameData.winnerName} 获胜` 
      : `农民 ${this.gameData.winnerName} 获胜`;
    
    this.add.text(this.scale.width / 2, panelY + 155, winnerText, {
      font: '18px Arial',
      color: '#e8f5e9'
    }).setOrigin(0.5);
  }

  private createScoreDetails(): void {
    const startY = 400;
    const height = 280;

    const panel = this.add.graphics();
    panel.fillStyle(0x14522a, 0.9);
    panel.fillRoundedRect(50, startY, this.scale.width - 100, height, 15);
    panel.lineStyle(2, 0x3d8c5a, 0.6);
    panel.strokeRoundedRect(50, startY, this.scale.width - 100, height, 15);

    this.add.text(this.scale.width / 2, startY + 25, '比赛详情', {
      font: 'bold 22px Arial',
      color: '#ffd700'
    }).setOrigin(0.5);

    let y = startY + 60;
    const leftX = 80;
    const rightX = this.scale.width - 80;

    const details = [
      { label: '玩家身份', value: this.gameData.playerIsLandlord ? '地主' : '农民' },
      { label: '基础分', value: this.gameData.baseScore.toString() },
      { label: '当前倍数', value: `${this.gameData.multiplier}倍` },
      { label: '积分变化', value: this.gameData.scoreChange > 0 ? `+${this.gameData.scoreChange}` : this.gameData.scoreChange.toString() }
    ];

    details.forEach((detail, index) => {
      const itemY = y + index * 50;
      
      this.add.text(leftX, itemY, detail.label, {
        font: '18px Arial',
        color: '#a5d6a7'
      });

      const valueColor = detail.label === '积分变化' 
        ? (this.gameData.scoreChange > 0 ? '#4caf50' : '#f44336')
        : '#ffffff';

      this.add.text(rightX, itemY, detail.value, {
        font: 'bold 18px Arial',
        color: valueColor
      }).setOrigin(1, 0);
    });

    const dividerY = y + 200;
    this.add.graphics()
      .lineStyle(1, 0x3d8c5a, 0.4)
      .lineBetween(70, dividerY, this.scale.width - 70, dividerY);

    this.add.text(leftX, dividerY + 25, `当前段位: ${this.rankInfo.icon} ${this.rankInfo.name}`, {
      font: '18px Arial',
      color: '#ffd700'
    });

    this.add.text(rightX, dividerY + 25, `总积分: ${this.playerStats.totalScore}`, {
      font: 'bold 18px Arial',
      color: '#ffffff'
    }).setOrigin(1, 0);
  }

  private createButtons(): void {
    const y = 730;
    const buttonWidth = (this.scale.width - 140) / 2;
    const spacing = 40;

    const againX = 50;
    const againButton = this.add.graphics();
    againButton.fillStyle(0xff6b35, 1);
    againButton.fillRoundedRect(againX, y, buttonWidth, 60, 12);

    this.add.text(againX + buttonWidth / 2, y + 30, '再来一局', {
      font: 'bold 22px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const againZone = this.add.zone(againX + buttonWidth / 2, y + 30, buttonWidth, 60);
    againZone.setInteractive();
    againZone.on('pointerdown', () => {
      this.scene.start('GameScene', {
        difficulty: Difficulty.MEDIUM,
        playerName: '玩家'
      });
    });

    const menuX = againX + buttonWidth + spacing;
    const menuButton = this.add.graphics();
    menuButton.fillStyle(0x757575, 1);
    menuButton.fillRoundedRect(menuX, y, buttonWidth, 60, 12);

    this.add.text(menuX + buttonWidth / 2, y + 30, '返回菜单', {
      font: 'bold 22px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const menuZone = this.add.zone(menuX + buttonWidth / 2, y + 30, buttonWidth, 60);
    menuZone.setInteractive();
    menuZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    const statsY = 830;
    this.add.text(this.scale.width / 2, statsY, `战绩: ${this.playerStats.wins}胜 ${this.playerStats.losses}负`, {
      font: '16px Arial',
      color: '#a5d6a7'
    }).setOrigin(0.5);

    if (this.playerStats.currentWinStreak > 1) {
      this.add.text(this.scale.width / 2, statsY + 30, `🔥 当前连胜: ${this.playerStats.currentWinStreak}局`, {
        font: 'bold 16px Arial',
        color: '#ffd700'
      }).setOrigin(0.5);
    }

    this.time.delayedCall(800, () => {
      this.showTaskProgressPopup();
    });
  }

  private showTaskProgressPopup(): void {
    if (!this.gameData.taskUpdateResult || this.gameData.taskUpdateResult.updatedTasks.length === 0) {
      return;
    }

    const popupElements: Phaser.GameObjects.GameObject[] = [];
    const { updatedTasks } = this.gameData.taskUpdateResult;
    const hasCompleted = updatedTasks.some(t => t.justCompleted);
    const totalItems = updatedTasks.length;

    const itemHeight = 85;
    const headerHeight = 80;
    const footerHeight = 80;
    const contentHeight = totalItems * itemHeight;
    const popupHeight = Math.min(this.scale.height - 100, headerHeight + contentHeight + footerHeight);
    const popupY = (this.scale.height - popupHeight) / 2;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    popupElements.push(overlay);

    const panel = this.add.graphics();
    panel.fillStyle(0x14522a, 1);
    panel.fillRoundedRect(40, popupY, this.scale.width - 80, popupHeight, 15);
    panel.lineStyle(3, hasCompleted ? 0xffd700 : 0x4caf50, 0.8);
    panel.strokeRoundedRect(40, popupY, this.scale.width - 80, popupHeight, 15);
    popupElements.push(panel);

    const titleText = hasCompleted ? '🎉 任务完成！' : '📋 任务进度';
    const title = this.add.text(this.scale.width / 2, popupY + 45, titleText, {
      font: 'bold 24px Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
    popupElements.push(title);

    let y = popupY + headerHeight;
    const itemWidth = this.scale.width - 120;
    const itemX = 60;

    updatedTasks.forEach(item => {
      const itemY = y;
      const isCompleted = item.justCompleted;

      const itemBg = this.add.graphics();
      itemBg.fillStyle(isCompleted ? 0x2e7d32 : 0x1a5c3a, 0.9);
      itemBg.fillRoundedRect(itemX, itemY, itemWidth, itemHeight - 10, 8);
      if (isCompleted) {
        itemBg.lineStyle(2, 0xffd700, 0.8);
        itemBg.strokeRoundedRect(itemX, itemY, itemWidth, itemHeight - 10, 8);
      }
      popupElements.push(itemBg);

      const typeIcon = item.task.type === TaskType.DAILY ? '📅' : '🏆';
      const iconText = this.add.text(itemX + 20, itemY + 20, `${typeIcon} ${item.task.icon}`, {
        font: '22px Arial'
      });
      popupElements.push(iconText);

      const titleItem = this.add.text(itemX + 70, itemY + 15, item.task.title, {
        font: 'bold 16px Arial',
        color: isCompleted ? '#ffd700' : '#ffffff'
      });
      popupElements.push(titleItem);

      const progressText = isCompleted 
        ? '✓ 已完成' 
        : `${item.previousProgress} → ${item.progress.current} / ${item.task.target}`;
      const progress = this.add.text(itemX + 70, itemY + 42, progressText, {
        font: '13px Arial',
        color: isCompleted ? '#4caf50' : '#a5d6a7'
      });
      popupElements.push(progress);

      if (isCompleted) {
        const reward = this.add.text(this.scale.width - 80, itemY + 35, `+${item.task.reward}`, {
          font: 'bold 16px Arial',
          color: '#ffb74d'
        }).setOrigin(1, 0.5);
        popupElements.push(reward);
      }

      y += itemHeight;
    });

    const closeBtnY = popupY + popupHeight - 55;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0xff6b35, 1);
    closeBtn.fillRoundedRect(this.scale.width / 2 - 70, closeBtnY, 140, 40, 8);
    popupElements.push(closeBtn);

    const closeText = this.add.text(this.scale.width / 2, closeBtnY + 20, '知道了', {
      font: 'bold 17px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    popupElements.push(closeText);

    const closeZone = this.add.zone(this.scale.width / 2, closeBtnY + 20, 140, 40);
    closeZone.setInteractive();
    closeZone.on('pointerdown', () => {
      popupElements.forEach(element => {
        if (element && element.active !== false) {
          element.destroy();
        }
      });
      closeZone.destroy();
    });
  }
}
