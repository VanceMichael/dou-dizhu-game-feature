import { ScoreManager } from './ScoreManager';

export enum TaskCategory {
  DAILY = 'daily',
  ACHIEVEMENT = 'achievement'
}

export enum TaskType {
  WIN_GAMES = 'win_games',
  WIN_WITH_BOMB = 'win_with_bomb',
  WIN_WITH_ROCKET = 'win_with_rocket',
  LANDLORD_CONSECUTIVE_WINS = 'landlord_consecutive_wins',
  TOTAL_WINS = 'total_wins',
  TOTAL_GAMES = 'total_games',
  HIGHEST_SCORE = 'highest_score',
  ROCKET_FINISH = 'rocket_finish',
  BOMB_WIN_COUNT = 'bomb_win_count',
  LANDLORD_WINS = 'landlord_wins',
  FARMER_WINS = 'farmer_wins'
}

export interface ITaskDefinition {
  id: string;
  category: TaskCategory;
  type: TaskType;
  name: string;
  description: string;
  target: number;
  reward: number;
}

export interface ITaskProgress {
  taskId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface ITaskData {
  dailyTasks: ITaskProgress[];
  achievements: ITaskProgress[];
  lastDailyReset: number;
}

interface IGameResult {
  isWin: boolean;
  isLandlord: boolean;
  scoreChange: number;
  usedBomb: boolean;
  usedRocket: boolean;
  finishedWithRocket: boolean;
  landlordConsecutiveWins: number;
  highestScore: number;
}

const DAILY_TASK_POOL: ITaskDefinition[] = [
  {
    id: 'daily_win_3',
    category: TaskCategory.DAILY,
    type: TaskType.WIN_GAMES,
    name: '今日获胜',
    description: '今日胜利3局',
    target: 3,
    reward: 50
  },
  {
    id: 'daily_win_5',
    category: TaskCategory.DAILY,
    type: TaskType.WIN_GAMES,
    name: '常胜将军',
    description: '今日胜利5局',
    target: 5,
    reward: 80
  },
  {
    id: 'daily_bomb_win',
    category: TaskCategory.DAILY,
    type: TaskType.WIN_WITH_BOMB,
    name: '炸弹高手',
    description: '用炸弹打赢一局',
    target: 1,
    reward: 40
  },
  {
    id: 'daily_rocket_win',
    category: TaskCategory.DAILY,
    type: TaskType.WIN_WITH_ROCKET,
    name: '火箭升空',
    description: '用王炸打赢一局',
    target: 1,
    reward: 60
  },
  {
    id: 'daily_landlord_streak_2',
    category: TaskCategory.DAILY,
    type: TaskType.LANDLORD_CONSECUTIVE_WINS,
    name: '地主连胜',
    description: '当地主连续胜利2局',
    target: 2,
    reward: 50
  },
  {
    id: 'daily_play_5',
    category: TaskCategory.DAILY,
    type: TaskType.TOTAL_GAMES,
    name: '勤勉牌手',
    description: '今日打满5局',
    target: 5,
    reward: 30
  },
  {
    id: 'daily_landlord_win',
    category: TaskCategory.DAILY,
    type: TaskType.LANDLORD_WINS,
    name: '地主威风',
    description: '当地主赢1局',
    target: 1,
    reward: 40
  },
  {
    id: 'daily_farmer_win',
    category: TaskCategory.DAILY,
    type: TaskType.FARMER_WINS,
    name: '农民起义',
    description: '当农民赢2局',
    target: 2,
    reward: 40
  }
];

const ACHIEVEMENT_DEFINITIONS: ITaskDefinition[] = [
  {
    id: 'ach_total_wins_10',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.TOTAL_WINS,
    name: '初出茅庐',
    description: '累计胜利10局',
    target: 10,
    reward: 100
  },
  {
    id: 'ach_total_wins_50',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.TOTAL_WINS,
    name: '小有名气',
    description: '累计胜利50局',
    target: 50,
    reward: 300
  },
  {
    id: 'ach_total_wins_100',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.TOTAL_WINS,
    name: '百战百胜',
    description: '累计胜利100局',
    target: 100,
    reward: 800
  },
  {
    id: 'ach_total_games_50',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.TOTAL_GAMES,
    name: '牌场常客',
    description: '累计打满50局',
    target: 50,
    reward: 200
  },
  {
    id: 'ach_highest_score_5000',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.HIGHEST_SCORE,
    name: '高分达人',
    description: '单局积分变化达到500',
    target: 500,
    reward: 150
  },
  {
    id: 'ach_rocket_finish_10',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.ROCKET_FINISH,
    name: '王炸收官',
    description: '王炸收官10次',
    target: 10,
    reward: 500
  },
  {
    id: 'ach_bomb_win_20',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.BOMB_WIN_COUNT,
    name: '炸弹专家',
    description: '用炸弹赢20局',
    target: 20,
    reward: 400
  },
  {
    id: 'ach_landlord_wins_30',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.LANDLORD_WINS,
    name: '地主大王',
    description: '当地主累计胜利30局',
    target: 30,
    reward: 500
  },
  {
    id: 'ach_farmer_wins_50',
    category: TaskCategory.ACHIEVEMENT,
    type: TaskType.FARMER_WINS,
    name: '农民英雄',
    description: '当农民累计胜利50局',
    target: 50,
    reward: 500
  }
];

export class TaskManager {
  private static STORAGE_KEY = 'dou_dizhu_task_data';

