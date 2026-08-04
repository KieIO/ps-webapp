import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import {
  CLIENT_NOTE_CATEGORIES,
  CLIENT_NOTE_CATEGORY_LABELS,
  type ClientNote,
  type ClientNoteCategory,
  type CreateClientNoteRequest,
  type UpdateClientNoteRequest,
} from '../../schemas/clientNote.schema';
import { useCreateClientNote, useUpdateClientNote } from '../../hooks/useClientNotes';

interface RelatedProjectOption {
  id: string;
  label: string;
}

interface ClientNoteFormModalProps {
  open: boolean;
  clientId: string;
  note?: ClientNote | null;
  relatedProjectOptions: RelatedProjectOption[];
  /** Prefill related project when creating from a project context. */
  defaultRelatedProjectId?: string | null;
  onClose: () => void;
}

type FormValues = {
  title?: string;
  body: string;
  category: ClientNoteCategory;
  relatedProjectId?: string | null;
};

const categoryOptions = CLIENT_NOTE_CATEGORIES.map((value) => ({
  value,
  label: CLIENT_NOTE_CATEGORY_LABELS[value],
}));

export function ClientNoteFormModal({
  open,
  clientId,
  note,
  relatedProjectOptions,
  defaultRelatedProjectId,
  onClose,
}: ClientNoteFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate: createNote, isPending: isCreating } = useCreateClientNote(clientId);
  const { mutate: updateNote, isPending: isUpdating } = useUpdateClientNote(clientId);
  const isEdit = Boolean(note);
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (note) {
      form.setFieldsValue({
        title: note.title,
        body: note.body,
        category: note.category,
        relatedProjectId: note.relatedProjectId ?? undefined,
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      category: 'general',
      relatedProjectId: defaultRelatedProjectId ?? undefined,
    });
  }, [open, note, defaultRelatedProjectId, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    const relatedProjectId = values.relatedProjectId || null;

    if (isEdit && note) {
      const payload: UpdateClientNoteRequest = {
        title: values.title ?? '',
        body: values.body,
        category: values.category,
        relatedProjectId: relatedProjectId ?? undefined,
        clearRelated: !relatedProjectId,
      };
      updateNote(
        { noteId: note.id, payload },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
      return;
    }

    const payload: CreateClientNoteRequest = {
      title: values.title ?? '',
      body: values.body,
      category: values.category,
      relatedProjectId,
    };
    createNote(payload, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title={isEdit ? 'Edit note' : 'Add note'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Add note'}
      confirmLoading={isPending}
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select options={categoryOptions} />
        </Form.Item>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ max: 255, message: 'Title must be at most 255 characters' }]}
        >
          <Input placeholder="Short label (optional)" maxLength={255} showCount />
        </Form.Item>
        <Form.Item
          name="body"
          label="Note"
          rules={[{ required: true, message: 'Note is required' }]}
        >
          <Input.TextArea rows={6} placeholder="Preference, feedback, process…" />
        </Form.Item>
        <Form.Item name="relatedProjectId" label="Related project">
          <Select
            allowClear
            placeholder="Optional — link a project for context"
            options={relatedProjectOptions.map((p) => ({ value: p.id, label: p.label }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
