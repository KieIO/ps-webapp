import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return cleanApiValidationMessage(message);
    }
    const status = error.response?.status;
    if (status === 422) {
      return 'Dữ liệu không hợp lệ. Kiểm tra lại form rồi thử lại.';
    }
    if (status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (status === 404) {
      return 'Không tìm thấy dữ liệu.';
    }
  }
  if (error instanceof Error && error.message) {
    if (/status code 422/i.test(error.message)) {
      return 'Dữ liệu không hợp lệ. Kiểm tra lại form rồi thử lại.';
    }
    return error.message;
  }
  return fallback;
};

const cleanApiValidationMessage = (message: string): string => {
  const trimmed = message.replace(/^validation error:\s*/i, '').trim();
  const known: Record<string, string> = {
    'staff is required for project tasks':
      'Project task cần chọn nhân viên — trừ khi chuyển sang Creative Department.',
    'department is invalid': 'Phòng ban không hợp lệ.',
    'department is required for project tasks': 'Project task cần chọn phòng ban.',
    'projectManager is required': 'Cần chọn Project Manager.',
    'taskName is required': 'Cần nhập tên task.',
    'task is not awaiting Creative Head assignment':
      'Task này đã được Creative Head khác xử lý hoặc không còn trong hàng chờ.',
    'task is not awaiting Creative Manager assignment':
      'Task này không còn chờ Creative Manager xử lý.',
    'assignee must be a Creative Manager': 'Chỉ được assign cho Creative Manager.',
    'assign Creative Staff, not CM/CH': 'Chỉ được giao cho Creative Staff.',
    'split requires at least 2 subtasks': 'Chia nhỏ cần ít nhất 2 task.',
    'mode must be whole or split': 'Chọn giao nguyên task hoặc chia nhỏ.',
    'cmUserId is required': 'Chọn Creative Manager.',
    'description is required before assigning CM': 'Cần fill brief trước khi assign CM.',
  };
  return known[trimmed] ?? trimmed;
};

export const rethrowApiError = (error: unknown, fallback?: string): never => {
  throw new Error(getApiErrorMessage(error, fallback));
};
