declare module 'react-native-push-notification' {
  export interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  export interface PushNotificationOptions {
    onNotification?: (notification: any) => void;
    onRegister?: (token: { os: string; token: string }) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface ChannelOptions {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export interface LocalNotificationObject {
    channelId?: string;
    title?: string;
    message: string;
    playSound?: boolean;
    soundName?: string;
    importance?: string;
    vibrate?: boolean;
    vibration?: number;
    userInfo?: any;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MIN = 1,
    NONE = 0,
  }

  export default class PushNotification {
    static configure(options: PushNotificationOptions): void;
    static localNotification(notification: LocalNotificationObject): void;
    static cancelAllLocalNotifications(): void;
    static checkPermissions(callback: (permissions: PushNotificationPermissions) => void): void;
    static requestPermissions(): Promise<PushNotificationPermissions>;
    static createChannel(options: ChannelOptions, callback?: (created: boolean) => void): void;
  }
}
