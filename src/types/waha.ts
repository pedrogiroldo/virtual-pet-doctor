export interface WahaMessageData {
  [key: string]: any;
}

export interface WahaMessagePayload {
  id: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  to: string;
  body: string;
  hasMedia: boolean;
  ack: number;
  vCards: any[];
  _data: WahaMessageData;
}

export interface WahaWebhookBody {
  event: string;
  session: string;
  payload: WahaMessagePayload;
}

export type WahaWebhookEvent = WahaWebhookBody & {
  event: 'message';
};
