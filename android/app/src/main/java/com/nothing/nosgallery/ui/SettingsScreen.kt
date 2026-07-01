package com.nothing.nosgallery.ui

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nothing.nosgallery.store.WidgetStore
import com.nothing.nosgallery.store.SavedWidget

// Settings Claymorphic container Composable
@Composable
fun SettingsClayCard(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(28.dp),
                clip = false,
                ambientColor = Color.Black.copy(alpha = 0.4f),
                spotColor = Color.Black.copy(alpha = 0.4f)
            )
            .background(Color(0xFF161619), RoundedCornerShape(28.dp))
            .border(
                1.dp,
                Brush.linearGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.08f),
                        Color.Black.copy(alpha = 0.3f)
                    )
                ),
                RoundedCornerShape(28.dp)
            )
            .padding(18.dp)
    ) {
        Column {
            Text(
                text = title.uppercase(),
                color = Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(bottom = 14.dp)
            )
            content()
        }
    }
}

@Composable
fun SettingsScreen(
    store: WidgetStore,
    modifier: Modifier = Modifier,
    showToast: (String, String) -> Unit
) {
    val view = LocalView.current
    val scrollState = rememberScrollState()

    // Trigger haptic helper
    val triggerHaptic = {
        if (store.hapticsEnabled.value) {
            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
            .padding(bottom = 80.dp), // Space for floating tab bar
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ── HEADER ──
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Settings, contentDescription = null, tint = Color(0xFFFF2D2D), modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "STUDIO SETTINGS", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "Configure the widgets engine and active theme defaults", color = Color(0xFF8E8E93), fontSize = 11.sp)
            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = Color(0xFF1F1F22))
        }

        // ── STUDIO ENVIRONMENT ──
        SettingsClayCard(title = "Studio Environment") {
            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                Text("Global Theme", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("Active theme applied to all launcher widgets", color = Color(0xFF8E8E93), fontSize = 10.sp)
                Spacer(modifier = Modifier.height(8.dp))
                
                val themesList = listOf("nos", "minimal", "warm", "luxury", "cyberpunk", "amoled", "glassmorphism", "liquidglass")
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(themesList) { t ->
                        val isSelected = store.activeTheme.value == t
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (isSelected) Color.White else Color(0xFF222226))
                                .border(1.dp, Color(0xFF333338), RoundedCornerShape(20.dp))
                                .clickable {
                                    triggerHaptic()
                                    store.activeTheme.value = t
                                    store.saveStateToNative()
                                }
                                .padding(horizontal = 14.dp, vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = t.uppercase(),
                                color = if (isSelected) Color.Black else Color(0xFF8E8E93),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // ── DEVELOPER ACCOUNTS ──
        SettingsClayCard(title = "Developer & Accounts") {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Github Username
                Column {
                    Text("GitHub Username", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("Specify username to fetch contributions and stats", color = Color(0xFF8E8E93), fontSize = 10.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = store.githubUsername.value,
                        onValueChange = {
                            store.githubUsername.value = it
                            store.saveStateToNative()
                        },
                        placeholder = { Text("e.g. octocat", color = Color(0xFF666666)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF333338),
                            unfocusedBorderColor = Color(0xFF242428),
                            focusedContainerColor = Color(0xFF0F0F12),
                            unfocusedContainerColor = Color(0xFF0F0F12),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Gemini API
                Column {
                    Text("Gemini API Key", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("API Key for Google Generative AI integration", color = Color(0xFF8E8E93), fontSize = 10.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = store.geminiApiKey.value,
                        onValueChange = {
                            store.geminiApiKey.value = it
                            store.saveStateToNative()
                        },
                        placeholder = { Text("AIzaSy...", color = Color(0xFF666666)) },
                        visualTransformation = PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF333338),
                            unfocusedBorderColor = Color(0xFF242428),
                            focusedContainerColor = Color(0xFF0F0F12),
                            unfocusedContainerColor = Color(0xFF0F0F12),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // ── HEALTH SYNC ──
        SettingsClayCard(title = "Health Sync Integration") {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Google Health Sync", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("Sync steps metrics with Google Fit", color = Color(0xFF8E8E93), fontSize = 10.sp)
                }
                Switch(
                    checked = store.googleHealthConnected.value,
                    onCheckedChange = {
                        triggerHaptic()
                        store.googleHealthConnected.value = it
                        store.saveStateToNative()
                        if (it) {
                            showToast("Google Health synchronized successfully!", "success")
                        }
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = Color(0xFFFF2D2D),
                        uncheckedThumbColor = Color(0xFF8E8E93),
                        uncheckedTrackColor = Color(0xFF222224)
                    )
                )
            }
        }

        // ── BATTERY OPTIMIZER ──
        val batteryEstimation = remember(store.widgetsList.value, store.autoRefresh.value, store.refreshInterval.value, store.batterySaver.value) {
            var cost = 0.15f
            cost += store.widgetsList.value.size * 0.05f
            if (store.refreshInterval.value == "realtime") cost += 0.45f
            if (store.refreshInterval.value == "1min") cost += 0.15f
            if (store.refreshInterval.value == "5min") cost += 0.05f
            if (store.refreshInterval.value == "15min") cost += 0.01f
            if (!store.autoRefresh.value) cost = 0.08f
            if (store.batterySaver.value) cost *= 0.5f
            String.format("%.2f", cost)
        }

        SettingsClayCard(title = "Battery Optimizer") {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                // Readout Panel
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF0F0F12))
                        .border(1.dp, Color(0xFF242428), RoundedCornerShape(18.dp))
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("ESTIMATED DRAIN COST", color = Color(0xFF8E8E93), fontSize = 8.5.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                        Text("$batteryEstimation% / HR", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    val fillPercent = (batteryEstimation.toFloatOrNull() ?: 0.15f) * 0.8f
                    LinearProgressIndicator(
                        progress = { fillPercent.coerceIn(0f, 1f) },
                        color = if ((batteryEstimation.toFloatOrNull() ?: 0f) > 0.4f) Color(0xFFFF2D2D) else Color.White,
                        trackColor = Color(0xFF222226),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(CircleShape)
                            .border(1.dp, Color(0xFF333338), CircleShape)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Target rate: < 1% battery/hour. Active widgets refresh cycle throttled automatically.",
                        color = Color(0xFF666666),
                        fontSize = 8.5.sp,
                        lineHeight = 11.sp
                    )
                }

                // Auto Refresh switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Auto-Refresh Engine", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Toggle background content updates", color = Color(0xFF8E8E93), fontSize = 10.sp)
                    }
                    Switch(
                        checked = store.autoRefresh.value,
                        onCheckedChange = {
                            triggerHaptic()
                            store.autoRefresh.value = it
                            store.saveStateToNative()
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = Color.White,
                            uncheckedThumbColor = Color(0xFF8E8E93),
                            uncheckedTrackColor = Color(0xFF222224)
                        )
                    )
                }

                // Throttling selector
                if (store.autoRefresh.value) {
                    Column {
                        Text("Batching Interval", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Updates frequency threshold", color = Color(0xFF8E8E93), fontSize = 10.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        
                        val intervals = listOf("realtime" to "LIVE", "1min" to "1 MIN", "5min" to "5 MIN", "15min" to "15 MIN")
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0F0F12))
                                .border(1.dp, Color(0xFF242428), RoundedCornerShape(12.dp))
                                .padding(2.dp)
                        ) {
                            intervals.forEach { (key, label) ->
                                val isSel = store.refreshInterval.value == key
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSel) Color.White else Color.Transparent)
                                        .clickable {
                                            triggerHaptic()
                                            store.refreshInterval.value = key
                                            store.saveStateToNative()
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        color = if (isSel) Color.Black else Color(0xFF8E8E93),
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                // Battery Saver switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Battery Saver Mode", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Caps transitions rendering & background updates", color = Color(0xFF8E8E93), fontSize = 10.sp)
                    }
                    Switch(
                        checked = store.batterySaver.value,
                        onCheckedChange = {
                            triggerHaptic()
                            store.batterySaver.value = it
                            store.saveStateToNative()
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = Color.White,
                            uncheckedThumbColor = Color(0xFF8E8E93),
                            uncheckedTrackColor = Color(0xFF222224)
                        )
                    )
                }
            }
        }

        // ── DIAGNOSTICS ──
        SettingsClayCard(title = "Gallery Diagnostics") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                DiagRow(label = "Active Screen Widgets", value = store.widgetsList.value.size.toString())
                DiagRow(label = "Persistence Store", value = "SHARED PREFS ACTIVE", valueColor = Color(0xFF34C759))
                
                Spacer(modifier = Modifier.height(6.dp))
                
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0F0F12))
                        .border(1.dp, Color(0xFFFF2D2D), RoundedCornerShape(24.dp))
                        .clickable {
                            triggerHaptic()
                            store.clearWidgets()
                            showToast("Active widgets canvas cleared!", "info")
                        }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFFF2D2D), modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("CLEAR PREVIEW CANVAS", color = Color(0xFFFF2D2D), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                    }
                }
            }
        }

        Text(
            text = "NOS GALLERY STUDIO v2.0.0 • NATIVE KOTLIN",
            color = Color(0xFF444444),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentWidth(Alignment.CenterHorizontally)
                .padding(vertical = 12.dp)
        )
    }
}

@Composable
fun DiagRow(
    label: String,
    value: String,
    valueColor: Color = Color.White
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color(0xFF8E8E93), fontSize = 11.5.sp)
        Text(value, color = valueColor, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
    }
}
