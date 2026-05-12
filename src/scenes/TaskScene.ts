import Phaser from 'phaser';
import { TaskManager, ITaskProgress } from '../utils/TaskManager';
import { TaskStatus } from '../types';

export class TaskScene extends Phaser.Scene {
  private currentTab: 'daily' | 'achievement' = 'daily';
  private dailyTasks: ITaskProgress[] = [];
  private achievements: ITaskProgress[] = [];
  private contentContainer!: Phaser.GameObjects.Container;
  private scrollMask!: Phaser.GameObjects.Graphics;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private dragStartScrollY: number = 0;
  private contentAreaY: number = 0;
  private contentAreaHeight: number = 0;

  constructor() {
    super({ key: 'TaskScene' });
  }

  create(): void {
    this.dailyTasks = TaskManager.getDailyTasks();
    this.achievements = TaskManager.getAchievements();

    this.createBackground();
    this.createTitle();
    this.createTabs();
    this.createContentArea();
    this.createBackButton();
    this.renderContent();
    this.setupScrolling();
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
    const title = this.add.text(
      this.scale.width / 2,
      80,
      '任务中心',
      {
        font: 'bold 40px Arial',
        color: '#ffd700',
        stroke: '#8b4513',
        strokeThickness: 4
      }
    );
    title.setOrigin(0.5);
  }

  private createTabs(): void {
    const y = 140;
    const tabWidth = (this.scale.width - 100) / 2;
    const spacing = 20;

    const dailyX = 50;
    const dailyTab = this.add.graphics();
    dailyTab.fillStyle(this.currentTab === 'daily' ? 0xff9800 : 0x2d7a4c, this.currentTab === 'daily' ? 1 : 0.6);
    dailyTab.fillRoundedRect(dailyX, y, tabWidth, 50, 10);
    
    if (this.currentTab === 'daily') {
      dailyTab.lineStyle(3, 0xffd700, 1);
      dailyTab.strokeRoundedRect(dailyX, y, tabWidth, 50, 10);
    }

    this.add.text(dailyX + tabWidth / 2, y + 25, '每日任务', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const dailyZone = this.add.zone(dailyX + tabWidth / 2, y + 25, tabWidth, 50);
    dailyZone.setInteractive();
    dailyZone.on('pointerdown', () => {
      if (this.currentTab !== 'daily') {
        this.currentTab = 'daily';
        this.scene.restart();
      }
    });

    const achX = dailyX + tabWidth + spacing;
    const achTab = this.add.graphics();
    achTab.fillStyle(this.currentTab === 'achievement' ? 0xff9800 : 0x2d7a4c, this.currentTab === 'achievement' ? 1 : 0.6);
    achTab.fillRoundedRect(achX, y, tabWidth, 50, 10);
    
    if (this.currentTab === 'achievement') {
      achTab.lineStyle(3, 0xffd700, 1);
      achTab.strokeRoundedRect(achX, y, tabWidth, 50, 10);
    }

    this.add.text(achX + tabWidth / 2, y + 25, '成就', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const achZone = this.add.zone(achX + tabWidth / 2, y + 25, tabWidth, 50);
    achZone.setInteractive();
    achZone.on('pointerdown', () => {
      if (this.currentTab !== 'achievement') {
        this.currentTab = 'achievement';
        this.scene.restart();
      }
    });
  }

  private createContentArea(): void {
    this.contentAreaY = 220;
    this.contentAreaHeight = this.scale.height - this.contentAreaY - 100;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x14522a, 0.8);
    panel.fillRoundedRect(50, this.contentAreaY, this.scale.width - 100, this.contentAreaHeight, 15);
    panel.lineStyle(2, 0x3d8c5a, 0.6);
    panel.strokeRoundedRect(50, this.contentAreaY, this.scale.width - 100, this.contentAreaHeight, 15);

    this.scrollMask = this.add.graphics();
    this.scrollMask.fillStyle(0xffffff);
    this.scrollMask.fillRect(50, this.contentAreaY, this.scale.width - 100, this.contentAreaHeight);
    this.scrollMask.setVisible(false);

    this.contentContainer = this.add.container(50, this.contentAreaY);
    this.contentContainer.setMask(this.scrollMask.createGeometryMask());
  }

  private setupScrolling(): void {
    const scrollArea = this.add.zone(
      50 + (this.scale.width - 100) / 2,
      this.contentAreaY + this.contentAreaHeight / 2,
      this.scale.width - 100,
      this.contentAreaHeight
    );
    scrollArea.setInteractive();

    scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.dragStartScrollY = this.scrollY;
    });

    scrollArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaY = this.dragStartY - pointer.y;
        let newScrollY = this.dragStartScrollY + deltaY;
        newScrollY = Math.max(0, Math.min(this.maxScrollY, newScrollY));
        this.setScrollY(newScrollY);
      }
    });

    scrollArea.on('pointerup', () => {
      this.isDragging = false;
    });

    scrollArea.on('pointerout', () => {
      this.isDragging = false;
    });

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
      if (pointer.x >= 50 && pointer.x <= this.scale.width - 50 &&
          pointer.y >= this.contentAreaY && pointer.y <= this.contentAreaY + this.contentAreaHeight) {
        let newScrollY = this.scrollY + deltaY * 0.5;
        newScrollY = Math.max(0, Math.min(this.maxScrollY, newScrollY));
        this.setScrollY(newScrollY);
      }
    });
  }

  private setScrollY(y: number): void {
    this.scrollY = y;
    this.contentContainer.y = this.contentAreaY - y;
  }

  private renderContent(): void {
    this.contentContainer.removeAll(true);

    const tasks = this.currentTab === 'daily' ? this.dailyTasks : this.achievements;
    const itemHeight = 120;
    const padding = 20;
    const itemWidth = this.scale.width - 100 - padding * 2;

    const totalHeight = tasks.length * (itemHeight + padding) + padding;
    this.maxScrollY = Math.max(0, totalHeight - this.contentAreaHeight);

    tasks.forEach((taskItem, index) => {
      const y = padding + index * (itemHeight + padding);
      this.createTaskItem(taskItem, padding, y, itemWidth, itemHeight);
    });

    if (tasks.length === 0) {
      const emptyText = this.add.text((this.scale.width - 100) / 2, 100, '暂无任务', {
        font: '24px Arial',
        color: '#c8e6c9'
      }).setOrigin(0.5);
      this.contentContainer.add(emptyText);
    }

    this.setScrollY(0);
  }

  private createTaskItem(taskItem: ITaskProgress, x: number, y: number, width: number, height: number): void {
    const { task, progress, status } = taskItem;
    const isCompleted = status === TaskStatus.COMPLETED || status === TaskStatus.CLAIMED;
    const isClaimed = status === TaskStatus.CLAIMED;

    const panel = this.add.graphics();
    panel.fillStyle(isClaimed ? 0x2e7d32 : (isCompleted ? 0x388e3c : 0x1b5e20), 0.9);
    panel.fillRoundedRect(x, y, width, height, 12);
    
    if (isCompleted && !isClaimed) {
      panel.lineStyle(3, 0xffd700, 1);
      panel.strokeRoundedRect(x, y, width, height, 12);
    }

    this.contentContainer.add(panel);

    const icon = this.add.text(x + 20, y + 25, task.icon, {
      font: '36px Arial'
    });
    this.contentContainer.add(icon);

    const title = this.add.text(x + 75, y + 20, task.title, {
      font: 'bold 18px Arial',
      color: isClaimed ? '#81c784' : '#ffffff'
    });
    this.contentContainer.add(title);

    const desc = this.add.text(x + 75, y + 45, task.description, {
      font: '14px Arial',
      color: isClaimed ? '#81c784' : '#a5d6a7'
    });
    this.contentContainer.add(desc);

    const reward = this.add.text(x + 75, y + 70, `奖励: +${task.reward} 经验`, {
      font: '14px Arial',
      color: '#ffd700'
    });
    this.contentContainer.add(reward);

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x0a2a15, 0.8);
    progressBg.fillRect(x + 75, y + 95, width - 170, 16);
    this.contentContainer.add(progressBg);

    const progressPercent = Math.min(progress / task.target, 1);
    const progressBar = this.add.graphics();
    progressBar.fillStyle(isClaimed ? 0x2e7d32 : (isCompleted ? 0xffd700 : 0x4caf50), 1);
    progressBar.fillRect(x + 75, y + 95, (width - 170) * progressPercent, 16);
    this.contentContainer.add(progressBar);

    const progressText = this.add.text(x + width - 90, y + 93, `${progress}/${task.target}`, {
      font: 'bold 12px Arial',
      color: '#ffffff'
    });
    this.contentContainer.add(progressText);

    if (isCompleted && !isClaimed) {
      const claimBtn = this.add.graphics();
      claimBtn.fillStyle(0xff9800, 1);
      claimBtn.fillRoundedRect(x + width - 70, y + 40, 55, 35, 8);
      this.contentContainer.add(claimBtn);

      const claimText = this.add.text(x + width - 42, y + 57, '领取', {
        font: 'bold 14px Arial',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.contentContainer.add(claimText);

      const claimZone = this.add.zone(x + width - 42, y + 57, 55, 35);
      claimZone.setInteractive();
      claimZone.on('pointerdown', () => {
        this.claimReward(task.id);
      });
      this.contentContainer.add(claimZone);
    } else if (isClaimed) {
      const claimedText = this.add.text(x + width - 45, y + 52, '已领取', {
        font: 'bold 12px Arial',
        color: '#81c784'
      }).setOrigin(0.5);
      this.contentContainer.add(claimedText);
    }
  }

  private claimReward(taskId: string): void {
    const reward = TaskManager.claimReward(taskId);
    if (reward > 0) {
      const stats = this.loadPlayerStats();
      stats.totalScore += reward;
      this.savePlayerStats(stats);
      
      this.scene.restart();
    }
  }

  private loadPlayerStats(): any {
    try {
      const stored = localStorage.getItem('dou_dizhu_player_stats_player_0');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load player stats:', e);
    }
    return { totalScore: 1000 };
  }

  private savePlayerStats(stats: any): void {
    try {
      localStorage.setItem('dou_dizhu_player_stats_player_0', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save player stats:', e);
    }
  }

  private createBackButton(): void {
    const y = this.scale.height - 70;
    const width = this.scale.width - 100;

    const button = this.add.graphics();
    button.fillStyle(0x757575, 1);
    button.fillRoundedRect(50, y, width, 50, 12);

    this.add.text(this.scale.width / 2, y + 25, '返回', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hitZone = this.add.zone(this.scale.width / 2, y + 25, width, 50);
    hitZone.setInteractive();
    hitZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
