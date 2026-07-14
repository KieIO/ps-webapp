import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { myTaskApi } from '../api';

export type RemindMyTaskVariables = {
  id: string;
  /** Why the manager is reminding — drives success toast copy. */
  issue?: 'unconfirmed' | 'deadline_risk';
};

const mapRemindError = (raw: string): string => {
  if (raw.includes('no assignees with linked')) {
    return 'Không gửi được: staff chưa liên kết tài khoản';
  }
  if (raw.includes('task has no assignees')) {
    return 'Không gửi được: task chưa có người được gán';
  }
  if (raw.includes('no active assignees')) {
    return 'Không gửi được: không có nhân viên active để nhận nhắc nhở';
  }
  if (raw.includes('cancelled task')) {
    return 'Không gửi được: task đã bị hủy';
  }
  if (raw.includes('finished task')) {
    return 'Không gửi được: task đã hoàn thành';
  }
  if (raw.includes('declined task')) {
    return 'Không gửi được: task đã bị từ chối';
  }
  return raw || 'Không gửi được nhắc nhở';
};

const successCopy = (issue: RemindMyTaskVariables['issue'], count: number): string => {
  const noun =
    issue === 'deadline_risk'
      ? 'nhắc deadline'
      : issue === 'unconfirmed'
        ? 'nhắc cập nhật'
        : 'nhắc nhở';
  if (count > 1) {
    return `Đã gửi ${noun} tới ${count} người`;
  }
  return `Đã gửi ${noun}`;
};

export const useRemindMyTask = () =>
  useMutation({
    mutationFn: ({ id }: RemindMyTaskVariables) => myTaskApi.remind(id),
    onSuccess: (result, variables) => {
      // Recipients get SSE; sender does not need inbox invalidation.
      message.success(successCopy(variables.issue, result.notifiedCount));
    },
    onError: (error: Error) => {
      message.error(mapRemindError(error.message || ''));
    },
  });
