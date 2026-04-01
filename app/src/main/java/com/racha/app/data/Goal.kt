package com.racha.app.data

data class Goal(
    val id: Long = System.currentTimeMillis(),
    val name: String,
    val icon: String,
    val color: Int,
    val reminderHour: Int,
    val reminderMinute: Int,
    val paused: Boolean = false,
    val completedDates: List<String> = emptyList(),
    val bestStreak: Int = 0
)