  static getDailyTaskPool(): ITaskDefinition[] {
    return DAILY_TASK_POOL;
  }

  static getAchievementDefinitions(): ITaskDefinition[] {
    return ACHIEVEMENT_DEFINITIONS;
  }

  static getTaskDefinition(taskId: string): ITaskDefinition | undefined {
    return DAILY_TASK_POOL.find(t => t.id === taskId) || ACHIEVEMENT_DEFINITIONS.find(t => t.id === taskId);
  }

  private static getLastResetTimestamp(): number {
    const now = new Date();
    const resetDate = new Date(now);
    resetDate.setHours(4, 0, 0, 0);
    if (now.getHours() < 4) {
      resetDate.setDate(resetDate.getDate() - 1);
    }
    return resetDate.getTime();
  }

  static needsDailyReset(lastReset: number): boolean {
    const threshold = this.getLastResetTimestamp();
    return lastReset < threshold;
  }

  private static generateDailyTasks(): ITaskProgress[] {
    const shuffled = [...DAILY_TASK_POOL].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return selected.map(t => ({
      taskId: t.id,
      current: 0,
      completed: false,
      claimed: false
    }));
  }

  static getDefaultTaskData(): ITaskData {
    return {
      dailyTasks: this.generateDailyTasks(),
      achievements: ACHIEVEMENT_DEFINITIONS.map(a => ({
        taskId: a.id,
        current: 0,
        completed: false,
        claimed: false
      })),
      lastDailyReset: Date.now()
    };
  }

  static loadTaskData(): ITaskData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: ITaskData = JSON.parse(stored);

        const existingIds = new Set(data.achievements.map(a => a.taskId));
        for (const def of ACHIEVEMENT_DEFINITIONS) {
          if (!existingIds.has(def.id)) {
            data.achievements.push({
              taskId: def.id,
              current: 0,
              completed: false,
              claimed: false
            });
          }
        }

        if (this.needsDailyReset(data.lastDailyReset)) {
          data.dailyTasks = this.generateDailyTasks();
          data.lastDailyReset = Date.now();
        }

