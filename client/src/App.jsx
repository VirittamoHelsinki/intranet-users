import Navigator from './Navigator'
import { CookieTracker } from './utils/CookieTracker'
import { ThemeProvider } from './components/theme-provider'

export default function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <CookieTracker />
                <Navigator />
        </ThemeProvider>
    )
}
