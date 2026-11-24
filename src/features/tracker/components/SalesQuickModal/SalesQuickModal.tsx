import { Form, Input, Modal, Switch } from 'antd';
import { useEffect } from 'react';
import { useUpdateProjectSalesName } from '@/features/projects/hooks/useUpdateProjectSalesName';
import styles from './SalesQuickModal.module.scss';

export type SalesQuickTarget = {
  projectId: string;
  projectName: string;
  salesName: string;
};

interface SalesQuickModalProps {
  target: SalesQuickTarget | null;
  sortBySalesName: boolean;
  onSortBySalesNameChange: (next: boolean) => void;
  onClose: () => void;
}

type FormValues = {
  salesName: string;
};

export function SalesQuickModal({
  target,
  sortBySalesName,
  onSortBySalesNameChange,
  onClose,
}: SalesQuickModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate, isPending } = useUpdateProjectSalesName();
  const hasExisting = Boolean(target?.salesName.trim());

  useEffect(() => {
    if (!target) return;
    form.setFieldsValue({ salesName: target.salesName });
  }, [target, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const persistSalesName = (salesName: string) => {
    if (!target) return;
    mutate({ id: target.projectId, salesName }, { onSuccess: () => handleClose() });
  };

  const handleFinish = (values: FormValues) => {
    if (!target) return;
    const next = values.salesName?.trim() ?? '';
    if (next === target.salesName.trim()) {
      handleClose();
      return;
    }
    persistSalesName(next);
  };

  const handleClear = () => {
    if (!target) return;
    form.setFieldsValue({ salesName: '' });
    persistSalesName('');
  };

  return (
    <Modal
      title={
        hasExisting
          ? `Sửa Sales — ${target?.projectName ?? ''}`
          : `Thêm Sales — ${target?.projectName ?? ''}`
      }
      open={Boolean(target)}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Lưu"
      confirmLoading={isPending}
      destroyOnHidden
      width={440}
      className={styles.modal}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className={styles.footer}>
          <div>
            {hasExisting ? (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClear}
                disabled={isPending}
              >
                Xóa Sales
              </button>
            ) : null}
          </div>
          <div className={styles.footerActions}>
            <CancelBtn />
            <OkBtn />
          </div>
        </div>
      )}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="salesName"
          label="Sales name"
          extra="Tên người Sales phụ trách project (text tự do)."
        >
          <Input
            placeholder="VD: Lan Nguyen"
            maxLength={255}
            allowClear
            autoFocus
            disabled={isPending}
          />
        </Form.Item>

        <div className={styles.sortRow}>
          <div className={styles.sortCopy}>
            <p className={styles.sortTitle}>Sắp xếp Tracker theo Sales</p>
            <p className={styles.sortHint}>
              Bật để xếp các hàng project theo tên Sales A→Z. Project chưa có Sales nằm cuối danh
              sách. Tùy chọn lưu trên trình duyệt này.
            </p>
          </div>
          <Switch
            checked={sortBySalesName}
            onChange={onSortBySalesNameChange}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
            aria-label="Sắp xếp Tracker theo Sales"
          />
        </div>
      </Form>
    </Modal>
  );
}
