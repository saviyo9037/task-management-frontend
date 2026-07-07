import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { createTask } from '@/services/taskApi';

const TaskFormModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully ');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onClose();
      formik.resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating task');
    },
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      estimatedHours: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string(),
      priority: Yup.string().oneOf(['Low', 'Medium', 'High']),
      dueDate: Yup.date().nullable(),
      estimatedHours: Yup.number().min(0).nullable(),
    }),
    onSubmit: (values) => mutation.mutate(values),
  });

  if (!isOpen) return null;

  const inputClass = (field) =>
    `input-base ${formik.touched[field] && formik.errors[field] ? 'input-error' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative z-10 w-full rounded-t-2xl bg-card-t shadow-2xl sm:max-w-lg sm:rounded-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gray-200 sm:hidden" />

        <div className="flex items-center justify-between border-b border-t-color px-5 py-4">
          <h3 className="text-base font-semibold text-primary-t">Create New Task</h3>
          <button
            onClick={onClose}
            className="tap-target flex h-8 w-8 items-center justify-center rounded-xl text-sidebar-muted-t hover:bg-muted-t hover:text-secondary-t transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="max-h-[80vh] overflow-y-auto p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-t">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Task title"
              {...formik.getFieldProps('title')}
              className={inputClass('title')}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-t">Description</label>
            <textarea
              {...formik.getFieldProps('description')}
              rows="3"
              placeholder="Optional description…"
              className="input-base resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-t">Priority</label>
              <select {...formik.getFieldProps('priority')} className={inputClass('priority')}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-t">Est. Hours</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 4"
                {...formik.getFieldProps('estimatedHours')}
                className={inputClass('estimatedHours')}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-t">Due Date</label>
            <input
              type="date"
              {...formik.getFieldProps('dueDate')}
              className={inputClass('dueDate')}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="tap-target w-full rounded-xl border border-t-color bg-card-t py-3 text-sm font-medium text-secondary-t hover:bg-muted-t transition sm:w-auto sm:px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="tap-target btn-primary w-full sm:w-auto sm:px-6"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
