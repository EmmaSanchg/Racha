package com.racha.app

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.racha.app.data.Goal
import com.racha.app.data.GoalStore
import com.racha.app.reminders.ReminderScheduler
import com.racha.app.widget.GoalWidgetProvider
import java.time.LocalDate

class MainActivity : AppCompatActivity() {
    private lateinit var store: GoalStore
    private lateinit var adapter: GoalsAdapter
    private lateinit var tvCurrent: TextView
    private lateinit var tvBest: TextView
    private lateinit var grid: StreakGridView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        title = getString(R.string.app_title)
        store = GoalStore(this)
        tvCurrent = findViewById(R.id.tvCurrentStreak)
        tvBest = findViewById(R.id.tvBestStreak)
        grid = findViewById(R.id.streakGrid)

        val recycler = findViewById<RecyclerView>(R.id.goalsRecycler)
        adapter = GoalsAdapter(
            onSelect = { goal -> showDetail(goal) },
            onCheckToday = { goal ->
                store.markToday(goal.id)
                refresh()
            },
            onPause = { goal ->
                store.togglePause(goal.id)
                refresh()
            }
        )
        recycler.layoutManager = LinearLayoutManager(this)
        recycler.adapter = adapter

        findViewById<FloatingActionButton>(R.id.addGoalButton).setOnClickListener { showAddGoalDialog() }

        refresh()
    }

    private fun refresh() {
        val goals = store.getGoals().sortedBy { it.name.lowercase() }
        adapter.submit(goals, store)
        if (goals.isNotEmpty()) showDetail(goals.first()) else clearDetail()
        GoalWidgetProvider.requestRefresh(this)
    }

    private fun showDetail(goal: Goal) {
        tvCurrent.text = getString(R.string.current_streak, store.currentStreak(goal))
        tvBest.text = getString(R.string.best_streak, goal.bestStreak)

        val dates = goal.completedDates.map { LocalDate.parse(it) }
        grid.setData(dates)
    }

    private fun clearDetail() {
        tvCurrent.text = getString(R.string.current_streak, 0)
        tvBest.text = getString(R.string.best_streak, 0)
        grid.setData(emptyList())
    }

    private fun showAddGoalDialog() {
        val view = layoutInflater.inflate(R.layout.dialog_add_goal, null)
        val name = view.findViewById<EditText>(R.id.etGoalName)
        val icon = view.findViewById<EditText>(R.id.etGoalIcon)
        val hour = view.findViewById<EditText>(R.id.etHour)
        val minute = view.findViewById<EditText>(R.id.etMinute)
        val spinner = view.findViewById<Spinner>(R.id.spColor)
        val paused = view.findViewById<CheckBox>(R.id.cbPaused)

        val colors = listOf("Naranja", "Azul", "Verde", "Morado")
        spinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, colors)

        AlertDialog.Builder(this)
            .setTitle(R.string.add_goal)
            .setView(view)
            .setPositiveButton(R.string.save) { _, _ ->
                val selectedColor = when (spinner.selectedItemPosition) {
                    1 -> ContextCompat.getColor(this, R.color.goal_blue)
                    2 -> ContextCompat.getColor(this, R.color.goal_green)
                    3 -> ContextCompat.getColor(this, R.color.goal_purple)
                    else -> ContextCompat.getColor(this, R.color.flame_orange)
                }

                val goal = Goal(
                    name = name.text.toString().ifBlank { "Objetivo" },
                    icon = icon.text.toString().ifBlank { "🔥" },
                    color = selectedColor,
                    reminderHour = hour.text.toString().toIntOrNull() ?: 20,
                    reminderMinute = minute.text.toString().toIntOrNull() ?: 0,
                    paused = paused.isChecked
                )
                store.upsert(goal)
                ReminderScheduler.schedule(this, goal.id, goal.name, goal.reminderHour, goal.reminderMinute)
                refresh()
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }
}
