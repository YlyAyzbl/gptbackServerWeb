import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const CHART_TOOLTIP_STYLE = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
}

export const CHART_ITEM_STYLE = {
    color: '#1e293b'
}
