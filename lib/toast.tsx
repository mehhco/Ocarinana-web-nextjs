import toast from "react-hot-toast";

/**
 * Toast 通知工具函数
 * 提供统一的用户反馈接口
 */

/** 成功提示 */
export function showSuccess(message: string) {
  return toast.success(message);
}

/** 错误提示 */
export function showError(message: string) {
  return toast.error(message);
}

/** 加载提示 */
export function showLoading(message: string) {
  return toast.loading(message);
}

/** 关闭指定的 toast */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/** 关闭所有 toast */
export function dismissAllToasts() {
  toast.dismiss();
}

/** 自定义 toast */
export function showToast(message: string, options?: Parameters<typeof toast>[1]) {
  return toast(message, options);
}

/**
 * Promise toast - 自动处理异步操作的提示
 * 
 * @example
 * ```ts
 * await toastPromise(
 *   saveScore(data),
 *   {
 *     loading: '保存中...',
 *     success: '保存成功！',
 *     error: '保存失败',
 *   }
 * );
 * ```
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) {
  return toast.promise(promise, messages);
}

/**
 * 带撤销功能的 toast
 * 
 * @example
 * ```ts
 * showWithUndo(
 *   '乐谱已删除',
 *   () => restoreScore(id),
 *   '撤销'
 * );
 * ```
 */
export function showWithUndo(
  message: string,
  onUndo: () => void,
  undoText: string = '撤销'
) {
  return toast((t) => (
    <div className="flex items-center gap-3">
      <span>{message}</span>
      <button
        onClick={() => {
          toast.dismiss(t.id);
          onUndo();
        }}
        className="px-2 py-1 text-sm font-medium text-primary hover:underline"
      >
        {undoText}
      </button>
    </div>
  ), {
    duration: 5000,
  });
}

