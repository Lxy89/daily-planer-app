'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ConfirmTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export default function ConfirmTaskDialog({
  open,
  onOpenChange,
  onConfirm
}: ConfirmTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการทำงานเสร็จสิ้น</DialogTitle>
        </DialogHeader>
        <p>คุณแน่ใจหรือไม่ว่าทำงานนี้เสร็จแล้ว?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={onConfirm}>ยืนยัน</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}