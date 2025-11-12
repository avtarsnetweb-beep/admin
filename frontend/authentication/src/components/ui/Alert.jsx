import { cn } from '../../lib/cn';

export function Alert({ children, className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-blue-50 text-blue-900 border-blue-200',
    destructive: 'bg-red-50 text-red-900 border-red-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200'
  };

  return (
    <div
      className={cn('relative w-full rounded-lg border p-4', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className, ...props }) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className, ...props }) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props}>
      {children}
    </div>
  );
}
