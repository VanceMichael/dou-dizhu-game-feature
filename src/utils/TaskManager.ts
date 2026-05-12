import { TaskType, TaskStatus, ITask, IPlayerTask, IGameSessionStats } from '../types';

const DAILY_TASKS_POOL: Omit<ITask, 'type'>[] = [
  { id: 'daily_win_3', title: '今日胜利 3 局', description: '在今日赢得3局斗地主', target: 3, reward: 50, icon: '🏆' },
  { id: 'daily_win_5', title: '今日胜利 5 局', description: '在今日赢得5局斗地主', target: 5, reward: 100, icon: '🏆' },
  { id: 'daily_bomb_win', title: '用炸弹打赢一局', description: '在一局中使用炸弹并获胜', target: 1, reward: 30, icon: '💣' },
  { id: 'daily_landlord_2_win', title: '当地主连续胜利 2 局', description: '作为地主连续赢得2局', target: 2, reward: 60, icon: '👑' },
  { id: 'daily_play_5', title: '今日游玩 5 局', description: '今日完成5局游戏', target: 5, reward: 20, icon: '🎮' },
  { id: 'daily_rocket', title: '今日使用火箭', description: '在一局中使用火箭牌型', target: 1, reward: 40, icon: '🚀' }
];

const ACHIEVEMENTS: ITask[] = [
  { id: 'ach_win_10', type: TaskType.ACHIEVEMENT, title: '初出茅庐', description: '累计胜利 10 局', target: 10, reward: 100, icon: '🌟' },
  { id: 'ach_win_100', type: TaskType.ACHIEVEMENT, title: '百战百胜', description: '累计胜利 100 局', target: 100, reward: 500, icon: '⭐' },
  { id: 'ach_win_500', type: TaskType.ACHIEVEMENT, title: '常胜将军', description: '累计胜利 500 局', target: 500, reward: 2000, icon: '🏅' },
  { id: 'ach_landlord_50', type: TaskType.ACHIEVEMENT, title: '地主专业户', description: '作为地主累计胜利 50 局', target: 50, reward: 300, icon: '👑' },
  { id: 'ach_bomb_50', type: TaskType.ACHIEVEMENT, title: '炸弹狂魔', description: '累计使用炸弹 50 次', target: 50, reward: 250, icon: '💣' },
  { id: 'ach_rocket_10', type: TaskType.ACHIEVEMENT, title: '王炸收官 10 次', description: '累计使用火箭 10 次', target: 10, reward: 300, icon: '🚀' },
  { id: 'ach_streak_5', type: TaskType.ACHIEVEMENT, title: '五连胜', description: '累计达成5连胜', target: 5, reward: 150, icon: '🔥' },
  { id: 'ach_streak_10', type: TaskType.ACHIEVEMENT, title: '十连胜', description: '累计达成10连胜', target: 10, reward: 400, icon: '🔥' },
  { id: 'ach_score_10000', type: TaskType.ACHIEVEMENT, title: '万分玩家', description: '累计获得 10000 积分', target: 10000, reward: 200, icon: '💎' },
  { id: 'ach_play_100', type: TaskType.ACHIEVEMENT, title: '百局达人', description: '累计游玩 100 局', target: 100, reward: 150, icon: '🎮' }
];

export interface ITaskProgress {
  task: ITask;
  progress: number;
  status: TaskStatus;
}

export interface ITaskUpdateResult {
  completedTasks: ITaskProgress[];
  progressedTasks: ITaskProgress[];
  totalReward: number;
}

interface IStoredTaskData {
  dailyTasks: IPlayerTask[];
  lastDailyReset: number;
  achievements: IPlayerTask[];
  stats: {
    totalWins: number;
    totalLandlordWins: number;
    totalBombsUsed: number;
    totalRocketsUsed: number;
    totalGamesPlayed: number;
    totalScoreEarned: number;
    maxWinStreak: number;
    maxLandlordWinStreak: number;
  };
}

export class TaskManager {
  private static STORAGE_KEY = 'dou_dizhu_tasks';
  private static DAILY_RESET_HOUR = 4;

