package com.nothing.nosgallery.ui

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nothing.nosgallery.store.WidgetStore
import com.nothing.nosgallery.store.SavedWidget
import com.nothing.nosgallery.widget.NosWidgetPinReceiver
import com.nothing.nosgallery.widget.WidgetLayoutCompiler
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class WidgetTemplate(
    val id: String,
    val name: String,
    val category: String,
    val className: String,
    val w: Int,
    val h: Int,
    val description: String,
    val icon: ImageVector,
    val supportedSizes: List<Pair<Int, Int>>
)

// Claymorphic container helper Composable
@Composable
fun ClayCard(
    modifier: Modifier = Modifier,
    bgColor: Color = Color(0xFF1E1E22),
    shape: RoundedCornerShape = RoundedCornerShape(28.dp),
    borderWidth: Dp = 1.dp,
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = modifier
            .shadow(
                elevation = 8.dp,
                shape = shape,
                clip = false,
                ambientColor = Color.Black.copy(alpha = 0.5f),
                spotColor = Color.Black.copy(alpha = 0.5f)
            )
            .background(bgColor, shape)
            .border(
                borderWidth,
                Brush.linearGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.08f),
                        Color.Black.copy(alpha = 0.3f)
                    )
                ),
                shape
            )
            .padding(16.dp)
    ) {
        Column {
            content()
        }
    }
}

// 40 Widgets Categories
val categories = listOf(
    "ALL", "CLOCKS", "CALENDAR", "WEATHER", "HEALTH", 
    "FINANCE", "DEVELOPER", "AI", "PRODUCTIVITY", "SOCIAL", "SMART HOME"
)

