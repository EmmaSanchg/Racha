package com.racha.app

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.racha.app.data.Goal
import com.racha.app.data.GoalStore

class GoalsAdapter(
    private val onSelect: (Goal) -> Unit,
    private val onCheckToday: (Goal) -> Unit,
    private val onPause: (Goal) -> Unit
) : RecyclerView.Adapter<GoalsAdapter.GoalHolder>() {

    private var goals: List<Goal> = emptyList()
    private lateinit var store: GoalStore

    fun submit(items: List<Goal>, goalStore: GoalStore) {
        goals = items
        store = goalStore
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GoalHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_goal, parent, false)
        return GoalHolder(view)
    }

    override fun getItemCount(): Int = goals.size

    override fun onBindViewHolder(holder: GoalHolder, position: Int) = holder.bind(goals[position])

    inner class GoalHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val icon: TextView = view.findViewById(R.id.goalIcon)
        private val name: TextView = view.findViewById(R.id.goalName)
        private val streak: TextView = view.findViewById(R.id.goalStreak)
        private val btnDone: ImageButton = view.findViewById(R.id.btnDone)
        private val btnPause: ImageButton = view.findViewById(R.id.btnPause)

        fun bind(goal: Goal) {
            icon.text = goal.icon
            name.text = goal.name
            name.setTextColor(goal.color)
            val current = store.currentStreak(goal)
            val statusIcon = if (goal.paused) "🧊" else "🔥"
            streak.text = "$statusIcon $current días"
            itemView.alpha = if (goal.paused) 0.45f else 1f

            itemView.setOnClickListener { onSelect(goal) }
            btnDone.setOnClickListener { onCheckToday(goal) }
            btnPause.setOnClickListener { onPause(goal) }
        }
    }
}
