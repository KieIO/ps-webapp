import { Input, Modal, message } from 'antd';

export type DeclineReasonModalOptions = {
  title: string;
  description: string;
  onConfirm: (reason: string) => void | Promise<void>;
};

/** Confirm decline with a required reason (CH / CM / Staff). */
export const openDeclineReasonModal = ({
  title,
  description,
  onConfirm,
}: DeclineReasonModalOptions): void => {
  let reason = '';

  Modal.confirm({
    title,
    centered: true,
    okText: 'Từ chối',
    okButtonProps: { danger: true },
    cancelText: 'Quay lại',
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>{description}</p>
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do từ chối (bắt buộc)"
          maxLength={2000}
          onChange={(event) => {
            reason = event.target.value;
          }}
        />
      </div>
    ),
    onOk: () => {
      const trimmed = reason.trim();
      if (!trimmed) {
        message.error('Vui lòng nhập lý do từ chối');
        return Promise.reject(new Error('decline reason required'));
      }
      return Promise.resolve(onConfirm(trimmed));
    },
  });
};
