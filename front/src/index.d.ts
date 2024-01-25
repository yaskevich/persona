import { StyleValue } from 'vue';
import type { UploadInst, UploadFileInfo, MessageType } from 'naive-ui';

declare global {
  interface keyable {
    [key: string]: any;
  }

  interface IData {
    facts: number;
    books: number;
    works: number;
    persons: number;
  }

  interface IUser {
    sex: string;
    lastname : string;
    firstname: string;
    email: string;
    privs: number | string;
    id: number;
  }

  interface IState {
    token?: string;
    user?: {
      server: number;
      commit: number;
    },
    error: string;
  
  }
}
