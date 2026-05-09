export enum TaskType {
  DAILY = 'daily',
  ACHIEVEMENT = 'achievement'
}

export enum TaskCondition {
  WINS_TODAY = 'wins_today',
  WIN_WITH_BOMB = 'win_with_bomb',
  LANDLORD_WIN_STREAK = 'landlord_win_streak',
  TOTAL_WINS = 'total_wins',
  HIGHEST_SCORE = 'highest_score',
  ROCKET_FINISH = 'rocket_finish',
  BOMBS_USED = 'bombs_used',
  GAMES_PLAYED = 'games_played',
  CONSECUTIVE_WINS = 'consecutive_wins'
}

export interface ITaskDefinition {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  condition: TaskCondition;
  target: number;
  reward: number;
  icon: string;
}

export interface ITaskProgress {
  taskId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: number;
}

export interface ITaskData {
  dailyTasks: ITaskProgress[];
  achievements: ITaskProgress[];
  lastDailyReset: number;
  stats: {
    totalWins: number;
    highestScore: number;
    rocketFinishes: number;
    bombsUsed: number;
    gamesPlayed: number;
    currentWinStreak: number;
    maxWinStreak: number;
    currentLandlordWinStreak: number;
    maxLandlordWinStreak: number;
    winsWithBomb: number;
  };
}

export interface ITaskUpdateResult {
  updatedTasks: {
    task: ITaskDefinition;
    progress: ITaskProgress;
    previousProgress: number;
    justCompleted: boolean;
  }[];
}

const DAILY_TASK_POOL: ITaskDefinition[] = [
  {
    id: 'daily_win_3',
    type: TaskType.DAILY,
    title: '今日胜利 3 局',
    description: '今日累计赢得 3 局游戏',
    condition: TaskCondition.WINS_TODAY,
    target: 3,
    reward: 100,
    icon: '🎯'
  },
  {
    id: 'daily_win_5',
    type: TaskType.DAILY,
    title: '今日胜利 5 局',
    description: '今日累计赢得 5 局游戏',
    condition: TaskCondition.WINS_TODAY,
    target: 5,
    reward: 200,
    icon: '🏆'
  },
  {
    id: 'daily_bomb_win',
    type: TaskType.DAILY,
    title: '用炸弹打赢一局',
    description: '在一局游戏中使用炸弹并获得胜利',
    condition: TaskCondition.WIN_WITH_BOMB,
    target: 1,
    reward: 150,
    icon: '💣'
  },
  {
    id: 'daily_landlord_2',
    type: TaskType.DAILY,
    title: '当地主连胜 2 局',
    description: '以地主身份连续赢得 2 局',
    condition: TaskCondition.LANDLORD_WIN_STREAK,
    target: 2,
    reward: 180,
    icon: '👑'
  },
  {
    id: 'daily_bombs_3',
    type: TaskType.DAILY,
    title: '使用 3 次炸弹',
    description: '今日累计使用 3 次炸弹',
    condition: TaskCondition.BOMBS_USED,
    target: 3,
    reward: 120,
    icon: '💥'
  },
  {
    id: 'daily_games_5',
    type: TaskType.DAILY,
    title: '完成 5 局游戏',
    description: '今日累计完成 5 局游戏',
    condition: TaskCondition.GAMES_PLAYED,
    target: 5,
    reward: 80,
    icon: '🎮'
  }
];

