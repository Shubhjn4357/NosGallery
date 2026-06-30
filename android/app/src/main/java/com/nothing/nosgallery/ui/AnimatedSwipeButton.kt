package com.nothing.nosgallery.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AnimatedSwipeButton(
    modifier: Modifier = Modifier,
    title: String = "SLIDE TO PIN WIDGET",
    successTitle: String = "ADDING WIDGET...",
    accentColor: Color = Color(0xFF7C9EFF),
    onSwipeSuccess: () -> Unit
) {
    var buttonWidth by remember { mutableStateOf(0) }
    val thumbSize = 44.dp
    val thumbSizePx = with(LocalDensity.current) { thumbSize.toPx() }
    val paddingPx = with(LocalDensity.current) { 3.dp.toPx() }
    
    val dragLimit = remember(buttonWidth) {
        Math.max(0f, buttonWidth.toFloat() - thumbSizePx - (paddingPx * 2))
    }

    val dragOffset = remember { Animatable(0f) }
    val isSuccess = remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .clip(CircleShape)
            .background(Color(0xFF161618))
            .border(1.5.dp, Color(0xFF242426), CircleShape)
            .onSizeChanged { buttonWidth = it.width }
            .padding(3.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        // Background glow expand
        val glowWidth = dragOffset.value + thumbSizePx
        Box(
            modifier = Modifier
                .width(with(LocalDensity.current) { glowWidth.toDp() })
                .fillMaxHeight()
                .clip(CircleShape)
                .background(if (isSuccess.value) Color(0xFFFF2D2D) else Color.White.copy(alpha = 0.12f))
        )

        // Slide instructions text
        val textAlpha = 1f - (dragOffset.value / Math.max(1f, dragLimit))
        Text(
            text = if (isSuccess.value) successTitle else title,
            color = if (isSuccess.value) Color.White else Color(0xFF8E8E93),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.5.sp,
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentWidth(Alignment.CenterHorizontally)
                .alpha(if (isSuccess.value) 1f else textAlpha)
        )

        // Sliding thumb
        Box(
            modifier = Modifier
                .offset { IntOffset(dragOffset.value.toInt(), 0) }
                .size(thumbSize)
                .clip(CircleShape)
                .background(if (isSuccess.value) Color(0xFFFF2D2D) else Color.White)
                .pointerInput(dragLimit) {
                    if (isSuccess.value) return@pointerInput
                    detectDragGestures(
                        onDragEnd = {
                            coroutineScope.launch {
                                if (dragOffset.value >= dragLimit * 0.8f) {
                                    isSuccess.value = true
                                    dragOffset.animateTo(dragLimit, spring())
                                    onSwipeSuccess()
                                    delay(1800)
                                    // Reset after delay
                                    dragOffset.animateTo(0f, tween(250))
                                    isSuccess.value = false
                                } else {
                                    dragOffset.animateTo(0f, spring())
                                }
                            }
                        },
                        onDrag = { _, dragAmount ->
                            coroutineScope.launch {
                                val target = dragOffset.value + dragAmount.x
                                dragOffset.snapTo(target.coerceIn(0f, dragLimit))
                            }
                        }
                    )
                },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (isSuccess.value) Icons.Default.Check else Icons.Default.ArrowForward,
                contentDescription = null,
                tint = if (isSuccess.value) Color.White else Color.Black,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
