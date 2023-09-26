import Navigator from './Navigator'
import CookieTracker from './CookieTracker'

export default function App() {
 return (
    <div className="relative flex h-screen w-screen flex-col justify-between">
    <CookieTracker />
    <Navigator />
  </div>
)
}
