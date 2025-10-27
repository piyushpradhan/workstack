import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SelectFieldOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectFieldOption[];
    placeholder?: string;
    className?: string;
}

export function SelectField({
    label,
    value,
    onValueChange,
    options,
    placeholder = "Select...",
    className = "space-y-2"
}: SelectFieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default SelectField;