        return data;
      }
    } catch (e) {
      console.error('Failed to load task data:', e);
    }
    return this.getDefaultTaskData();
  }

  static saveTaskData(data: ITaskData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save task data:', e);
    }
  }

  static updateProgress(result: IGameResult): {
    dailyProgress: { taskId: string; name: string; description: string; prev: number; current: number; target: number; justCompleted: boolean }[];
    achievementProgress: { taskId: string; name: string; description: string; prev: number; current: number; target: number; justCompleted: boolean }[];
    totalReward: number;
  } {
    const data = this.loadTaskData();
    const dailyProgress: { taskId: string; name: string; description: string; prev: number; current: number; target: number; justCompleted: boolean }[] = [];
    const achievementProgress: { taskId: string; name: string; description: string; prev: number; current: number; target: number; justCompleted: boolean }[] = [];
    let totalReward = 0;

    const increments: Partial<Record<TaskType, number>> = {};
    increments[TaskType.TOTAL_GAMES] = 1;

    if (result.isWin) {
      increments[TaskType.WIN_GAMES] = 1;
      increments[TaskType.TOTAL_WINS] = 1;
      if (result.isLandlord) {
        increments[TaskType.LANDLORD_WINS] = 1;
        increments[TaskType.LANDLORD_CONSECUTIVE_WINS] = result.landlordConsecutiveWins;
      } else {
        increments[TaskType.FARMER_WINS] = 1;
      }
      if (result.usedBomb) {
        increments[TaskType.WIN_WITH_BOMB] = 1;
        increments[TaskType.BOMB_WIN_COUNT] = 1;
      }
      if (result.usedRocket) {
        increments[TaskType.WIN_WITH_ROCKET] = 1;
      }
      if (result.finishedWithRocket) {
        increments[TaskType.ROCKET_FINISH] = 1;
      }
    }
    if (result.scoreChange >= 500 || result.scoreChange <= -500) {
      increments[TaskType.HIGHEST_SCORE] = Math.abs(result.scoreChange);
    }

    for (const task of data.dailyTasks) {
      const def = DAILY_TASK_POOL.find(d => d.id === task.taskId);
      if (!def || task.completed) continue;

      const inc = increments[def.type];
      if (inc === undefined || inc === 0) continue;

      const prev = task.current;
      if (def.type === TaskType.LANDLORD_CONSECUTIVE_WINS) {
        task.current = inc;
      } else {
        task.current = Math.min(task.current + inc, def.target);
      }

      const justCompleted = !task.completed && task.current >= def.target;
      if (justCompleted) {
        task.completed = true;
        totalReward += def.reward;
      }

      dailyProgress.push({
        taskId: def.id,
        name: def.name,
        description: def.description,
        prev,
        current: task.current,
        target: def.target,
        justCompleted
      });
    }

    for (const task of data.achievements) {
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === task.taskId);
      if (!def || task.completed) continue;

      const inc = increments[def.type];
      if (inc === undefined || inc === 0) continue;

      const prev = task.current;
      task.current = Math.min(task.current + inc, def.target);

      const justCompleted = !task.completed && task.current >= def.target;
      if (justCompleted) {
        task.completed = true;
        totalReward += def.reward;
      }

      achievementProgress.push({
        taskId: def.id,
        name: def.name,
        description: def.description,
        prev,
        current: task.current,
        target: def.target,
        justCompleted
      });
    }

    this.saveTaskData(data);

    return { dailyProgress, achievementProgress, totalReward };
  }

  static claimReward(taskId: string): number | null {
    const data = this.loadTaskData();
    const allTasks = [...data.dailyTasks, ...data.achievements];
    const task = allTasks.find(t => t.taskId === taskId);
    if (!task || !task.completed || task.claimed) return null;

    task.claimed = true;
    this.saveTaskData(data);

    const def = this.getTaskDefinition(taskId);
    if (def) {
      this.addRewardToScore(def.reward);
      return def.reward;
    }
    return null;
  }

  static claimAllRewards(): number {
    const data = this.loadTaskData();
    let total = 0;
    const allTasks = [...data.dailyTasks, ...data.achievements];
    for (const task of allTasks) {
      if (task.completed && !task.claimed) {
        task.claimed = true;
        const def = this.getTaskDefinition(task.taskId);
        if (def) total += def.reward;
      }
    }
    this.saveTaskData(data);
    if (total > 0) {
      this.addRewardToScore(total);
    }
    return total;
  }

  private static addRewardToScore(reward: number): void {
    const stats = ScoreManager.loadPlayerStats('player_0', '玩家');
    stats.totalScore += reward;
    ScoreManager.savePlayerStats(stats);
  }

  static getUnclaimedCount(): number {
    const data = this.loadTaskData();
    return [...data.dailyTasks, ...data.achievements].filter(t => t.completed && !t.claimed).length;
  }
}
