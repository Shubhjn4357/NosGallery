package com.nothing.nosgallery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.nothing.nosgallery.store.WidgetStore
import com.nothing.nosgallery.ui.MainScreen
import com.nothing.nosgallery.ui.SettingsScreen
import com.nothing.nosgallery.ui.theme.NosGalleryTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge drawing
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val store = WidgetStore.getInstance(this)

        setContent {
            val activeThemeId = store.activeTheme.value
            
            NosGalleryTheme(themeId = activeThemeId) {
                var activeTab by remember { mutableStateOf("gallery") }
                
                // Toast State
                var toastMessage by remember { mutableStateOf<String?>(null) }
                var toastType by remember { mutableStateOf("info") }
                val coroutineScope = rememberCoroutineScope()

                val showToast: (String, String) -> Unit = { message, type ->
                    coroutineScope.launch {
                        toastMessage = message
                        toastType = type
                        delay(3000)
                        toastMessage = null
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background)
                        .systemBarsPadding()
                ) {
                    // ── MAIN CONTENT VIEWS ──
                    if (activeTab == "gallery") {
                        MainScreen(store = store, showToast = showToast)
                    } else {
                        SettingsScreen(store = store, showToast = showToast)
                    }

                    // ── FLOATING PILL BOTTOM TAB BAR ──
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 24.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF0F0F11))
                            .border(1.dp, Color(0xFF242428), CircleShape)
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Gallery Tab
                            val isGallery = activeTab == "gallery"
                            IconButton(
                                onClick = { activeTab = "gallery" },
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(if (isGallery) Color.White else Color.Transparent)
                                    .size(40.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.List,
                                    contentDescription = "Gallery",
                                    tint = if (isGallery) Color.Black else Color(0xFF8E8E93),
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // Settings Tab
                            val isSettings = activeTab == "settings"
                            IconButton(
                                onClick = { activeTab = "settings" },
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(if (isSettings) Color.White else Color.Transparent)
                                    .size(40.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Settings,
                                    contentDescription = "Settings",
                                    tint = if (isSettings) Color.Black else Color(0xFF8E8E93),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }

                    // ── TOAST OVERLAY (Sonner equivalent) ──
                    AnimatedVisibility(
                        visible = toastMessage != null,
                        enter = slideInVertically(initialOffsetY = { it }),
                        exit = slideOutVertically(targetOffsetY = { it }),
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 84.dp)
                            .padding(horizontal = 20.dp)
                    ) {
                        val toastColor = when (toastType) {
                            "success" -> Color(0xFF0C1F12)
                            "error" -> Color(0xFF220F10)
                            else -> Color(0xFF1C1C1E)
                        }
                        val toastBorderColor = when (toastType) {
                            "success" -> Color(0xFF183A22)
                            "error" -> Color(0xFF441D20)
                            else -> Color(0xFF2C2C2E)
                        }
                        val toastAccentColor = when (toastType) {
                            "success" -> Color(0xFF34C759)
                            "error" -> Color(0xFFFF2D55)
                            else -> Color.White
                        }

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, toastBorderColor, RoundedCornerShape(14.dp)),
                            colors = CardDefaults.cardColors(containerColor = toastColor),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = toastAccentColor,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = toastMessage ?: "",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
