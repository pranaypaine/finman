/**
 * Type declarations for react-native-sms-android
 */

declare module 'react-native-sms-android' {
  export interface SmsFilter {
    box: 'inbox' | 'sent';
    minDate?: number;
    maxDate?: number;
    bodyRegex?: string;
    read?: 0 | 1;
    indexFrom?: number;
    maxCount?: number;
  }

export interface SmsMessage {
    _id: string;
    thread_id: string;
    address: string;
    person: string | null;
    date: string;
    date_sent: string;
    protocol: string | null;
    read: '0' | '1';
    status: string;
    type: string;
    subject: string | null;
    body: string;
    service_center: string | null;
    locked: '0' | '1';
    error_code: string;
    sub_id: string;
    seen: '0' | '1';
    deletable: '0' | '1';
    sim_slot: string;
    hidden: '0' | '1';
    app_id: string;
    msg_id: string;
    reserved: string;
    pri: string;
    teleservice_id: string;
    svc_cmd: string;
    roam_pending: string;
    spam_report: string;
    secret_mode: string;
    safe_message: string;
    favorite: string;
  }

  export interface SmsAndroid {
    list(
      filter: string,
      fail: (error: any) => void,
      success: (count: number, smsList: string) => void,
    ): void;

    delete(
      messageId: string,
      fail: (error: any) => void,
      success: (count: number) => void,
    ): void;

    autoSend(
      phoneNumber: string,
      message: string,
      fail: (error: any) => void,
      success: () => void,
    ): void;
  }

  const smsAndroid: SmsAndroid;
  export default smsAndroid;
}
