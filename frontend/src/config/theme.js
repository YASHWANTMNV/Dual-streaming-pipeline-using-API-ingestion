// Production-Ready Design System
// Big Tech Styling (AWS/Enterprise Grade)

export const colors = {
    // Primary Brand Colors
    primary: '#FFDE42',        // Gold - Highlight & CTAs
    secondary: '#4C5C2D',      // Olive Green - Secondary elements
    accent: '#313E17',         // Deep Green - Borders & accents
    dark: '#1B0C0C',           // Near Black - Text & backgrounds
    
    // Neutral Grays (for professional look)
    gray50: '#FAFAFA',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Semantic
    background: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: '#1B0C0C',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
};

export const typography = {
    fontFamily: {
        base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

export const spacing = {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
};

export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const borderRadius = {
    none: '0',
    sm: '0.375rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
};

export const transitions = {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
};

// CSS Variables for easy use
export const getCSSVariables = () => `
:root {
    /* Colors */
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-dark: ${colors.dark};
    
    --color-gray-50: ${colors.gray50};
    --color-gray-100: ${colors.gray100};
    --color-gray-200: ${colors.gray200};
    --color-gray-300: ${colors.gray300};
    --color-gray-400: ${colors.gray400};
    --color-gray-500: ${colors.gray500};
    --color-gray-600: ${colors.gray600};
    --color-gray-700: ${colors.gray700};
    --color-gray-800: ${colors.gray800};
    --color-gray-900: ${colors.gray900};
    
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --color-info: ${colors.info};
    
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-border: ${colors.border};
    --color-text: ${colors.text};
    --color-text-secondary: ${colors.textSecondary};
    
    /* Typography */
    --font-family: ${typography.fontFamily.base};
    
    /* Spacing */
    --spacing-xs: ${spacing.xs};
    --spacing-sm: ${spacing.sm};
    --spacing-md: ${spacing.md};
    --spacing-lg: ${spacing.lg};
    --spacing-xl: ${spacing.xl};
    --spacing-2xl: ${spacing['2xl']};
    
    /* Shadows */
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    
    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-base: ${borderRadius.base};
    --radius-md: ${borderRadius.md};
}
`;
