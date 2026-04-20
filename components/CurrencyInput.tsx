import { forwardRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCurrency } from '@/hooks/useCurrency';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const { lang } = useTranslation();
    const { symbol } = useCurrency();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      if (!rawValue) {
        onChange('');
        return;
      }
      const locale = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-AR';
      const formatted = new Intl.NumberFormat(locale).format(parseInt(rawValue, 10));
      onChange(formatted);
    };

    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-display text-xl">{symbol}</span>
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
