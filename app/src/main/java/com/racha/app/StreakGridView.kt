package com.racha.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import java.time.LocalDate

class StreakGridView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    private val completed = mutableSetOf<LocalDate>()
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val cell = 20f
    private val gap = 8f

    fun setData(dates: List<LocalDate>) {
        completed.clear()
        completed.addAll(dates)
        invalidate()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), (7 * (cell + gap) + 16).toInt())
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val today = LocalDate.now()
        for (i in 0 until 42) {
            val day = today.minusDays((41 - i).toLong())
            val row = i / 6
            val col = i % 6
            val x = col * (cell + gap) + 8
            val y = row * (cell + gap) + 8

            paint.color = if (completed.contains(day)) {
                ContextCompat.getColor(context, R.color.grid_active)
            } else {
                ContextCompat.getColor(context, R.color.grid_inactive)
            }
            canvas.drawRoundRect(x, y, x + cell, y + cell, 4f, 4f, paint)
        }
    }
}
