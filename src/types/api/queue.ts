import { HintedUser, HookError, FileItemType } from './common';

//export namespace API {
export interface QueueSource {
  user: HintedUser;
  last_speed: number;
}

export interface QueueBundleSource extends QueueSource {
  files: number;
  size: number;
}

export const enum QueuePriorityEnum {
  DEFAULT = -1,
  PAUSED_FORCED = 0,
  PAUSED = 1,
  LOWEST = 2,
  LOW = 3,
  NORMAL = 4,
  HIGH = 5,
  HIGHEST = 6,
}

export interface QueuePriority {
  id: QueuePriorityEnum;
  str: string;
  auto: boolean;
}

export const enum QueueBundleStatusEnum {
  NEW = 'new',
  QUEUED = 'queued',
  DOWNLOAD_ERROR = 'download_error',
  RECHECK = 'recheck',
  DOWNLOADED = 'downloaded',
  COMPLETION_VALIDATION_RUNNING = 'completion_validation_running',
  COMPLETION_VALIDATION_ERROR = 'completion_validation_error',
  COMPLETED = 'completed',
  SHARED = 'shared',
}

export interface QueueBundleStatus {
  id: QueueBundleStatusEnum;
  failed: boolean;
  downloaded: boolean;
  completed: boolean;
  str: string;
  hook_error: HookError;
}

export interface QueueFileStatus {
  str: string;
  downloaded: boolean;
  completed: boolean;
}

export interface QueueItemBase {
  size: number;
  downloaded_bytes: number;
  priority: QueuePriority;
  time_added: number;
  time_finished: number;
  speed: number;
  seconds_left: number;
  sources: QueueSource;
}

export interface QueueFile extends QueueItemBase {
  id: number;
  name: string;
  target: string;
  type: FileItemType;
  bundle: number;
  status: QueueFileStatus;
  tth: string;
}

export interface QueueBundle extends QueueItemBase {
  id: number;
  name: string;
  target: string;
  type: FileItemType;
  status: QueueBundleStatus;
}
//}