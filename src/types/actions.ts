export type ActionType =
  | 'OPEN_CAMERA'
  | 'TORCH_ON'
  | 'TORCH_OFF'
  | 'CALL_PHONE'
  | 'OPEN_APP';

export interface MobileAction {
  type: ActionType;
  rawCommand: string;
  parameter?: string; // Number for call, AppName for app
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mayra' | 'system';
  text: string;
  cleanText?: string;
  action?: MobileAction;
  timestamp: Date;
}
