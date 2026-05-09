import Phaser from 'phaser';
import { TaskManager } from '../utils/TaskManager';

export class TaskScene extends Phaser.Scene {
  private currentTab: 'daily' | 'achievement' = 'daily';
  private taskData!: ReturnType<typeof TaskManager.loadTaskData>;
  private scrollOffset: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'TaskScene' });
  }

  create(): void {
    this.taskData = TaskManager.loadTaskData();
    this.scrollOffset = 0;

    this.createBackground();
    this.createTitle();
    this.createTabs();
    this.createContent();
    this.createBackButton();
    this.setupScroll();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a5c3a, 0x0d3d24, 0x1a5c3a, 0x0d3d24);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    this.add.graphics()
      .lineStyle(2, 0x2d7a4c, 0.3)
      .strokeRoundedRect(30, 30, this.scale.width - 60, this.scale.height - 60, 20);
  }

  private createTitle(): void {
    this.add.text(this.scale.width / 2, 60, '📋 任务中心', {
      font: 'bold 36px Arial',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 3
    }).setOrigin(0.5);

    const unclaimed = TaskManager.getUnclaimedCount();
    if (unclaimed > 0) {
      this.add.text(this.scale.width - 60, 60, `${unclaimed}`, {
        font: 'bold 18px Arial',
        color: '#ffffff',
        backgroundColor: '#f44336',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5);
    }
  }

  private createTabs(): void {
    this.tabElements = [];

    const y = 110;
    const tabWidth = (this.scale.width - 100) / 2;

    const dailyTab = this.add.graphics();
    dailyTab.fillStyle(this.currentTab === 'daily' ? 0x4caf50 : 0x2d7a4c, 1);
    dailyTab.fillRoundedRect(40, y, tabWidth, 50, { tl: 10, tr: 10, bl: 0, br: 0 });
    this.tabElements.push(dailyTab);

    const dailyText = this.add.text(40 + tabWidth / 2, y + 25, '📅 每日任务', {
      font: 'bold 20px Arial',
      color: this.currentTab === 'daily' ? '#ffffff' : '#a5d6a7'
    }).setOrigin(0.5);
    this.tabElements.push(dailyText);

    const dailyZone = this.add.zone(40 + tabWidth / 2, y + 25, tabWidth, 50);
    dailyZone.setInteractive();
    dailyZone.on('pointerdown', () => {
      if (this.currentTab === 'daily') return;
      this.currentTab = 'daily';
      this.scrollOffset = 0;
      this.refreshTabs();
      this.refreshContent();
    });
    this.tabElements.push(dailyZone);

    const achTab = this.add.graphics();
    achTab.fillStyle(this.currentTab === 'achievement' ? 0xff6b35 : 0x2d7a4c, 1);
    achTab.fillRoundedRect(60 + tabWidth, y, tabWidth, 50, { tl: 10, tr: 10, bl: 0, br: 0 });
    this.tabElements.push(achTab);

    const achText = this.add.text(60 + tabWidth + tabWidth / 2, y + 25, '🏆 成就', {
      font: 'bold 20px Arial',
      color: this.currentTab === 'achievement' ? '#ffffff' : '#a5d6a7'
    }).setOrigin(0.5);
    this.tabElements.push(achText);

    const achZone = this.add.zone(60 + tabWidth + tabWidth / 2, y + 25, tabWidth, 50);
    achZone.setInteractive();
    achZone.on('pointerdown', () => {
      if (this.currentTab === 'achievement') return;
      this.currentTab = 'achievement';
      this.scrollOffset = 0;
      this.refreshTabs();
      this.refreshContent();
    });
    this.tabElements.push(achZone);
  }

  private refreshTabs(): void {
    this.tabElements.forEach(el => {
      if (el && el.active !== false) el.destroy();
    });
    this.tabElements = [];
    this.createTabs();
  }

  private createContent(): void {
    this.contentContainer = this.add.container(0, 0);
    this.renderTaskList();
  }

  private refreshContent(): void {
    this.contentContainer.destroy(true);
    this.contentContainer = this.add.container(0, 0);
    this.renderTaskList();
  }

  private renderTaskList(): void {
    this.taskData = TaskManager.loadTaskData();

    const startY = 170;
    const contentX = 50;
    const cardWidth = this.scale.width - 100;
    const cardHeight = 120;
    const gap = 15;

    const tasks = this.currentTab === 'daily' ? this.taskData.dailyTasks : this.taskData.achievements;
    const definitions = this.currentTab === 'daily'
      ? TaskManager.getDailyTaskPool()
      : TaskManager.getAchievementDefinitions();

    if (this.currentTab === 'daily') {
      const resetTime = this.getDailyResetTimeText();
      const resetText = this.add.text(this.scale.width / 2, startY - 5, `⏰ 每日任务 ${resetTime} 重置`, {
        font: '14px Arial',
        color: '#ffcc80'
      }).setOrigin(0.5);
      this.contentContainer.add(resetText);
    }

    tasks.forEach((task, index) => {
      const def = definitions.find(d => d.id === task.taskId);
      if (!def) return;

      const y = startY + 15 + index * (cardHeight + gap) + this.scrollOffset;

      const card = this.add.graphics();
      card.fillStyle(task.completed ? 0x1b5e20 : 0x14522a, 0.9);
      card.fillRoundedRect(contentX, y, cardWidth, cardHeight, 12);
      card.lineStyle(2, task.completed ? 0x4caf50 : 0x3d8c5a, 0.6);
      card.strokeRoundedRect(contentX, y, cardWidth, cardHeight, 12);
      this.contentContainer.add(card);

      const nameText = this.add.text(contentX + 20, y + 15, def.name, {
        font: 'bold 20px Arial',
        color: task.completed ? '#4caf50' : '#ffffff'
      });
      this.contentContainer.add(nameText);

      const descText = this.add.text(contentX + 20, y + 45, def.description, {
        font: '16px Arial',
        color: '#c8e6c9'
      });
      this.contentContainer.add(descText);

      const progressWidth = cardWidth - 40;
      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x0a2a15, 0.8);
      progressBg.fillRoundedRect(contentX + 20, y + 75, progressWidth, 16, 4);
      this.contentContainer.add(progressBg);

      const progress = Math.min(task.current / def.target, 1);
      if (progress > 0) {
        const progressFill = this.add.graphics();
        progressFill.fillStyle(task.completed ? 0xffd700 : 0x4caf50, 1);
        progressFill.fillRoundedRect(contentX + 20, y + 75, progressWidth * progress, 16, 4);
        this.contentContainer.add(progressFill);
      }

      const progressText = this.add.text(contentX + 20 + progressWidth / 2, y + 83, `${task.current}/${def.target}`, {
        font: 'bold 12px Arial',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.contentContainer.add(progressText);

      if (task.completed && !task.claimed) {
        const claimBtn = this.add.graphics();
        claimBtn.fillStyle(0xff6b35, 1);
        claimBtn.fillRoundedRect(contentX + cardWidth - 110, y + 15, 90, 40, 8);
        this.contentContainer.add(claimBtn);

        const claimText = this.add.text(contentX + cardWidth - 65, y + 35, `领${def.reward}`, {
          font: 'bold 16px Arial',
          color: '#ffffff'
        }).setOrigin(0.5);
        this.contentContainer.add(claimText);

        const claimZone = this.add.zone(contentX + cardWidth - 65, y + 35, 90, 40);
        claimZone.setInteractive();
        claimZone.on('pointerdown', () => {
          TaskManager.claimReward(task.taskId);
          this.refreshContent();
        });
        this.contentContainer.add(claimZone);
      } else if (task.completed && task.claimed) {
        const doneText = this.add.text(contentX + cardWidth - 60, y + 35, '✅ 已领', {
          font: '16px Arial',
          color: '#4caf50'
        }).setOrigin(0.5);
        this.contentContainer.add(doneText);
      } else {
        const rewardText = this.add.text(contentX + cardWidth - 20, y + 25, `+${def.reward}经验`, {
          font: '14px Arial',
          color: '#ffd700'
        }).setOrigin(1, 0);
        this.contentContainer.add(rewardText);
      }
    });

    const claimAllY = startY + 15 + tasks.length * (cardHeight + gap) + this.scrollOffset + 10;
    const hasUnclaimed = tasks.some(t => t.completed && !t.claimed);
    if (hasUnclaimed) {
      const claimAllBtn = this.add.graphics();
      claimAllBtn.fillStyle(0xff6b35, 1);
      claimAllBtn.fillRoundedRect(this.scale.width / 2 - 80, claimAllY, 160, 50, 12);
      this.contentContainer.add(claimAllBtn);

      const claimAllText = this.add.text(this.scale.width / 2, claimAllY + 25, '一键领取', {
        font: 'bold 20px Arial',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.contentContainer.add(claimAllText);

      const claimAllZone = this.add.zone(this.scale.width / 2, claimAllY + 25, 160, 50);
      claimAllZone.setInteractive();
      claimAllZone.on('pointerdown', () => {
        TaskManager.claimAllRewards();
        this.refreshContent();
      });
      this.contentContainer.add(claimAllZone);
    }
  }

  private getDailyResetTimeText(): string {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setHours(4, 0, 0, 0);
    if (now.getHours() >= 4) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    const hours = Math.floor((nextReset.getTime() - now.getTime()) / 3600000);
    const mins = Math.floor(((nextReset.getTime() - now.getTime()) % 3600000) / 60000);
    return `${hours}时${mins}分后`;
  }

  private createBackButton(): void {
    const y = this.scale.height - 100;
    const btn = this.add.graphics();
    btn.fillStyle(0x757575, 1);
    btn.fillRoundedRect(this.scale.width / 2 - 80, y, 160, 50, 12);

    this.add.text(this.scale.width / 2, y + 25, '返回', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(this.scale.width / 2, y + 25, 160, 50);
    zone.setInteractive();
    zone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private setupScroll(): void {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      this.scrollOffset += pointer.velocity.y * 0.5;
      this.scrollOffset = Math.min(0, this.scrollOffset);
      const maxScroll = -Math.max(0, (this.contentContainer.length * 140) - 600);
      this.scrollOffset = Math.max(maxScroll, this.scrollOffset);
      this.refreshContent();
    });
  }
}