const ACHIEVEMENTS: ITaskDefinition[] = [
  {
    id: 'ach_total_wins_10',
    type: TaskType.ACHIEVEMENT,
    title: '初出茅庐',
    description: '累计赢得 10 局',
    condition: TaskCondition.TOTAL_WINS,
    target: 10,
    reward: 300,
    icon: '🌟'
  },
  {
    id: 'ach_total_wins_50',
    type: TaskType.ACHIEVEMENT,
    title: '小有所成',
    description: '累计赢得 50 局',
    condition: TaskCondition.TOTAL_WINS,
    target: 50,
    reward: 800,
    icon: '⭐'
  },
  {
    id: 'ach_total_wins_100',
    type: TaskType.ACHIEVEMENT,
    title: '百战百胜',
    description: '累计赢得 100 局',
    condition: TaskCondition.TOTAL_WINS,
    target: 100,
    reward: 2000,
    icon: '🏅'
  },
  {
    id: 'ach_highest_score_5000',
    type: TaskType.ACHIEVEMENT,
    title: '单杆高分',
    description: '单局最高得分达到 5000',
    condition: TaskCondition.HIGHEST_SCORE,
    target: 5000,
    reward: 500,
    icon: '📈'
  },
  {
    id: 'ach_highest_score_10000',
    type: TaskType.ACHIEVEMENT,
    title: '财富积累',
    description: '单局最高得分达到 10000',
    condition: TaskCondition.HIGHEST_SCORE,
    target: 10000,
    reward: 1200,
    icon: '💰'
  },
  {
    id: 'ach_rocket_1',
    type: TaskType.ACHIEVEMENT,
    title: '王炸初体验',
    description: '用王炸收官 1 次',
    condition: TaskCondition.ROCKET_FINISH,
    target: 1,
    reward: 200,
    icon: '🃏'
  },
  {
    id: 'ach_rocket_5',
    type: TaskType.ACHIEVEMENT,
    title: '王牌杀手',
    description: '用王炸收官 5 次',
    condition: TaskCondition.ROCKET_FINISH,
    target: 5,
    reward: 600,
    icon: '🔥'
  },
  {
    id: 'ach_rocket_10',
    type: TaskType.ACHIEVEMENT,
    title: '王炸收官大师',
    description: '用王炸收官 10 次',
    condition: TaskCondition.ROCKET_FINISH,
    target: 10,
    reward: 1500,
    icon: '👑'
  },
  {
    id: 'ach_bombs_20',
    type: TaskType.ACHIEVEMENT,
    title: '炸弹专家',
    description: '累计使用 20 次炸弹',
    condition: TaskCondition.BOMBS_USED,
    target: 20,
    reward: 400,
    icon: '💣'
  },
  {
    id: 'ach_bombs_100',
    type: TaskType.ACHIEVEMENT,
    title: '爆破大师',
    description: '累计使用 100 次炸弹',
    condition: TaskCondition.BOMBS_USED,
    target: 100,
    reward: 1000,
    icon: '💥'
  },
  {
    id: 'ach_games_100',
    type: TaskType.ACHIEVEMENT,
    title: '游戏达人',
    description: '累计完成 100 局游戏',
    condition: TaskCondition.GAMES_PLAYED,
    target: 100,
    reward: 500,
    icon: '🎮'
  },
  {
    id: 'ach_streak_5',
    type: TaskType.ACHIEVEMENT,
    title: '五连胜',
    description: '连续赢得 5 局',
    condition: TaskCondition.CONSECUTIVE_WINS,
    target: 5,
    reward: 400,
    icon: '🔥'
  },
  {
    id: 'ach_streak_10',
    type: TaskType.ACHIEVEMENT,
    title: '十连胜',
    description: '连续赢得 10 局',
    condition: TaskCondition.CONSECUTIVE_WINS,
    target: 10,
    reward: 1000,
    icon: '⚡'
  }
];

export class TaskManager {
  private static STORAGE_KEY = 'dou_dizhu_task_data';
  private static DAILY_RESET_HOUR = 4;
  private static DAILY_TASK_COUNT = 3;

  private static getDefaultTaskData(): ITaskData {
    return {
      dailyTasks: [],
      achievements: ACHIEVEMENTS.map(a => ({
        taskId: a.id,
        current: 0,
        completed: false,
        claimed: false
      })),
      lastDailyReset: 0,
      stats: {
        totalWins: 0,
        highestScore: 0,
        rocketFinishes: 0,
        bombsUsed: 0,
        gamesPlayed: 0,
        currentWinStreak: 0,
        maxWinStreak: 0,
        currentLandlordWinStreak: 0,
        maxLandlordWinStreak: 0,
        winsWithBomb: 0
      }
    };
  }

