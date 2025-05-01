'use client'

import { useEffect, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import CustomCalendar from '@/components/CustomCalendar'
import { auth, signOut } from '@/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  // getDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  // query,
  // where
} from 'firebase/firestore'

// Import dialog components
import LoginDialog from '@/components/ui/LoginDialog'
import EditTaskDialog from '@/components/ui/EditTaskDialog'
import ConfirmTaskDialog from '@/components/ui/ConfirmTaskDialog'
import CompletionDialog from '@/components/ui/CompletionDialog'

interface Task {
  id: number
  title: string
  isDone: boolean
  time: string // HH:mm
  dateKey: string // Added dateKey to Task interface
}

// ฟังก์ชันใหม่เพื่อสร้าง dateKey แบบเวลาท้องถิ่น
function getLocalDateKey(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

export default function PlannerPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loginDialog, setLoginDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [userTasks, setUserTasks] = useState<Record<string, Record<string, Task[]>>>({})
  const [newTask, setNewTask] = useState('')
  const [newTime, setNewTime] = useState('08:00')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editTime, setEditTime] = useState('08:00')
  const [completionDialog, setCompletionDialog] = useState(false)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [confirmingDateKey, setConfirmingDateKey] = useState<string>('') // เพิ่ม state สำหรับเก็บ dateKey ของงานที่กำลังยืนยัน
  const [isLoading, setIsLoading] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(true) // New state for toggling all tasks view

  const currentUID = user?.uid || 'guest'
  const tasksByDate = userTasks[currentUID] || {}

  // Make sure selectedDate is always a valid Date object
  const ensuredSelectedDate = selectedDate || new Date()
  const dateKey = getLocalDateKey(ensuredSelectedDate)
  const tasks = (tasksByDate && tasksByDate[dateKey]) ? tasksByDate[dateKey] : []
  const allTasks = Object.entries(tasksByDate).reduce((acc, [date, dateTasks]) => {
    // Add dateKey to each task
    const tasksWithDate = dateTasks.map(task => ({
      ...task,
      dateKey: date
    }))
    return [...acc, ...tasksWithDate]
  }, [] as Task[])

  // Sort all tasks by date and time
  const sortedAllTasks = [...allTasks].sort((a, b) => {
    // First sort by date
    if (a.dateKey !== b.dateKey) {
      return a.dateKey.localeCompare(b.dateKey)
    }
    // Then sort by time
    return a.time.localeCompare(b.time)
  })

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log("Current user:", user.uid)
      console.log("Selected date:", ensuredSelectedDate)
      console.log("Date key:", dateKey)
      console.log("All tasks by date:", tasksByDate)
      console.log("Tasks for selected date:", tasks)
      console.log("All tasks flattened:", sortedAllTasks)
    }
  }, [user, selectedDate, dateKey, tasksByDate, tasks, sortedAllTasks])

  // Load user tasks from Firestore when user changes
  useEffect(() => {
    if (!user) return

    const loadUserTasks = async () => {
      setIsLoading(true)
      try {
        // Get all task documents for this user
        const userTasksRef = collection(db, 'userevent', user.uid, 'tasks')
        const querySnapshot = await getDocs(userTasksRef)

        // Format tasks by date
        const loadedTasks: Record<string, Task[]> = {}

        querySnapshot.forEach((doc) => {
          const taskData = doc.data()
          const dateString = taskData.dateKey as string

          if (!loadedTasks[dateString]) {
            loadedTasks[dateString] = []
          }

          loadedTasks[dateString].push({
            id: taskData.id,
            title: taskData.title,
            isDone: taskData.isDone,
            time: taskData.time,
            dateKey: dateString // Add dateKey to each task
          })
        })

        console.log("Loaded tasks from Firestore:", loadedTasks)

        // Sort tasks by time
        Object.keys(loadedTasks).forEach(date => {
          loadedTasks[date].sort((a, b) => a.time.localeCompare(b.time))
        })

        // Update state with loaded tasks
        setUserTasks(prev => ({
          ...prev,
          [user.uid]: loadedTasks
        }))
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserTasks()
  }, [user])

  // Save tasks to Firestore whenever they change
  const saveTaskToFirestore = async (task: Task, date: string) => {
    if (!user) return

    try {
      const taskRef = doc(db, 'userevent', user.uid, 'tasks', `${task.id}`)
      await setDoc(taskRef, {
        id: task.id,
        title: task.title,
        isDone: task.isDone,
        time: task.time,
        dateKey: date,
        createdAt: new Date()
      })
      console.log("Task saved to Firestore:", task)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  // Update task in Firestore
  const updateTaskInFirestore = async (task: Task, date: string) => {
    if (!user) return

    try {
      const taskRef = doc(db, 'userevent', user.uid, 'tasks', `${task.id}`)
      await updateDoc(taskRef, {
        title: task.title,
        isDone: task.isDone,
        time: task.time,
        dateKey: date
      })
      console.log("Task updated in Firestore:", task)
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  // Delete task from Firestore
  const deleteTaskFromFirestore = async (taskId: number) => {
    if (!user) return

    try {
      const taskRef = doc(db, 'userevent', user.uid, 'tasks', `${taskId}`)
      await deleteDoc(taskRef)
      console.log("Task deleted from Firestore:", taskId)
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  // Notification permission
  useEffect(() => {
    if (typeof window === 'undefined') return
    Notification.requestPermission()
  }, [])

  // Task notifications
  useEffect(() => {
    if (!selectedDate) return

    tasks.forEach(task => {
      if (task.isDone) return
      const [h, m] = task.time.split(':')
      const taskTime = new Date(selectedDate)
      taskTime.setHours(Number(h), Number(m), 0, 0)
      const delay = taskTime.getTime() - Date.now()
      if (delay > 0 && delay < 86400000) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(`🕒 ถึงเวลาทำ "${task.title}" แล้ว`, {
              body: `กำหนดเวลา: ${task.time}`,
            })
          }
        }, delay)
      }
    })
  }, [tasks, selectedDate])

  const handleLogout = async () => {
    await signOut(auth)
    // Clear tasks on logout
    setUserTasks({})
  }

  const setTasksForCurrentUser = (newTasks: Record<string, Task[]>) => {
    setUserTasks(prev => ({ ...prev, [currentUID]: newTasks }))
  }

  //เพิ่มงานใหม่ (Task) เข้าไปในระบบ เมื่อผู้ใช้กรอกชื่อและเวลาของงาน แล้วกดเพิ่ม
  const addTask = async () => {
    if (!newTask.trim() || !user || !selectedDate) return

    const task: Task = {
      id: Date.now(),
      title: newTask,
      isDone: false,
      time: newTime,
      dateKey // Add dateKey to the task
    }

    // Update local state
    const updatedTasks = {
      ...tasksByDate,
      [dateKey]: [...(tasksByDate[dateKey] || []), task].sort((a, b) => a.time.localeCompare(b.time))
    }

    setTasksForCurrentUser(updatedTasks)

    // Save to Firestore
    await saveTaskToFirestore(task, dateKey)

    // Reset form
    setNewTask('')
    setNewTime('08:00')
  }


  //layyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

  //ฟังก์ชัน deleteTask ลบงาน จาก state และ Firestore ตาม id ของงาน
  const deleteTask = async (id: number, taskDateKey: string = dateKey) => {
    
    setTasksForCurrentUser({
      ...tasksByDate,
      [taskDateKey]: (tasksByDate[taskDateKey] || []).filter(t => t.id !== id),
    })

    // Delete from Firestore
    if (user) {
      await deleteTaskFromFirestore(id)
    }
  }

  //confirmComplete completeTask 
  const confirmComplete = (id: number, taskDateKey: string = dateKey) => {
    setConfirmingId(id)
    setConfirmingDateKey(taskDateKey) // เก็บ dateKey ของงานที่กำลังยืนยัน
  }

  const completeTask = async () => {
    if (confirmingId === null) return

    // ใช้ confirmingDateKey ที่เก็บไว้
    const taskDateKey = confirmingDateKey

    // Find the task
    const taskToComplete = tasksByDate[taskDateKey]?.find(t => t.id === confirmingId)
    if (!taskToComplete) {
      console.error("Task not found:", confirmingId, "in date:", taskDateKey)
      return
    }

    // Update in local state
    const updatedTasks = {
      ...tasksByDate,  //    ใช้ map() อัปเดตสถานะของงานที่ตรงกับ confirmingId
      [taskDateKey]: (tasksByDate[taskDateKey] || []).map(t =>
        t.id === confirmingId ? { ...t, isDone: true } : t
      )
    }

    setTasksForCurrentUser(updatedTasks)

    // Update in Firestore
    if (user) {
      await updateTaskInFirestore({ ...taskToComplete, isDone: true }, taskDateKey)
    }

    setCompletionDialog(true)     // แสดง dialog ว่าทำเสร็จแล้ว
    setConfirmingId(null)         // รีเซ็ต id
    setConfirmingDateKey('')      // รีเซ็ต dateKey
  }

  // ฟังก์ชันเริ่มต้นการแก้ไข task โดยกำหนดค่าต่าง ๆ ลงใน state
  const startEdit = (task: Task) => {
    setEditingTask(task)
    setEditValue(task.title)
    setEditTime(task.time)
  }


  //ใช้เพื่อยืนยันการแก้ไขงานและอัปเดตข้อมูลใน state และ Firestore
  const confirmEdit = async () => {
    if (!editingTask || !user) return

    const taskDate = editingTask.dateKey || dateKey

    // Update in local state
    const updatedTasks = {
      ...tasksByDate,
      [taskDate]: (tasksByDate[taskDate] || []).map(t =>
        t.id === editingTask.id ? { ...t, title: editValue, time: editTime } : t
      ).sort((a, b) => a.time.localeCompare(b.time))
    }

    setTasksForCurrentUser(updatedTasks)

    // Update in Firestore
    const task = updatedTasks[taskDate].find(t => t.id === editingTask.id)
    if (task) {
      await updateTaskInFirestore(task, taskDate)
    }

    setEditingTask(null)
    setEditValue('')
    setEditTime('08:00')
  }

  /**const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetDate: Date) => {
    e.preventDefault()
    if (!user) return

    const taskId = Number(e.dataTransfer.getData('text/plain'))

    // Find which date contains this task
    let sourceDate = ''
    let taskToMove: Task | undefined

    Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
      const foundTask = dateTasks.find(t => t.id === taskId)
      if (foundTask) {
        sourceDate = date
        taskToMove = foundTask
      }
    })

    if (!sourceDate || !taskToMove) {
      console.error("Task not found for drag operation")
      return
    }

    // แก้ไขให้ใช้ getLocalDateKey แทน toISOString()
    const targetKey = getLocalDateKey(targetDate)

    // Don't do anything if dropping on the same date
    if (sourceDate === targetKey) return

    // Update local state - remove from source date
    const updatedTasks = {
      ...tasksByDate,
      [sourceDate]: (tasksByDate[sourceDate] || []).filter(t => t.id !== taskId),
      [targetKey]: [...(tasksByDate[targetKey] || []), { ...taskToMove, dateKey: targetKey }].sort((a, b) => a.time.localeCompare(b.time))
    }

    setTasksForCurrentUser(updatedTasks)

    // Update in Firestore 
    await updateTaskInFirestore({ ...taskToMove, dateKey: targetKey }, targetKey)
  }*/


  // Function to format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, 'PPP', { locale: th })
  }

  // Calculate if there are any tasks for the selected date
  const hasTasksForSelectedDate = tasks.length > 0
  const hasAnyTasks = sortedAllTasks.length > 0

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗓️ Planner</h1>
        {user ? (
          <div className="flex gap-2 items-center">
            <span className="text-sm">👤 {user.displayName || user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </div>
        ) : (
          <Button onClick={() => setLoginDialog(true)}>เข้าสู่ระบบ</Button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-6">
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!user ? (
        <div className="text-center text-muted-foreground mt-10">
          กรุณาเข้าสู่ระบบเพื่อใช้งาน Planner
        </div>
      ) : (
        <>
          {/* ปุ่มสลับมุมมองระหว่าง "งานทั้งหมด" และ "ปฏิทิน" */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={showAllTasks ? "default" : "outline"}
              onClick={() => setShowAllTasks(true)}
            >
              แสดงงานทั้งหมด
            </Button>
            <Button
              variant={!showAllTasks ? "default" : "outline"}
              onClick={() => setShowAllTasks(false)}
            >
              ปฏิทิน
            </Button>
          </div>

          {/* มุมมองปฏิทินพร้อมข้อมูลงานในแต่ละวัน */}
          {!showAllTasks && (
            <CustomCalendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
              renderDayContent={(date: Date) => {
                const key = getLocalDateKey(date)
                const dayTasks = tasksByDate[key] || []
                return (
                  <ul className="space-y-1">
                    {dayTasks.map(task => (
                      <li
                        key={task.id}
                        draggable={!task.isDone}
                        onDragStart={e => e.dataTransfer.setData('text/plain', String(task.id))}
                        className={`text-sm px-2 py-1 rounded ${task.isDone ? 'bg-green-200 line-through' : 'bg-blue-100'
                          }`}
                      >
                        {task.time} {task.title}
                      </li>
                    ))}
                  </ul>
                )
              }}
            />
          )}

          {/*ฟอร์มเพิ่มงานใหม่สำหรับวันที่เลือกในปฏิทิน*/}
          {!showAllTasks && selectedDate && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                งานวันที่: {format(selectedDate, 'PPP', { locale: th })}
              </h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="เพิ่มกิจกรรม..."
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTask.trim()) {
                      addTask()
                    }
                  }}
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="border rounded px-2"
                />
                <Button onClick={addTask} disabled={!newTask.trim()}>เพิ่ม</Button>
              </div>
            </div>
          )}

          {/* แสดงงานทั้งหมดหรือเฉพาะวันที่เลือก ขึ้นอยู่กับ showAllTasks */}
          {showAllTasks ? (
            // All tasks view
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">กิจกรรมทั้งหมด</h2>

              {!hasAnyTasks && !isLoading ? (
                <div className="text-center text-muted-foreground py-4">
                  ไม่พบกิจกรรม กรุณาเพิ่มกิจกรรมในมุมมองรายวัน
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group tasks by date */}
                  {Object.entries(tasksByDate)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, dateTasks]) => (
                      <div key={date} className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2">{formatDate(date)}</h3>
                        <ul className="space-y-2">
                          {dateTasks
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map(task => (
                              <li
                                key={task.id}
                                className={`flex items-center justify-between p-2 rounded border ${task.isDone
                                  ? 'bg-green-100 text-gray-500 line-through'
                                  : 'bg-white'
                                  }`}
                              >
                                {/* ข้อมูลงานแต่ละรายการ */}
                                <div className="flex gap-2 items-center flex-1">
                                  <Checkbox
                                    checked={task.isDone}
                                    onCheckedChange={() =>
                                      !task.isDone ? confirmComplete(task.id, date) : null
                                    }
                                    disabled={task.isDone}
                                  />
                                  <span>{task.time}</span>
                                  <span>{task.title}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEdit({ ...task, dateKey: date })}
                                    disabled={task.isDone}
                                  >
                                    แก้ไข
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteTask(task.id, date)}
                                  >
                                    ลบ
                                  </Button>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            // Selected date view
            selectedDate && (
              <div>
                {!hasTasksForSelectedDate && !isLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    ไม่มีกิจกรรมในวันนี้ กรุณาเพิ่มกิจกรรม
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map(task => (
                      <li
                        key={task.id}
                        className={`flex items-center justify-between p-2 rounded border ${task.isDone
                          ? 'bg-green-100 text-gray-500 line-through'
                          : 'bg-white'
                          }`}
                      >
                        <div className="flex gap-2 items-center flex-1">
                          <Checkbox
                            checked={task.isDone}
                            onCheckedChange={() =>
                              !task.isDone ? confirmComplete(task.id, dateKey) : null
                            }
                            disabled={task.isDone}
                          />
                          <span>{task.time}</span>
                          <span>{task.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit({ ...task, dateKey })}
                            disabled={task.isDone}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* Dialog components */}
      <LoginDialog
        open={loginDialog}
        onOpenChange={setLoginDialog}
      />

      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        editValue={editValue}
        setEditValue={setEditValue}
        editTime={editTime}
        setEditTime={setEditTime}
        onConfirm={confirmEdit}
      />

      <ConfirmTaskDialog
        open={!!confirmingId}
        onOpenChange={(open) => !open && setConfirmingId(null)}
        onConfirm={completeTask}
      />

      <CompletionDialog
        open={completionDialog}
        onOpenChange={setCompletionDialog}
      />
    </div>
  )
}