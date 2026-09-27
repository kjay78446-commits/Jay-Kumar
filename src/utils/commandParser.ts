import { MobileAction, ActionType } from '../types/actions';

export interface ParseResult {
  hasAction: boolean;
  action?: MobileAction;
  cleanText: string;
  commandCode?: string;
}

export function parseAssistantResponse(text: string): ParseResult {
  // Regex to look for commands:
  // ACTION_OPEN_CAMERA
  // ACTION_TORCH_ON
  // ACTION_TORCH_OFF
  // ACTION_CALL_[Number]
  // ACTION_OPEN_APP_[AppName]

  const cameraRegex = /ACTION_OPEN_CAMERA/i;
  const torchOnRegex = /ACTION_TORCH_ON/i;
  const torchOffRegex = /ACTION_TORCH_OFF/i;
  const callRegex = /ACTION_CALL_([A-Za-z0-9_+\- ]+)/i;
  const openAppRegex = /ACTION_OPEN_APP_([A-Za-z0-9_+\- ]+)/i;

  let actionType: ActionType | null = null;
  let parameter: string | undefined = undefined;
  let rawCommand = '';

  if (cameraRegex.test(text)) {
    actionType = 'OPEN_CAMERA';
    rawCommand = 'ACTION_OPEN_CAMERA';
  } else if (torchOnRegex.test(text)) {
    actionType = 'TORCH_ON';
    rawCommand = 'ACTION_TORCH_ON';
  } else if (torchOffRegex.test(text)) {
    actionType = 'TORCH_OFF';
    rawCommand = 'ACTION_TORCH_OFF';
  } else {
    const callMatch = text.match(callRegex);
    if (callMatch) {
      actionType = 'CALL_PHONE';
      rawCommand = callMatch[0];
      parameter = callMatch[1].trim();
    } else {
      const appMatch = text.match(openAppRegex);
      if (appMatch) {
        actionType = 'OPEN_APP';
        rawCommand = appMatch[0];
        parameter = appMatch[1].trim();
      }
    }
  }

  // Clean the text by removing the raw command for natural speech reading
  let cleanText = text;
  if (rawCommand) {
    cleanText = text.replace(rawCommand, '').replace(/\s{2,}/g, ' ').trim();
  }

  if (actionType) {
    return {
      hasAction: true,
      action: {
        type: actionType,
        rawCommand,
        parameter,
        timestamp: new Date(),
        status: 'pending',
      },
      cleanText: cleanText || text,
      commandCode: rawCommand,
    };
  }

  return {
    hasAction: false,
    cleanText: text,
  };
}