  static loadTaskData(): ITaskData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ITaskData;
        if (this.shouldResetDailyTasks(data.lastDailyReset)) {
          return this.resetDailyTasks(data);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to load task data:', e);
    }
    return this.initializeNewData();
  }

  private static initializeNewData(): ITaskData {
    const data = this.getDefaultTaskData();
    data.dailyTasks = this.generateDailyTasks();
    data.lastDailyReset = Date.now();
    this.saveTaskData(data);
    return data;
  }

  private static shouldResetDailyTasks(lastReset: number): boolean {
    const now = new Date();
    const lastResetDate = new Date(lastReset);

    const resetToday = new Date();
    resetToday.setHours(this.DAILY_RESET_HOUR, 0, 0, 0);

    const resetYesterday = new Date(resetToday);
    resetYesterday.setDate(resetYesterday.getDate() - 1);

    if (now >= resetToday) {
      return lastResetDate < resetToday;
    } else {
      return lastResetDate < resetYesterday;
    }
  }

  private static resetDailyTasks(data: ITaskData): ITaskData {
    const newData = { ...data };
    newData.dailyTasks = this.generateDailyTasks();
    newData.lastDailyReset = Date.now();
    newData.stats = {
      ...newData.stats,
      currentWinStreak: 0,
      currentLandlordWinStreak: 0
    };
    this.saveTaskData(newData);
    return newData;
  }

  private static generateDailyTasks(): ITaskProgress[] {
    const shuffled = [...DAILY_TASK_POOL].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, this.DAILY_TASK_COUNT);
    return selected.map(task => ({
      taskId: task.id,
      current: 0,
      completed: false,
      claimed: false
    }));
  }

  static saveTaskData(data: ITaskData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save task data:', e);
    }
  }

  static getDailyTaskDefinitions(): ITaskDefinition[] {
    return DAILY_TASK_POOL;
  }

  static getAchievementDefinitions(): ITaskDefinition[] {
    return ACHIEVEMENTS;
  }

  static getDailyTasks(data: ITaskData): { definition: ITaskDefinition; progress: ITaskProgress }[] {
    return data.dailyTasks
      .map(progress => {
        const definition = DAILY_TASK_POOL.find(d => d.id === progress.taskId);
        return definition ? { definition, progress } : null;
      })
      .filter((item): item is { definition: ITaskDefinition; progress: ITaskProgress } => item !== null);
  }

  static getAchievements(data: ITaskData): { definition: ITaskDefinition; progress: ITaskProgress }[] {
    return data.achievements
      .map(progress => {
        const definition = ACHIEVEMENTS.find(d => d.id === progress.taskId);
        return definition ? { definition, progress } : null;
      })
      .filter((item): item is { definition: ITaskDefinition; progress: ITaskProgress } => item !== null);
  }

  static recordGameEnd(
    data: ITaskData,
    isWin: boolean,
    isLandlord: boolean,
    usedBomb: boolean,
    usedRocket: boolean,
    scoreGained: number
  ): ITaskUpdateResult {
    const newData = { ...data };
    newData.stats = { ...data.stats };
    const updatedTasks: ITaskUpdateResult['updatedTasks'] = [];

    newData.stats.gamesPlayed++;

    if (isWin) {
      newData.stats.totalWins++;
      newData.stats.currentWinStreak++;
      newData.stats.maxWinStreak = Math.max(newData.stats.maxWinStreak, newData.stats.currentWinStreak);
      newData.stats.highestScore = Math.max(newData.stats.highestScore, scoreGained);

      if (isLandlord) {
        newData.stats.currentLandlordWinStreak++;
        newData.stats.maxLandlordWinStreak = Math.max(
          newData.stats.maxLandlordWinStreak,
          newData.stats.currentLandlordWinStreak
        );
      } else {
        newData.stats.currentLandlordWinStreak = 0;
      }

      if (usedBomb) {
        newData.stats.winsWithBomb++;
      }

      if (usedRocket) {
        newData.stats.rocketFinishes++;
      }
    } else {
      newData.stats.currentWinStreak = 0;
      newData.stats.currentLandlordWinStreak = 0;
    }

    if (usedBomb) {
      newData.stats.bombsUsed++;
    }

    const dailyTasksCopy = newData.dailyTasks.map(t => ({ ...t }));
    dailyTasksCopy.forEach(progress => {
      const definition = DAILY_TASK_POOL.find(d => d.id === progress.taskId);
      if (!definition || progress.completed) return;

      const previousProgress = progress.current;
      let newCurrent = previousProgress;

      switch (definition.condition) {
        case TaskCondition.WINS_TODAY:
          if (isWin) {
            newCurrent = Math.min(definition.target, previousProgress + 1);
          }
          break;
        case TaskCondition.WIN_WITH_BOMB:
          if (isWin && usedBomb) {
            newCurrent = Math.min(definition.target, previousProgress + 1);
          }
          break;
        case TaskCondition.LANDLORD_WIN_STREAK:
          if (isWin && isLandlord) {
            newCurrent = Math.min(definition.target, newData.stats.currentLandlordWinStreak);
          }
          break;
        case TaskCondition.BOMBS_USED:
          if (usedBomb) {
            newCurrent = Math.min(definition.target, previousProgress + 1);
          }
          break;
        case TaskCondition.GAMES_PLAYED:
          newCurrent = Math.min(definition.target, previousProgress + 1);
          break;
      }

      if (newCurrent !== previousProgress) {
        progress.current = newCurrent;
        const justCompleted = newCurrent >= definition.target && !progress.completed;
        if (justCompleted) {
          progress.completed = true;
          progress.completedAt = Date.now();
        }
        updatedTasks.push({
          task: definition,
          progress: { ...progress },
          previousProgress,
          justCompleted
        });
      }
    });
    newData.dailyTasks = dailyTasksCopy;

    const achievementsCopy = newData.achievements.map(t => ({ ...t }));
    achievementsCopy.forEach(progress => {
      const definition = ACHIEVEMENTS.find(d => d.id === progress.taskId);
      if (!definition || progress.completed) return;

      const previousProgress = progress.current;
      let newCurrent = previousProgress;

      switch (definition.condition) {
        case TaskCondition.TOTAL_WINS:
          newCurrent = Math.min(definition.target, newData.stats.totalWins);
          break;
        case TaskCondition.HIGHEST_SCORE:
          newCurrent = Math.min(definition.target, newData.stats.highestScore);
          break;
        case TaskCondition.ROCKET_FINISH:
          newCurrent = Math.min(definition.target, newData.stats.rocketFinishes);
          break;
        case TaskCondition.BOMBS_USED:
          newCurrent = Math.min(definition.target, newData.stats.bombsUsed);
          break;
        case TaskCondition.GAMES_PLAYED:
          newCurrent = Math.min(definition.target, newData.stats.gamesPlayed);
          break;
        case TaskCondition.CONSECUTIVE_WINS:
          newCurrent = Math.min(definition.target, newData.stats.maxWinStreak);
          break;
      }

      if (newCurrent !== previousProgress) {
        progress.current = newCurrent;
        const justCompleted = newCurrent >= definition.target && !progress.completed;
        if (justCompleted) {
          progress.completed = true;
          progress.completedAt = Date.now();
        }
        updatedTasks.push({
          task: definition,
          progress: { ...progress },
          previousProgress,
          justCompleted
        });
      }
    });
    newData.achievements = achievementsCopy;

    this.saveTaskData(newData);

    return { updatedTasks };
  }

  static claimTask(data: ITaskData, taskId: string, taskType: TaskType): ITaskData {
    const newData = { ...data };

    if (taskType === TaskType.DAILY) {
      newData.dailyTasks = newData.dailyTasks.map(t =>
        t.taskId === taskId && t.completed && !t.claimed
          ? { ...t, claimed: true }
          : t
      );
    } else {
      newData.achievements = newData.achievements.map(t =>
        t.taskId === taskId && t.completed && !t.claimed
          ? { ...t, claimed: true }
          : t
      );
    }

    this.saveTaskData(newData);
    return newData;
  }

  static getTimeUntilNextReset(): number {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setHours(this.DAILY_RESET_HOUR, 0, 0, 0);

    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    return nextReset.getTime() - now.getTime();
  }

  static formatTimeUntilReset(): string {
    const ms = this.getTimeUntilNextReset();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分钟`;
  }
}
