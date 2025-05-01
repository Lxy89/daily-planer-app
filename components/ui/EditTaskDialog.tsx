'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editValue: string
  setEditValue: (value: string) => void
  editTime: string
  setEditTime: (time: string) => void
  onConfirm: () => Promise<void>
}

export default function EditTaskDialog({
  open,
  onOpenChange,
  editValue,
  setEditValue,
  editTime,
  setEditTime,
  onConfirm
}: EditTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขงาน</DialogTitle>
        </DialogHeader>
        <Input
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          placeholder="ชื่อใหม่ของงาน"
        />
        <input
          type="time"
          value={editTime}
          onChange={e => setEditTime(e.target.value)}
          className="border rounded px-2 mt-2"
        />
        <Button className="mt-4" onClick={onConfirm}>
          บันทึกการแก้ไข
        </Button>
      </DialogContent>
    </Dialog>
  )
}