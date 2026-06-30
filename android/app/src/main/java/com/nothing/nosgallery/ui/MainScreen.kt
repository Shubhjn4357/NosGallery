package com.nothing.nosgallery.ui

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nothing.nosgallery.store.WidgetStore
import com.nothing.nosgallery.store.SavedWidget
import com.nothing.nosgallery.widget.NosWidgetPinReceiver
import com.nothing.nosgallery.widget.WidgetLayoutCompiler

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

    val categories = listOf("ALL", "CLOCKS", "WEATHER", "HEALTH", "DEVELOPER")

    val templates = listOf(
        WidgetTemplate(
            id = "clock_digital",
            name = "Minimal Digital",
            category = "CLOCKS",
            className = "NOSClockDigitalWidget",
            w = 2,
            h = 2,
            description = "Modern digital clock display.",
            icon = Icons.Default.DateRange,
            supportedSizes = listOf(2 to 2, 4 to 2)
        ),
        WidgetTemplate(
            id = "clock_dot",
            name = "NOS Dot Clock",
            category = "CLOCKS",
            className = "NOSClockDotWidget",
            w = 4,
            h = 2,
            description = "Signature Nothing style dot-matrix clock.",
            icon = Icons.Default.List,
            supportedSizes = listOf(4 to 2)
        ),
        WidgetTemplate(
            id = "clock_analog",
            name = "Classic Analog",
            category = "CLOCKS",
            className = "NOSClockAnalogWidget",
            w = 2,
            h = 2,
            description = "Classic ticking clock with radial hands.",
            icon = Icons.Default.Refresh,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "clock_flip",
            name = "Flip Clock",
            category = "CLOCKS",
            className = "NOSClockFlipWidget",
            w = 4,
            h = 2,
            description = "Retro animated flip clock.",
            icon = Icons.Default.PlayArrow,
            supportedSizes = listOf(4 to 2)
        ),
        WidgetTemplate(
            id = "clock_stopwatch",
            name = "Stopwatch",
            category = "CLOCKS",
            className = "NOSClockStopwatchWidget",
            w = 2,
            h = 2,
            description = "Interactive stopwatch timer.",
            icon = Icons.Default.Star,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "weather_current",
            name = "Current Weather",
            category = "WEATHER",
            className = "NOSWeatherCurrentWidget",
            w = 2,
            h = 2,
            description = "Live climate and temperature stats.",
            icon = Icons.Default.Send,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "weather_aqi",
            name = "Air Quality AQI",
            category = "WEATHER",
            className = "NOSWeatherAqiWidget",
            w = 2,
            h = 2,
            description = "Circular gauge showing air quality status.",
            icon = Icons.Default.Warning,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "health_steps",
            name = "Steps Tracker",
            category = "HEALTH",
            className = "NOSHealthStepsWidget",
            w = 2,
            h = 2,
            description = "Keep track of your daily walking steps.",
            icon = Icons.Default.Favorite,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "health_water",
            name = "Water Intake",
            category = "HEALTH",
            className = "NOSHealthWaterWidget",
            w = 2,
            h = 2,
            description = "Water tracker with simple logging buttons.",
            icon = Icons.Default.Add,
            supportedSizes = listOf(2 to 2)
        ),
        WidgetTemplate(
            id = "developer_battery",
            name = "Battery Status",
            category = "DEVELOPER",
            className = "NOSBatteryWidget",
            w = 2,
            h = 2,
            description = "Battery level monitor with progress bar.",
            icon = Icons.Default.Info,
            supportedSizes = listOf(2 to 2)
        )
    )

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
        // ── CATEGORIES ROW ──
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

        // ── GRID OF TEMPLATES ──
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            items(filteredTemplates) { item ->
                WidgetCard(template = item) {
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
            containerColor = Color(0xFF0A0A0B),
            dragHandle = { BottomSheetDefaults.DragHandle(color = Color(0x33FFFFFF)) }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("WIDGET PREVIEW", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)

                // Live Preview box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color.Black)
                        .border(1.dp, Color(0xFF161618), RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    DotGridPattern()
                    
                    // Simple live mockup in preview box
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFF0C0C0E))
                            .border(1.dp, Color(0xFF1C1C20), RoundedCornerShape(16.dp))
                            .padding(14.dp)
                            .width(130.dp)
                            .height(110.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(widget.name.uppercase(), color = Color(0xFF8E8E93), fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        Icon(widget.icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                        Text("Size: ${selectedWidth}x${selectedHeight}", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }

                // Details Text
                Text(widget.name, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(widget.description, color = Color(0xFF8E8E93), fontSize = 11.5.sp, modifier = Modifier.padding(horizontal = 12.dp))

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
                                    .background(if (isSel) Color.White else Color(0xFF111113))
                                    .border(1.dp, Color(0xFF222225), RoundedCornerShape(12.dp))
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
                                    "torchEnabled" to store.torchEnabled.value
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

@Composable
fun WidgetCard(
    template: WidgetTemplate,
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
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(12.dp)
                ) {
                    Icon(
                        imageVector = template.icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(template.name, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
            Divider(color = Color(0xFF151518))
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
