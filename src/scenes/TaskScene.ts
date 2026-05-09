import Phaser from 'phaser';
import { TaskManager, ITaskData, ITaskDefinition, ITaskProgress } from '../utils/TaskManager';
import { ScoreManager } from '../utils/ScoreManager';

export class TaskScene extends Phaser.Scene {
  private taskData!: ITaskData;
  private activeTab: 'daily' | 'achievement' = 'daily';
  private contentElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'TaskScene' });
  }

  create(): void {
    this.taskData = TaskManager.loadTaskData();
    this.createBackground();
    this.createHeader();
    this.createTabs();
    this.renderContent();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a5c3a, 0x0d3d24, 0x1a5c3a, 0x0d3d24);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    this.add.graphics()
      .lineStyle(3, 0x2d7a4c, 0.5)
      .strokeRoundedRect(20, 20, this.scale.width - 40, this.scale.height - 40, 25);
  }

  private createHeader(): void {
    const backBtn = this.add.graphics();
    backBtn.fillStyle(0x555555, 0.8);
    backBtn.fillRoundedRect(30, 30, 60, 40, 8);

    this.add.text(60, 50, '返回', {
      font: '16px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const backZone = this.add.zone(60, 50, 60, 40);
    backZone.setInteractive();
    backZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.add.text(this.scale.width / 2, 50, '任务中心', {
      font: 'bold 28px Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
  }

  private createTabs(): void {
    const tabY = 100;
    const tabWidth = (this.scale.width - 100) / 2;
    const tabHeight = 60;

    const dailyBtn = this.add.graphics();
    dailyBtn.fillStyle(this.activeTab === 'daily' ? 0xff6b35 : 0x2d7a4c, 1);
    dailyBtn.fillRoundedRect(50, tabY, tabWidth, tabHeight, 12);
    dailyBtn.lineStyle(2, this.activeTab === 'daily' ? 0xffd700 : 0x3d8c5a, 0.8);
    dailyBtn.strokeRoundedRect(50, tabY, tabWidth, tabHeight, 12);

    this.add.text(50 + tabWidth / 2, tabY + 30, '📅 每日任务', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const dailyZone = this.add.zone(50 + tabWidth / 2, tabY + 30, tabWidth, tabHeight);
    dailyZone.setInteractive();
    dailyZone.on('pointerdown', () => {
      if (this.activeTab !== 'daily') {
        this.activeTab = 'daily';
        this.clearContent();
        this.createTabs();
        this.renderContent();
      }
    });

    const achBtn = this.add.graphics();
    achBtn.fillStyle(this.activeTab === 'achievement' ? 0xff6b35 : 0x2d7a4c, 1);
    achBtn.fillRoundedRect(60 + tabWidth, tabY, tabWidth, tabHeight, 12);
    achBtn.lineStyle(2, this.activeTab === 'achievement' ? 0xffd700 : 0x3d8c5a, 0.8);
    achBtn.strokeRoundedRect(60 + tabWidth, tabY, tabWidth, tabHeight, 12);

    this.add.text(60 + tabWidth + tabWidth / 2, tabY + 30, '🏆 成就', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const achZone = this.add.zone(60 + tabWidth + tabWidth / 2, tabY + 30, tabWidth, tabHeight);
    achZone.setInteractive();
    achZone.on('pointerdown', () => {
      if (this.activeTab !== 'achievement') {
        this.activeTab = 'achievement';
        this.clearContent();
        this.createTabs();
        this.renderContent();
      }
    });
  }

  private renderContent(): void {
    if (this.activeTab === 'daily') {
      this.renderDailyTasks();
    } else {
      this.renderAchievements();
    }
  }

  private renderDailyTasks(): void {
    const timeText = this.add.text(
      this.scale.width / 2,
      180,
      `距离刷新还有: ${TaskManager.formatTimeUntilReset()}`,
      {
        font: '16px Arial',
        color: '#a5d6a7'
      }
    ).setOrigin(0.5);
    this.contentElements.push(timeText);

    const dailyTasks = TaskManager.getDailyTasks(this.taskData);

    if (dailyTasks.length === 0) {
      const emptyText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        '今日暂无任务',
        {
          font: '24px Arial',
          color: '#c8e6c9'
        }
      ).setOrigin(0.5);
      this.contentElements.push(emptyText);
      return;
    }

    let y = 220;
    dailyTasks.forEach(({ definition, progress }) => {
      this.renderTaskCard(definition, progress, y);
      y += 160;
    });
  }

  private renderAchievements(): void {
    const achievements = TaskManager.getAchievements(this.taskData);

    const completedCount = achievements.filter(a => a.progress.completed).length;
    const countText = this.add.text(
      this.scale.width / 2,
      180,
      `已解锁: ${completedCount} / ${achievements.length}`,
      {
        font: '16px Arial',
        color: '#a5d6a7'
      }
    ).setOrigin(0.5);
    this.contentElements.push(countText);

    let y = 220;
    achievements.forEach(({ definition, progress }) => {
      this.renderTaskCard(definition, progress, y);
      y += 160;
    });
  }

  private renderTaskCard(
    definition: ITaskDefinition,
    progress: ITaskProgress,
    y: number
  ): void {
    const panelWidth = this.scale.width - 80;
    const panelHeight = 140;
    const x = 40;

    const isCompleted = progress.completed;
    const isClaimed = progress.claimed;

    const panel = this.add.graphics();
    panel.fillStyle(isCompleted ? 0x2e7d32 : 0x14522a, 0.9);
    panel.fillRoundedRect(x, y, panelWidth, panelHeight, 15);
    panel.lineStyle(2, isCompleted ? 0x4caf50 : 0x3d8c5a, 0.6);
    panel.strokeRoundedRect(x, y, panelWidth, panelHeight, 15);
    this.contentElements.push(panel);

    const icon = this.add.text(x + 40, y + 40, definition.icon, {
      font: '40px Arial'
    });
    this.contentElements.push(icon);

    const title = this.add.text(x + 100, y + 25, definition.title, {
      font: 'bold 20px Arial',
      color: isCompleted ? '#ffd700' : '#ffffff'
    });
    this.contentElements.push(title);

    const desc = this.add.text(x + 100, y + 55, definition.description, {
      font: '14px Arial',
      color: '#a5d6a7'
    });
    this.contentElements.push(desc);

    const progressText = this.add.text(x + 100, y + 85, `${progress.current} / ${definition.target}`, {
      font: 'bold 16px Arial',
      color: isCompleted ? '#4caf50' : '#ffd700'
    });
    this.contentElements.push(progressText);

    const rewardText = this.add.text(x + 200, y + 85, `奖励: +${definition.reward} 经验`, {
      font: '14px Arial',
      color: '#ffb74d'
    });
    this.contentElements.push(rewardText);

    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x0a2a15, 0.8);
    progressBarBg.fillRect(x + 100, y + 110, panelWidth - 200, 12);
    this.contentElements.push(progressBarBg);

    const progressRatio = Math.min(1, progress.current / definition.target);
    const progressBar = this.add.graphics();
    progressBar.fillStyle(isCompleted ? 0x4caf50 : 0xffd700, 1);
    progressBar.fillRect(x + 100, y + 110, (panelWidth - 200) * progressRatio, 12);
    this.contentElements.push(progressBar);

    if (isCompleted && !isClaimed) {
      const claimBtn = this.add.graphics();
      claimBtn.fillStyle(0xff6b35, 1);
      claimBtn.fillRoundedRect(this.scale.width - 120, y + 40, 70, 50, 8);
      this.contentElements.push(claimBtn);

      const claimText = this.add.text(this.scale.width - 85, y + 65, '领取', {
        font: 'bold 16px Arial',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.contentElements.push(claimText);

      const claimZone = this.add.zone(this.scale.width - 85, y + 65, 70, 50);
      claimZone.setInteractive();
      claimZone.on('pointerdown', () => {
        this.claimReward(definition);
      });
      this.contentElements.push(claimZone);
    } else if (isClaimed) {
      const claimedText = this.add.text(this.scale.width - 85, y + 65, '已领取', {
        font: 'bold 14px Arial',
        color: '#757575'
      }).setOrigin(0.5);
      this.contentElements.push(claimedText);
    }
  }

  private claimReward(definition: ITaskDefinition): void {
    this.taskData = TaskManager.claimTask(this.taskData, definition.id, definition.type);

    const playerStats = ScoreManager.loadPlayerStats('player_0', '玩家');
    playerStats.totalScore += definition.reward;
    ScoreManager.savePlayerStats(playerStats);

    const toast = this.add.graphics();
    toast.fillStyle(0x000000, 0.8);
    toast.fillRoundedRect(this.scale.width / 2 - 120, this.scale.height / 2 - 40, 240, 80, 15);

    const toastText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `🎉 获得 +${definition.reward} 经验！`,
      {
        font: 'bold 18px Arial',
        color: '#ffd700'
      }
    ).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      toast.destroy();
      toastText.destroy();
      this.clearContent();
      this.renderContent();
    });
  }

  private clearContent(): void {
    this.contentElements.forEach(element => {
      if (element && element.active !== false) {
        element.destroy();
      }
    });
    this.contentElements = [];
  }
}
