package com.racha.app.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate

class GoalStore(context: Context) {
    private val prefs = context.getSharedPreferences("goals_store", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun getGoals(): MutableList<Goal> {
        val raw = prefs.getString(KEY_GOALS, "[]") ?: "[]"
        val type = object : TypeToken<MutableList<Goal>>() {}.type
        return gson.fromJson(raw, type)
    }

    fun saveGoals(goals: List<Goal>) {
        prefs.edit().putString(KEY_GOALS, gson.toJson(goals)).apply()
    }

    fun upsert(goal: Goal) {
        val goals = getGoals()
        val idx = goals.indexOfFirst { it.id == goal.id }
        if (idx >= 0) goals[idx] = goal else goals.add(goal)
        saveGoals(goals)
    }

    fun markToday(goalId: Long) {
        val today = LocalDate.now().toString()
        val goals = getGoals().map { g ->
            if (g.id != goalId || g.paused) g else {
                val dates = (g.completedDates + today).distinct().sorted()
                g.copy(completedDates = dates, bestStreak = maxOf(g.bestStreak, currentStreak(dates)))
            }
        }
        saveGoals(goals)
    }

    fun togglePause(goalId: Long) {
        val goals = getGoals().map { if (it.id == goalId) it.copy(paused = !it.paused) else it }
        saveGoals(goals)
    }

    fun currentStreak(goal: Goal): Int = currentStreak(goal.completedDates)

    private fun currentStreak(dates: List<String>): Int {
        if (dates.isEmpty()) return 0
        val set = dates.toSet()
        var cursor = LocalDate.now()
        var streak = 0
        while (set.contains(cursor.toString())) {
            streak++
            cursor = cursor.minusDays(1)
        }
        return streak
    }

    companion object {
        private const val KEY_GOALS = "goals"
    }
}
