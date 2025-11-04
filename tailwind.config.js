// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // usas .dark en CSS
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        // añade donde tengas archivos
    ],
    theme: {
        extend: {
            colors: {
                fontFamily: {
                    sans: ["Inter", "ui-sans-serif", "system-ui"],
                },
                background: 'var(--color-background)',
                foreground: 'var(--color-foreground)',
                card: 'var(--color-card)',
                'card-foreground': 'var(--color-card-foreground)',
                popover: 'var(--color-popover)',
                'popover-foreground': 'var(--color-popover-foreground)',
                primary: 'var(--color-primary)',
                'primary-foreground': 'var(--color-primary-foreground)',
                secondary: 'var(--color-secondary)',
                'secondary-foreground': 'var(--color-secondary-foreground)',
                muted: 'var(--color-muted)',
                'muted-foreground': 'var(--color-muted-foreground)',
                accent: 'var(--color-accent)',
                'accent-foreground': 'var(--color-accent-foreground)',
                destructive: 'var(--color-destructive)',
                'destructive-foreground': 'var(--color-destructive-foreground)',
                border: 'var(--color-border)',
                input: 'var(--color-input)',
                ring: 'var(--color-ring)',
                sidebar: 'var(--color-sidebar)',
                'sidebar-primary': 'var(--color-sidebar-primary)',
                'sidebar-accent': 'var(--color-sidebar-accent)',
                // chart colors si las usas
                'chart-1': 'var(--color-chart-1)',
                'chart-2': 'var(--color-chart-2)',
                'chart-3': 'var(--color-chart-3)',
                'chart-4': 'var(--color-chart-4)',
                'chart-5': 'var(--color-chart-5)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)'
            }
        }
    },
    plugins: []
}
