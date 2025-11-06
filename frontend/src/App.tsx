import './App.css'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function App() {

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button className='text-amber-600'>Click me</Button>
      </div>

      <Dialog>
<DialogTrigger asChild>
        <Button>Share</Button>
      </DialogTrigger>        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default App
