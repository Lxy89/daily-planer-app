'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CompletionDialog({
  open,
  onOpenChange
}: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✅ เสร็จสิ้นกิจกรรม</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          ยินดีด้วย! คุณทำงานเสร็จแล้ว 🎉
        </p>
      </DialogContent>
    </Dialog>
  )
}