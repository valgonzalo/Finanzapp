import { forwardRef } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      if (!rawValue) {
        onChange('');
        return;
      }
      const formatted = new Intl.NumberFormat('es-AR').format(parseInt(rawValue, 10));
      onChange(formatted);
    };

    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-display text-xl">$</span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          className={`w-full bg-surface-alt border border-border rounded-xl py-3 pl-8 pr-4 text-text-primary font-display text-xl focus:outline-none focus:border-primary transition-colors ${className || ''}`}
          placeholder="0"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