  static getDefaultStoredData(): IStoredTaskData {
    return {
      dailyTasks: [],
      lastDailyReset: 0,
      achievements: ACHIEVEMENTS.map(a => ({
        taskId: a.id,
        progress: 0,
        status: TaskStatus.IN_PROGRESS
      })),
      stats: {
        totalWins: 0,
        totalLandlordWins: 0,
        totalBombsUsed: 0,
        totalRocketsUsed: 0,
        totalGamesPlayed: 0,
        totalScoreEarned: 0,
        maxWinStreak: 0,
        maxLandlordWinStreak: 0
      }
    };
  }

  static loadData(): IStoredTaskData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as IStoredTaskData;
        if (this.shouldResetDailyTasks(data.lastDailyReset)) {
          data.dailyTasks = this.generateDailyTasks();
          data.lastDailyReset = this.getLastResetTime();
          this.saveData(data);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to load task data:', e);
    }
    const defaultData = this.getDefaultStoredData();
    defaultData.dailyTasks = this.generateDailyTasks();
    defaultData.lastDailyReset = this.getLastResetTime();
    this.saveData(defaultData);
    return defaultData;
  }

  static saveData(data: IStoredTaskData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save task data:', e);
    }
  }

  private static shouldResetDailyTasks(lastReset: number): boolean {
    const now = new Date();
    const lastResetDate = new Date(lastReset);
    const lastResetDay = new Date(
      lastResetDate.getFullYear(),
      lastResetDate.getMonth(),
      lastResetDate.getDate(),
      this.DAILY_RESET_HOUR
    );
    const nextReset = new Date(lastResetDay);
    nextReset.setDate(nextReset.getDate() + 1);
    return now.getTime() >= nextReset.getTime();
  }

  private static getLastResetTime(): number {
    const now = new Date();
    const resetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      this.DAILY_RESET_HOUR
    );
    if (now.getHours() < this.DAILY_RESET_HOUR) {
      resetTime.setDate(resetTime.getDate() - 1);
    }
    return resetTime.getTime();
  }

  private static generateDailyTasks(): IPlayerTask[] {
    const shuffled = [...DAILY_TASKS_POOL].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return selected.map(t => ({
      taskId: t.id,
      progress: 0,
      status: TaskStatus.IN_PROGRESS
    }));
  }

  static getDailyTasks(): ITaskProgress[] {
    const data = this.loadData();
    return data.dailyTasks.map(pt => {
      const taskPool = DAILY_TASKS_POOL.find(t => t.id === pt.taskId);
      return {
        task: { ...taskPool!, type: TaskType.DAILY },
        progress: pt.progress,
        status: pt.status
      };
    });
  }

  static getAchievements(): ITaskProgress[] {
    const data = this.loadData();
    return data.achievements.map(pt => {
      const achievement = ACHIEVEMENTS.find(a => a.id === pt.taskId);
      return {
        task: achievement!,
        progress: pt.progress,
        status: pt.status
      };
    });
  }

  static processGameSession(sessionStats: IGameSessionStats): ITaskUpdateResult {
    const data = this.loadData();
    const completedTasks: ITaskProgress[] = [];
    const progressedTasks: ITaskProgress[] = [];
    let totalReward = 0;

    data.stats.totalGamesPlayed++;

    if (sessionStats.isWin) {
      data.stats.totalWins++;
      if (sessionStats.playerIsLandlord) {
        data.stats.totalLandlordWins++;
      }
    }

    if (sessionStats.usedBomb) {
      data.stats.totalBombsUsed++;
    }

    if (sessionStats.usedRocket) {
      data.stats.totalRocketsUsed++;
    }

    if (sessionStats.score > 0) {
      data.stats.totalScoreEarned += sessionStats.score;
    }

    data.stats.maxWinStreak = Math.max(data.stats.maxWinStreak, sessionStats.totalWinStreak);
    data.stats.maxLandlordWinStreak = Math.max(data.stats.maxLandlordWinStreak, sessionStats.landlordWinStreak);

    data.dailyTasks.forEach(pt => {
      const oldProgress = pt.progress;
      const taskPool = DAILY_TASKS_POOL.find(t => t.id === pt.taskId);
      if (!taskPool || pt.status !== TaskStatus.IN_PROGRESS) return;

      switch (pt.taskId) {
        case 'daily_win_3':
        case 'daily_win_5':
          if (sessionStats.isWin) {
            pt.progress++;
          }
          break;
        case 'daily_bomb_win':
          if (sessionStats.isWin && sessionStats.usedBomb) {
            pt.progress++;
          }
          break;
        case 'daily_landlord_2_win':
          if (sessionStats.isWin && sessionStats.playerIsLandlord && sessionStats.landlordWinStreak >= 2) {
            pt.progress = Math.max(pt.progress, sessionStats.landlordWinStreak);
          }
          break;
        case 'daily_play_5':
          pt.progress++;
          break;
        case 'daily_rocket':
          if (sessionStats.usedRocket) {
            pt.progress++;
          }
          break;
      }

      if (pt.progress > oldProgress) {
        progressedTasks.push({
          task: { ...taskPool, type: TaskType.DAILY },
          progress: pt.progress,
          status: pt.status
        });
      }

      if (pt.progress >= taskPool.target && pt.status === TaskStatus.IN_PROGRESS) {
        pt.status = TaskStatus.COMPLETED;
        totalReward += taskPool.reward;
        completedTasks.push({
          task: { ...taskPool, type: TaskType.DAILY },
          progress: pt.progress,
          status: pt.status
        });
      }
    });

    data.achievements.forEach(pt => {
      const oldProgress = pt.progress;
      const achievement = ACHIEVEMENTS.find(a => a.id === pt.taskId);
      if (!achievement || pt.status !== TaskStatus.IN_PROGRESS) return;

      switch (pt.taskId) {
        case 'ach_win_10':
        case 'ach_win_100':
        case 'ach_win_500':
          pt.progress = data.stats.totalWins;
          break;
        case 'ach_landlord_50':
          pt.progress = data.stats.totalLandlordWins;
          break;
        case 'ach_bomb_50':
          pt.progress = data.stats.totalBombsUsed;
          break;
        case 'ach_rocket_10':
          pt.progress = data.stats.totalRocketsUsed;
          break;
        case 'ach_streak_5':
        case 'ach_streak_10':
          pt.progress = data.stats.maxWinStreak;
          break;
        case 'ach_score_10000':
          pt.progress = data.stats.totalScoreEarned;
          break;
        case 'ach_play_100':
          pt.progress = data.stats.totalGamesPlayed;
          break;
      }

      if (pt.progress > oldProgress) {
        progressedTasks.push({
          task: achievement,
          progress: pt.progress,
          status: pt.status
        });
      }

      if (pt.progress >= achievement.target && pt.status === TaskStatus.IN_PROGRESS) {
        pt.status = TaskStatus.COMPLETED;
        totalReward += achievement.reward;
        completedTasks.push({
          task: achievement,
          progress: pt.progress,
          status: pt.status
        });
      }
    });

    this.saveData(data);

    return { completedTasks, progressedTasks, totalReward };
  }

  static claimReward(taskId: string): number {
    const data = this.loadData();
    
    const dailyTask = data.dailyTasks.find(t => t.taskId === taskId);
    if (dailyTask && dailyTask.status === TaskStatus.COMPLETED) {
      dailyTask.status = TaskStatus.CLAIMED;
      this.saveData(data);
      const taskPool = DAILY_TASKS_POOL.find(t => t.id === taskId);
      return taskPool?.reward || 0;
    }

    const achievement = data.achievements.find(a => a.taskId === taskId);
    if (achievement && achievement.status === TaskStatus.COMPLETED) {
      achievement.status = TaskStatus.CLAIMED;
      this.saveData(data);
      const ach = ACHIEVEMENTS.find(a => a.id === taskId);
      return ach?.reward || 0;
    }

    return 0;
  }

  static getStats(): IStoredTaskData['stats'] {
    return this.loadData().stats;
  }
}
