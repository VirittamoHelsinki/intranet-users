import Navigator from './Navigator'
import { CookieTracker } from './CookieTracker'
import { ThemeProvider } from './components/theme-provider'

export default function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="relative flex h-screen w-screen flex-col justify-between">
                <CookieTracker />
                <Navigator />
            </div>
        </ThemeProvider>
    )
}
