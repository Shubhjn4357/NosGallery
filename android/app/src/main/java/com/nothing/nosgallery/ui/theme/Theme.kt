package com.nothing.nosgallery.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Premium color palettes matching gallery themes
object ThemeColors {
    // 1. NOS Theme
    val NosBg = Color(0xFF000000)
    val NosText = Color(0xFFFFFFFF)
    val NosSubtext = Color(0xFF888888)
    val NosAccent = Color(0xFFF52E2E)
    val NosCardBg = Color(0xFF0A0A0C)

    // 2. Minimal Theme
    val MinimalBg = Color(0xFFF6F6F6)
    val MinimalText = Color(0xFF111111)
    val MinimalSubtext = Color(0xFF777777)
    val MinimalAccent = Color(0xFF222222)
    val MinimalCardBg = Color(0xFFEBEBEB)

    // 3. Warm Theme
    val WarmBg = Color(0xFF1A1209)
    val WarmText = Color(0xFFFFF6EA)
    val WarmSubtext = Color(0xFFA38B70)
    val WarmAccent = Color(0xFFE8824B)
    val WarmCardBg = Color(0xFF281E13)

    // 4. Obsidian / Luxury Theme
    val LuxuryBg = Color(0xFF161513)
    val LuxuryText = Color(0xFFFFFBF5)
    val LuxurySubtext = Color(0xFFA8A090)
    val LuxuryAccent = Color(0xFFDFBA6B)
    val LuxuryCardBg = Color(0xFF23211F)

    // 5. Cyberpunk Theme
    val CyberpunkBg = Color(0xFF070913)
    val CyberpunkText = Color(0xFF00FFFF)
    val CyberpunkSubtext = Color(0xFFB500FF)
    val CyberpunkAccent = Color(0xFFFF0055)
    val CyberpunkCardBg = Color(0xFF121428)

    // 6. Amoled Theme
    val AmoledBg = Color(0xFF000000)
    val AmoledText = Color(0xFFFFFFFF)
    val AmoledSubtext = Color(0xFF888888)
    val AmoledAccent = Color(0xFF39FF14)
    val AmoledCardBg = Color(0xFF101010)

    // 7. Glassmorphism & Liquid Glass
    val GlassBg = Color(0xFF0E1117)
    val GlassCardBg = Color(0x33FFFFFF)
    val GlassBorder = Color(0x55FFFFFF)
    val GlassAccent = Color(0xFF00FFFF)
}

@Composable
fun NosGalleryTheme(
    themeId: String,
    content: @Composable () -> Unit
) {
    val colorScheme = when (themeId) {
        "minimal" -> lightColorScheme(
            background = ThemeColors.MinimalBg,
            onBackground = ThemeColors.MinimalText,
            surface = ThemeColors.MinimalCardBg,
            onSurface = ThemeColors.MinimalText,
            primary = ThemeColors.MinimalAccent
        )
        "warm" -> darkColorScheme(
            background = ThemeColors.WarmBg,
            onBackground = ThemeColors.WarmText,
            surface = ThemeColors.WarmCardBg,
            onSurface = ThemeColors.WarmText,
            primary = ThemeColors.WarmAccent
        )
        "luxury" -> darkColorScheme(
            background = ThemeColors.LuxuryBg,
            onBackground = ThemeColors.LuxuryText,
            surface = ThemeColors.LuxuryCardBg,
            onSurface = ThemeColors.LuxuryText,
            primary = ThemeColors.LuxuryAccent
        )
        "cyberpunk" -> darkColorScheme(
            background = ThemeColors.CyberpunkBg,
            onBackground = ThemeColors.CyberpunkText,
            surface = ThemeColors.CyberpunkCardBg,
            onSurface = ThemeColors.CyberpunkText,
            primary = ThemeColors.CyberpunkAccent
        )
        "amoled" -> darkColorScheme(
            background = ThemeColors.AmoledBg,
            onBackground = ThemeColors.AmoledText,
            surface = ThemeColors.AmoledCardBg,
            onSurface = ThemeColors.AmoledText,
            primary = ThemeColors.AmoledAccent
        )
        else -> darkColorScheme(
            background = ThemeColors.NosBg,
            onBackground = ThemeColors.NosText,
            surface = ThemeColors.NosCardBg,
            onSurface = ThemeColors.NosText,
            primary = ThemeColors.NosAccent
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
