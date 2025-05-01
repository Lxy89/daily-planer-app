'use client'

import { useState } from 'react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  setDate,
} from 'date-fns'
import { th } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomCalendarProps {
  selected: Date | undefined
  onSelect: (date: Date) => void
}

export default function CustomCalendar({ selected, onSelect }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const startDate = startOfWeek(startOfMonth(currentMonth), { locale: th })
  const endDate = endOfWeek(endOfMonth(currentMonth), { locale: th })

  const days = []
  let day = startDate

  while (day <= endDate) {
    days.push(day)
    day = setDate(day, day.getDate() + 1)
  }

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4">
        <button
          onClick={previousMonth}
          className="flex items-center justify-center text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <motion.h2
          className="font-normal text-base text-center"
          key={format(currentMonth, 'MMMM yyyy', { locale: th })}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 , delay: 0.2 }}
        >
          {format(currentMonth, 'MMMM yyyy', { locale: th })}
        </motion.h2>

        <button
          onClick={nextMonth}
          className="flex items-center justify-center text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-gray-500 text-sm">
        {dayNames.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toString()}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-0 text-sm p-2"
        >
          {days.map((d, idx) => {
            const isSelected = selected && isSameDay(d, selected)
            const isCurrentMonth = isSameMonth(d, currentMonth)
            const isToday = isSameDay(d, new Date())

            let buttonClasses = 'w-full aspect-square flex items-center justify-center '

            if (isSelected) {
              buttonClasses += 'bg-blue-500 text-white rounded-full '
            } else if (!isCurrentMonth) {
              buttonClasses += 'text-gray-300 '
            } else {
              buttonClasses += 'hover:bg-blue-100 hover:rounded-full '
            }

            if (isToday && !isSelected) {
              buttonClasses += 'border border-blue-500 rounded-full '
            }

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.5 }}
                onClick={() => onSelect(d)}
                disabled={!isCurrentMonth}
                className={buttonClasses}
              >
                {format(d, 'd')}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
