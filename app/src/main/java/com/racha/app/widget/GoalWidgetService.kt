package com.racha.app.widget

import android.content.Intent
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.racha.app.R
import com.racha.app.data.GoalStore

class GoalWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory = Factory(applicationContext)

    class Factory(private val context: android.content.Context) : RemoteViewsFactory {
        private val store = GoalStore(context)
        private var goals = store.getGoals()

        override fun onCreate() = Unit

        override fun onDataSetChanged() {
            goals = store.getGoals().sortedBy { it.name.lowercase() }
        }

        override fun onDestroy() = Unit

        override fun getCount(): Int = goals.size

        override fun getViewAt(position: Int): RemoteViews {
            val goal = goals[position]
            val views = RemoteViews(context.packageName, R.layout.widget_goal_item)
            views.setTextViewText(R.id.widgetGoalName, "${goal.icon} ${goal.name}")
            val streak = store.currentStreak(goal)
            val fire = if (goal.paused) "🧊" else "🔥"
            views.setTextViewText(R.id.widgetGoalStreak, "$fire $streak")
            views.setFloat(R.id.widgetItemRoot, "setAlpha", if (goal.paused) 0.45f else 1f)
            return views
        }

        override fun getLoadingView(): RemoteViews? = null
        override fun getViewTypeCount(): Int = 1
        override fun getItemId(position: Int): Long = goals[position].id
        override fun hasStableIds(): Boolean = true
    }
}
