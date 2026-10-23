import { createElement } from "react";
import { Loader2 } from "lucide-react";
import { getMessage, type MessageKey } from "@/constants/messages";
import { toast as sonnerToast } from "sonner";

export type ToastOptions = {
  id?: string | number;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
};

function isMessageKey(message: string): message is MessageKey {
  return message.includes(".") && !message.includes(" ");
}

function getToastMessage(message: string): string {
  if (isMessageKey(message)) {
    return getMessage(message);
  }
  return message;
}

function getToastDescription(description?: string): string | undefined {
  if (!description) return undefined;
  return getToastMessage(description);
}

const formatOptions = (options?: ToastOptions) => {
  if (!options) return undefined;

  return {
    id: options.id,
    description: getToastDescription(options.description),
    duration: options.duration,
    action: options.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick || (() => {}),
        }
      : undefined,
    cancel: options.cancel
      ? {
          label: options.cancel.label,
          onClick: options.cancel.onClick || (() => {}),
        }
      : undefined,
  };
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.dismiss();
    return sonnerToast.success(getToastMessage(message), formatOptions(options));
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.dismiss();
    const formatted = formatOptions(options);
    if (!formatted?.duration) {
      if (formatted) formatted.duration = 5000;
      else return sonnerToast.error(getToastMessage(message), { duration: 5000 });
    }
    return sonnerToast.error(getToastMessage(message), formatted);
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.dismiss();
    return sonnerToast.info(getToastMessage(message), formatOptions(options));
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.dismiss();
    return sonnerToast.warning(getToastMessage(message), formatOptions(options));
  },

  loading: (message: string, options?: ToastOptions & { id?: string | number }) => {
    const formatted = formatOptions(options);
    return sonnerToast(getToastMessage(message), {
      ...formatted,
      id: options?.id,
      icon: createElement(Loader2, { className: "h-4 w-4 animate-spin text-[#0a0a0a] shrink-0" }),
      duration: options?.duration || 100000,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: getToastMessage(messages.loading),
      success: (data) => {
        const message =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;
        return getToastMessage(message);
      },
      error: (error) => {
        const message =
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error;
        return getToastMessage(message);
      },
      ...formatOptions(options),
    });
  },

  custom: (
    message: string,
    options?: ToastOptions & { type?: "success" | "error" | "info" | "warning" }
  ) => {
    const type = options?.type || "info";
    return toast[type](message, options);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  dismissAll: () => {
    sonnerToast.dismiss();
  },
};

export default toast;