// Complete 40 templates list mapping 40 native widget classes
val templates = listOf(
    // Clocks
    WidgetTemplate("clock_digital", "Minimal Digital", "CLOCKS", "NOSClockDigitalWidget", 2, 2, "Modern digital clock display.", Icons.Default.DateRange, listOf(2 to 2, 4 to 2)),
    WidgetTemplate("clock_dot", "NOS Dot Clock", "CLOCKS", "NOSClockDotWidget", 4, 2, "Nothing style dot-matrix clock.", Icons.Default.List, listOf(4 to 2)),
    WidgetTemplate("clock_analog", "Classic Analog", "CLOCKS", "NOSClockAnalogWidget", 2, 2, "Classic ticking clock with radial hands.", Icons.Default.Refresh, listOf(2 to 2)),
    WidgetTemplate("clock_flip", "Flip Clock", "CLOCKS", "NOSClockFlipWidget", 4, 2, "Retro flip-card clock layout.", Icons.Default.PlayArrow, listOf(4 to 2)),
    WidgetTemplate("clock_stopwatch", "Stopwatch", "CLOCKS", "NOSClockStopwatchWidget", 2, 2, "Interactive stopwatch timer.", Icons.Default.Star, listOf(2 to 2)),
    
    // Calendar
    WidgetTemplate("calendar_monthly", "Month View", "CALENDAR", "NOSCalendarMonthlyWidget", 4, 2, "Compact full-month days grid.", Icons.Default.DateRange, listOf(4 to 2)),
    WidgetTemplate("calendar_agenda", "Agenda View", "CALENDAR", "NOSCalendarAgendaWidget", 2, 2, "Fake list of today's schedule events.", Icons.Default.List, listOf(2 to 2)),
    WidgetTemplate("calendar_progress", "Year Progress", "CALENDAR", "NOSCalendarProgressWidget", 2, 2, "Meters showing percentage of year elapsed.", Icons.Default.Warning, listOf(2 to 2)),
    
    // Weather
    WidgetTemplate("weather_current", "Current Weather", "WEATHER", "NOSWeatherCurrentWidget", 2, 2, "Current climate temperature card.", Icons.Default.Send, listOf(2 to 2)),
    WidgetTemplate("weather_aqi", "Air Quality AQI", "WEATHER", "NOSWeatherAqiWidget", 2, 2, "Shows air quality meter.", Icons.Default.Warning, listOf(2 to 2)),
    WidgetTemplate("weather_moon_phase", "Moon Phase", "WEATHER", "NOSMoonPhaseWidget", 2, 2, "Renders illumination percentage.", Icons.Default.Star, listOf(2 to 2)),
    
    // Health
    WidgetTemplate("health_steps", "Steps Tracker", "HEALTH", "NOSHealthStepsWidget", 2, 2, "Steps goals progress circle.", Icons.Default.Favorite, listOf(2 to 2)),
    WidgetTemplate("health_water", "Water Intake", "HEALTH", "NOSHealthWaterWidget", 2, 2, "Drink logging with dynamic buttons.", Icons.Default.Add, listOf(2 to 2)),
    WidgetTemplate("health_breath", "Breathing Pacer", "HEALTH", "NOSHealthBreathWidget", 2, 2, "Guided breathing pacer animation.", Icons.Default.Favorite, listOf(2 to 2)),
    
    // Finance
    WidgetTemplate("finance_crypto", "Crypto Tracker", "FINANCE", "NOSFinanceCryptoWidget", 2, 2, "BTC / crypto tracker ticker.", Icons.Default.ShoppingCart, listOf(2 to 2)),
    
    // Developer
    WidgetTemplate("developer_git", "GitHub Commits", "DEVELOPER", "NOSDeveloperGitWidget", 4, 2, "Classic GitHub green commit grid.", Icons.Default.Build, listOf(4 to 2)),
    WidgetTemplate("developer_build", "CI/CD Pipeline", "DEVELOPER", "NOSDeveloperBuildWidget", 2, 2, "Build runner success tracking panel.", Icons.Default.Check, listOf(2 to 2)),
    WidgetTemplate("developer_cpu", "CPU Monitor", "DEVELOPER", "NOSDeveloperCpuWidget", 2, 2, "Dynamic bar tracking system CPU load.", Icons.Default.Info, listOf(2 to 2)),
    WidgetTemplate("developer_quick_controls", "Control Center", "DEVELOPER", "NOSQuickControlsWidget", 4, 2, "Row of toggles for Wifi and Bluetooth.", Icons.Default.Menu, listOf(4 to 2)),
    WidgetTemplate("developer_battery", "Battery Level", "DEVELOPER", "NOSBatteryWidget", 2, 2, "Live battery remaining indicator.", Icons.Default.Info, listOf(2 to 2)),
    
    // AI
    WidgetTemplate("ai_chat", "AI Assistant", "AI", "NOSAiChatWidget", 4, 4, "Direct Gemini entry assistant card.", Icons.Default.Face, listOf(4 to 4)),
    WidgetTemplate("ai_summary", "AI Daily Summary", "AI", "NOSAiSummaryWidget", 4, 2, "AI metrics daily summary card.", Icons.Default.Face, listOf(4 to 2)),
    WidgetTemplate("ai_bar", "AI Model Router", "AI", "NOSAiBarWidget", 4, 2, "Route between Gemini and GPT models.", Icons.Default.Face, listOf(4 to 2)),
    
    // Productivity
    WidgetTemplate("productivity_todo", "To-Do List", "PRODUCTIVITY", "NOSProductivityTodoWidget", 2, 2, "Compact pending task checks checklist.", Icons.Default.Check, listOf(2 to 2)),
    WidgetTemplate("productivity_focus", "Focus Mode", "PRODUCTIVITY", "NOSProductivityFocusWidget", 2, 2, "Countdown stopwatch focus.", Icons.Default.Notifications, listOf(2 to 2)),
    WidgetTemplate("productivity_calculator", "Mini Calculator", "PRODUCTIVITY", "NOSCalculatorWidget", 4, 4, "keypad for calculations.", Icons.Default.List, listOf(4 to 4)),
    WidgetTemplate("productivity_camera", "Camera Shortcut", "PRODUCTIVITY", "NOSCameraWidget", 2, 2, "Quick launcher for camera snap.", Icons.Default.PlayArrow, listOf(2 to 2)),
    WidgetTemplate("productivity_music", "Music Player", "PRODUCTIVITY", "NOSMusicWidget", 4, 2, "Playback controls and track progress card.", Icons.Default.Refresh, listOf(4 to 2)),
    WidgetTemplate("productivity_text_username", "Developer Account", "PRODUCTIVITY", "NOSTextUsernameWidget", 2, 2, "GitHub username text layout card.", Icons.Default.Person, listOf(2 to 2)),
    WidgetTemplate("productivity_google_search", "Google Search", "PRODUCTIVITY", "NOSGoogleSearchWidget", 4, 2, "Nothing Google Search panel.", Icons.Default.Search, listOf(4 to 2)),
    WidgetTemplate("productivity_pomodoro", "Pomodoro Timer", "PRODUCTIVITY", "NOSPomodoroWidget", 2, 2, "Work and break pomodoro intervals.", Icons.Default.Notifications, listOf(2 to 2)),
    WidgetTemplate("productivity_folder", "Apps Folder", "PRODUCTIVITY", "NOSFolderWidget", 2, 2, "Dynamic app shortcuts collection.", Icons.Default.Home, listOf(2 to 2)),
    WidgetTemplate("productivity_photo_frame", "Photo Frame", "PRODUCTIVITY", "NOSPhotoFrameWidget", 2, 2, "Visual photo frame template.", Icons.Default.Send, listOf(2 to 2)),
    
    // Social
    WidgetTemplate("social_feed", "Social Feed", "SOCIAL", "NOSSocialFeedWidget", 2, 2, "Recent DM / feed notifications.", Icons.Default.Email, listOf(2 to 2)),
    WidgetTemplate("social_contact", "Fav Contact", "SOCIAL", "NOSContactWidget", 2, 2, "Favorite contact quick messaging.", Icons.Default.Person, listOf(2 to 2)),
    WidgetTemplate("social_shortcuts", "Direct Chats", "SOCIAL", "NOSSocialShortcutsWidget", 2, 2, "Social app launcher collection.", Icons.Default.Share, listOf(2 to 2)),
    
    // Smart Home
    WidgetTemplate("smart_home_controls", "Smart Room", "SMART HOME", "NOSSmartHomeControlsWidget", 4, 2, "Connected lights AC smart switches.", Icons.Default.Home, listOf(4 to 2)),
    WidgetTemplate("smart_home_torch", "Flashlight Torch", "SMART HOME", "NOSTorchWidget", 2, 2, "System flashlight launcher switch.", Icons.Default.Lock, listOf(2 to 2)),
    WidgetTemplate("smart_home_bluetooth", "Bluetooth Ear", "SMART HOME", "NOSBluetoothWidget", 2, 2, "Connected bluetooth devices panel.", Icons.Default.Share, listOf(2 to 2)),
    WidgetTemplate("smart_home_sound_control", "Ringer Mode", "SMART HOME", "NOSSoundControlWidget", 2, 2, "Silent / Vibrate / Sound profile switcher.", Icons.Default.Notifications, listOf(2 to 2))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    store: WidgetStore,
    modifier: Modifier = Modifier,
    showToast: (String, String) -> Unit
) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("ALL") }
    var pendingWidget by remember { mutableStateOf<WidgetTemplate?>(null) }
    var selectedWidth by remember { mutableStateOf(2) }
    var selectedHeight by remember { mutableStateOf(2) }
    val sheetState = rememberModalBottomSheetState()
    var showBottomSheet by remember { mutableStateOf(false) }

    val filteredTemplates = remember(selectedCategory) {
        if (selectedCategory == "ALL") templates else templates.filter { it.category == selectedCategory }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .padding(top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ── CATEGORIES BAR (Claymorphic Capsule shape) ──
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories) { cat ->
                val isSelected = selectedCategory == cat
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) Color.White else Color(0xFF161618))
                        .border(1.dp, Color(0xFF242426), RoundedCornerShape(20.dp))
                        .clickable { selectedCategory = cat }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = cat,
                        color = if (isSelected) Color.Black else Color(0xFF8E8E93),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
            }
        }

        // ── LAYOUT GRID OF TEMPLATES ──
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(bottom = 80.dp) // Leave space for floating tabs
        ) {
            items(filteredTemplates) { item ->
                WidgetCard(template = item, store = store) {
                    pendingWidget = item
                    selectedWidth = item.w
                    selectedHeight = item.h
                    showBottomSheet = true
                }
            }
        }
    }

    // ── BOTTOM SHEET CUSTOMIZER DRAWER ──
    if (showBottomSheet && pendingWidget != null) {
        val widget = pendingWidget!!
        ModalBottomSheet(
            onDismissRequest = { showBottomSheet = false },
            sheetState = sheetState,
            containerColor = Color(0xFF0F0F12),
            dragHandle = { BottomSheetDefaults.DragHandle(color = Color(0x33FFFFFF)) }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("WIDGET LIVE PREVIEW", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)

                // 3D Claymorphic Live Preview Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(28.dp))
                        .background(Color(0xFF060608))
                        .border(1.dp, Color(0xFF242428), RoundedCornerShape(28.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    DotGridPattern()
                    
                    // Render high-fidelity Composable live preview matching the active theme!
                    WidgetLivePreview(
                        templateId = widget.id,
                        theme = store.activeTheme.value,
                        width = selectedWidth,
                        height = selectedHeight,
                        store = store,
                        modifier = Modifier
                            .width(160.dp)
                            .height(120.dp)
                    )
                }

                // Details Text
                Text(widget.name, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(widget.description, color = Color(0xFF8E8E93), fontSize = 11.5.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(horizontal = 12.dp))

                // Size Selection
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("CHOOSE WIDGET SIZE", color = Color(0xFF8E8E93), fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        widget.supportedSizes.forEach { size ->
                            val isSel = selectedWidth == size.first && selectedHeight == size.second
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSel) Color.White else Color(0xFF161618))
                                    .border(1.dp, Color(0xFF242426), RoundedCornerShape(12.dp))
                                    .clickable {
                                        selectedWidth = size.first
                                        selectedHeight = size.second
                                    }
                                    .padding(vertical = 10.dp, horizontal = 16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    "${size.first} × ${size.second}",
                                    color = if (isSel) Color.Black else Color(0xFF8E8E93),
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Slide to Pin CTA
                AnimatedSwipeButton(
                    title = "SLIDE TO PIN WIDGET",
                    successTitle = "ADDING WIDGET...",
                    onSwipeSuccess = {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            val appWidgetManager = AppWidgetManager.getInstance(context)
                            val providerClassName = "com.nothing.nosgallery.widget.${widget.className}"
                            val myProvider = ComponentName(context, providerClassName)
                            
                            if (appWidgetManager.isRequestPinAppWidgetSupported) {
                                val stateMap = mapOf(
                                    "waterIntake" to store.waterIntake.value,
                                    "waterGoal" to store.waterGoal.value,
                                    "stopwatchTime" to store.stopwatchTime.value,
                                    "stopwatchRunning" to store.stopwatchRunning.value,
                                    "torchEnabled" to store.torchEnabled.value,
                                    "githubUsername" to store.githubUsername.value,
                                    "soundProfile" to store.soundProfile.value
                                )
                                val layoutObj = WidgetLayoutCompiler.compile(widget.id, emptyMap(), store.activeTheme.value, stateMap)

                                val callbackIntent = Intent(context, NosWidgetPinReceiver::class.java).apply {
                                    putExtra("widgetId", "appId_${System.currentTimeMillis()}")
                                    putExtra("category", widget.category.lowercase())
                                    putExtra("widgetJson", layoutObj.toString())
                                }

                                val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                                } else {
                                    PendingIntent.FLAG_UPDATE_CURRENT
                                }

                                val successCallback = PendingIntent.getBroadcast(
                                    context,
                                    widget.id.hashCode(),
                                    callbackIntent,
                                    flags
                                )

                                appWidgetManager.requestPinAppWidget(myProvider, null, successCallback)
                                showToast("Widget Pin request sent to launcher!", "success")
                            } else {
                                showToast("Pinning is not supported by your launcher.", "error")
                            }
                        } else {
                            showToast("Android O (API 26) or higher is required for pinning.", "error")
                        }
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

// Composable showing actual live preview of each widget based on the active theme
@Composable
fun WidgetLivePreview(
    templateId: String,
    theme: String,
    @Suppress("UNUSED_PARAMETER") width: Int,
    @Suppress("UNUSED_PARAMETER") height: Int,
    store: WidgetStore,
    modifier: Modifier = Modifier
) {
    val colors = remember(theme) { getThemeColors(theme) }
    val bgColor = colors.first
    val textColor = colors.second
    val accentColor = colors.third
    val subtextColor = textColor.copy(alpha = 0.5f)
    val btnBgColor = if (theme == "minimal") Color(0xFFE0E0E0) else Color(0xFF1E1E22)

    // Animated breathing pacer transition
    val infiniteTransition = rememberInfiniteTransition(label = "breath")
    val breathScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(2500, easing = EaseInOutCirc),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    // Ticking state for analog clock
    var timeState by remember { mutableStateOf(Date()) }
    LaunchedEffect(Unit) {
        while (true) {
            timeState = Date()
            kotlinx.coroutines.delay(1000)
        }
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(bgColor)
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(24.dp))
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.Start,
            verticalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxSize()
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(4.dp)
                        .clip(CircleShape)
                        .background(accentColor)
                )
                Text(
                    text = templateId.substringBefore('_').uppercase(),
                    color = subtextColor,
                    fontSize = 7.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
            }

            // Main UI depending on widget type
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                when {
                    templateId == "clock_digital" -> {
                        val format = SimpleDateFormat("h:mm a", Locale.getDefault()).format(timeState)
                        Text(format, color = textColor, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                    templateId == "clock_dot" -> {
                        val format = SimpleDateFormat("HH:mm", Locale.getDefault()).format(timeState)
                        Text(
                            text = format,
                            color = textColor,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    templateId == "clock_analog" -> {
                        Canvas(modifier = Modifier.size(50.dp)) {
                            val radius = size.minDimension / 2
                            drawCircle(color = textColor.copy(alpha = 0.1f), radius = radius, style = Stroke(width = 2.dp.toPx()))
                            
                            // Clock dial ticks
                            for (i in 0 until 12) {
                                val angle = i * 30 * Math.PI / 180
                                val startX = (radius - 4.dp.toPx()) * Math.sin(angle).toFloat()
                                val startY = -(radius - 4.dp.toPx()) * Math.cos(angle).toFloat()
                                val endX = radius * Math.sin(angle).toFloat()
                                val endY = -radius * Math.cos(angle).toFloat()
                                drawLine(color = subtextColor, start = Offset(size.width/2 + startX, size.height/2 + startY), end = Offset(size.width/2 + endX, size.height/2 + endY), strokeWidth = 1.dp.toPx())
                            }

                            // Hands
                            val cal = Calendar.getInstance()
                            val hour = cal.get(Calendar.HOUR)
                            val min = cal.get(Calendar.MINUTE)
                            val sec = cal.get(Calendar.SECOND)

                            // Hour hand
                            val hrAngle = (hour * 30 + min * 0.5) * Math.PI / 180
                            val hrX = (radius * 0.5f) * Math.sin(hrAngle).toFloat()
                            val hrY = -(radius * 0.5f) * Math.cos(hrAngle).toFloat()
                            drawLine(color = textColor, start = Offset(size.width/2, size.height/2), end = Offset(size.width/2 + hrX, size.height/2 + hrY), strokeWidth = 2.5.dp.toPx())

                            // Minute hand
                            val minAngle = min * 6 * Math.PI / 180
                            val minX = (radius * 0.7f) * Math.sin(minAngle).toFloat()
                            val minY = -(radius * 0.7f) * Math.cos(minAngle).toFloat()
                            drawLine(color = textColor, start = Offset(size.width/2, size.height/2), end = Offset(size.width/2 + minX, size.height/2 + minY), strokeWidth = 1.5.dp.toPx())

                            // Ticking red second hand
                            val secAngle = sec * 6 * Math.PI / 180
                            val secX = (radius * 0.85f) * Math.sin(secAngle).toFloat()
                            val secY = -(radius * 0.85f) * Math.cos(secAngle).toFloat()
                            drawLine(color = accentColor, start = Offset(size.width/2, size.height/2), end = Offset(size.width/2 + secX, size.height/2 + secY), strokeWidth = 1.dp.toPx())
                        }
                    }
                    templateId == "clock_flip" -> {
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            listOf("21", "09").forEach { num ->
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(textColor.copy(alpha = 0.1f))
                                        .border(1.dp, textColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(num, color = textColor, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                    templateId == "clock_stopwatch" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("00:00.0", color = textColor, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Box(modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(btnBgColor).padding(horizontal = 6.dp, vertical = 2.dp)) {
                                    Text("START", color = textColor, fontSize = 7.sp, fontWeight = FontWeight.Bold)
                                }
                                Box(modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(btnBgColor).padding(horizontal = 6.dp, vertical = 2.dp)) {
                                    Text("RESET", color = textColor, fontSize = 7.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                    templateId == "calendar_monthly" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("S M T W T F S", color = subtextColor, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(2.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                (1..7).forEach { num ->
                                    val isToday = num == 4
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (isToday) accentColor else Color.Transparent),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("$num", color = if (isToday) Color.Black else textColor, fontSize = 5.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                    templateId == "calendar_agenda" -> {
                        Column(horizontalAlignment = Alignment.Start) {
                            Text("12:00 PM - Sync", color = textColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("2 events today", color = subtextColor, fontSize = 7.sp)
                        }
                    }
                    templateId == "calendar_progress" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(modifier = Modifier.size(24.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(progress = { 0.5f }, color = accentColor, trackColor = textColor.copy(alpha = 0.1f), strokeWidth = 2.5.dp)
                                Text("50%", color = textColor, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    templateId == "weather_current" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("☀️", fontSize = 18.sp)
                            Column {
                                Text("24°C", color = textColor, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                Text("SUNNY", color = subtextColor, fontSize = 7.sp)
                            }
                        }
                    }
                    templateId == "weather_aqi" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🍃 32 AQI", color = textColor, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text("EXCELLENT", color = accentColor, fontSize = 7.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "weather_moon_phase" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("🌙", fontSize = 16.sp)
                            Text("GIBBOUS (85%)", color = textColor, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "health_steps" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("👣", fontSize = 14.sp)
                            Column {
                                Text("5,420 steps", color = textColor, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Text("Goal: 10k", color = subtextColor, fontSize = 7.sp)
                            }
                        }
                    }
                    templateId == "health_water" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("💧 ${store.waterIntake.value} ml", color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(btnBgColor).clickable {
                                store.setWaterIntakeValue(store.waterIntake.value + 250)
                            }.padding(horizontal = 8.dp, vertical = 2.dp)) {
                                Text("+250ML", color = textColor, fontSize = 6.5.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    templateId == "health_breath" -> {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .graphicsLayer(scaleX = breathScale, scaleY = breathScale)
                                .clip(CircleShape)
                                .background(accentColor.copy(alpha = 0.2f))
                                .border(1.dp, accentColor, CircleShape)
                        )
                    }
                    templateId == "finance_crypto" -> {
                        Column {
                            Text("BTC: $64.2k", color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("+4.25% (24H)", color = Color(0xFF34C759), fontSize = 7.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "developer_git" -> {
                        // Renders a mini 7x3 GitHub commits matrix
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            (1..3).forEach { _ ->
                                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    (1..7).forEach { index ->
                                        val cellColor = if (index % 3 == 0) accentColor else if (index % 2 == 0) textColor.copy(alpha = 0.2f) else textColor.copy(alpha = 0.05f)
                                        Box(
                                            modifier = Modifier
                                                .size(5.dp)
                                                .clip(RoundedCornerShape(1.dp))
                                                .background(cellColor)
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text("1,240 commits", color = subtextColor, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "developer_build" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF34C759)))
                            Text("BUILD SUCCESS #242", color = textColor, fontSize = 8.5.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "developer_cpu" -> {
                        Column(horizontalAlignment = Alignment.Start) {
                            Text("CPU LOAD: 28%", color = textColor, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(2.dp))
                            LinearProgressIndicator(progress = { 0.28f }, color = accentColor, trackColor = textColor.copy(alpha = 0.1f), modifier = Modifier.width(60.dp).height(3.dp).clip(CircleShape))
                        }
                    }
                    templateId == "developer_quick_controls" -> {
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            listOf("WIFI", "BT", "TRCH").forEach { control ->
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(textColor.copy(alpha = 0.1f))
                                        .size(24.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(control, color = textColor, fontSize = 5.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                    templateId == "developer_battery" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("🔋", fontSize = 14.sp)
                            Text("82%", color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    templateId == "productivity_calculator" -> {
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            listOf(listOf("C", "/", "*"), listOf("7", "8", "9"), listOf("4", "5", "+")).forEach { row ->
                                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    row.forEach { char ->
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(3.dp))
                                                .background(textColor.copy(alpha = 0.1f))
                                                .size(10.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(char, color = textColor, fontSize = 5.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    templateId == "productivity_music" -> {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(modifier = Modifier.size(24.dp).clip(CircleShape).background(textColor.copy(alpha = 0.15f)), contentAlignment = Alignment.Center) {
                                Text("🎵", fontSize = 10.sp)
                            }
                            Column {
                                Text("Nothing (Spec)", color = textColor, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                Text("⏮  ▶  ⏭", color = accentColor, fontSize = 9.sp)
                            }
                        }
                    }
                    templateId == "smart_home_torch" -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(if (store.torchEnabled.value) "ON" else "OFF", color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(btnBgColor).clickable {
                                store.toggleTorch(!store.torchEnabled.value)
                            }.padding(horizontal = 8.dp, vertical = 2.dp)) {
                                Text("TOGGLE", color = textColor, fontSize = 6.5.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    else -> {
                        Text("NOS STUDIO", color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Footer
            Text(
                text = "NOS • STUDIO",
                color = accentColor,
                fontSize = 7.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.8.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Start
            )
        }
    }
}

// Map theme configurations to Compose Colors
fun getThemeColors(theme: String): Triple<Color, Color, Color> {
    return when (theme) {
        "nos" -> Triple(Color(0xFF000000), Color(0xFFFFFFFF), Color(0xFFFF0000))
        "minimal" -> Triple(Color(0xFFF5F5F5), Color(0xFF111111), Color(0xFF333333))
        "warm" -> Triple(Color(0xFF1A1209), Color(0xFFFFFFFF), Color(0xFFE8824B))
        "luxury", "obsidian" -> Triple(Color(0xFF1C1A17), Color(0xFFFFFFFF), Color(0xFFDFBA6B))
        "cyberpunk" -> Triple(Color(0xFF0D0F1A), Color(0xFFFFFFFF), Color(0xFFFF003C))
        "amoled" -> Triple(Color(0xFF000000), Color(0xFFFFFFFF), Color(0xFF39FF14))
        "glassmorphism" -> Triple(Color(0x991E2530), Color(0xFFFFFFFF), Color(0xFF00FFFF))
        "liquidglass" -> Triple(Color(0x990B1E24), Color(0xFFFFFFFF), Color(0xFF00F0FF))
        else -> Triple(Color(0xFF000000), Color(0xFFFFFFFF), Color(0xFFFF0000))
    }
}

@Composable
fun WidgetCard(
    template: WidgetTemplate,
    store: WidgetStore,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(1.dp, Color(0xFF1C1C20), RoundedCornerShape(22.dp)),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0D0D10))
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .padding(8.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color(0xFF060609)),
                contentAlignment = Alignment.Center
            ) {
                // Live preview replica directly in the browse card!
                WidgetLivePreview(
                    templateId = template.id,
                    theme = store.activeTheme.value,
                    width = template.w,
                    height = template.h,
                    store = store,
                    modifier = Modifier.fillMaxSize()
                )
            }
            HorizontalDivider(color = Color(0xFF151518))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(template.name, color = Color(0xFFE5E5EA), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("${template.w}x${template.h}", color = Color(0xFF444444), fontSize = 9.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DotGridPattern() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val dotRadius = 1.dp.toPx()
        val spacing = 12.dp.toPx()
        val width = size.width
        val height = size.height

        var x = spacing
        while (x < width) {
            var y = spacing
            while (y < height) {
                drawCircle(
                    color = Color.White.copy(alpha = 0.08f),
                    radius = dotRadius,
                    center = Offset(x, y)
                )
                y += spacing
            }
            x += spacing
        }
    }
}
