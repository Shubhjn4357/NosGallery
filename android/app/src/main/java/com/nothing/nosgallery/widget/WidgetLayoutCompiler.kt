package com.nothing.nosgallery.widget

import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

object WidgetLayoutCompiler {

    fun compile(
        templateId: String,
        customizations: Map<String, Any>,
        theme: String,
        state: Map<String, Any>
    ): JSONObject {
        val root = JSONObject()
        root.put("type", "view")

        // 1. Theme style lookup
        val colors = getThemeColors(theme)
        val bgColor = colors["bg"] ?: "#ff000000"
        val textColor = colors["text"] ?: "#ffffffff"
        val subtextColor = colors["subtext"] ?: "#ff888888"
        val accentColor = colors["accent"] ?: "#ffff0000"

        val rootStyle = JSONObject()
        rootStyle.put("width", "100%")
        rootStyle.put("height", "100%")
        rootStyle.put("flexDirection", "column")
        rootStyle.put("justifyContent", "center")
        rootStyle.put("alignItems", "center")
        rootStyle.put("backgroundColor", bgColor)
        rootStyle.put("borderRadius", 24)
        rootStyle.put("padding", 12.0)
        root.put("style", rootStyle)

        val children = JSONArray()

        // Helper to extract customizations
        val titleText = customizations["titleText"] as? String
        val valueText = customizations["valueText"] as? String
        val subValueText = customizations["subValueText"] as? String
        val footerText = customizations["footerText"] as? String

        when (templateId) {
            // ==========================================
            // CLOCKS
            // ==========================================
            "clock_digital" -> {
                children.put(createHeader("DIGITAL CLOCK", "clock", accentColor, subtextColor))
                children.put(createClock("h:mm a", 24.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO OPEN", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CLOCK", accentColor))
            }
            "clock_dot" -> {
                children.put(createHeader("NOTHING CLOCK", "clock", accentColor, subtextColor))
                children.put(createClock("HH:mm", 28.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO OPEN", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CLOCK", accentColor))
            }
            "clock_analog" -> {
                children.put(createHeader("ANALOG CLOCK", "clock", accentColor, subtextColor))
                children.put(createText(valueText ?: "Ticking...", 22.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "CLASSIC DIAL", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CLOCK", accentColor))
            }
            "clock_flip" -> {
                children.put(createHeader("FLIP CLOCK", "clock", accentColor, subtextColor))
                children.put(createClock("HH:mm", 26.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO OPEN", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CLOCK", accentColor))
            }
            "clock_stopwatch" -> {
                children.put(createHeader("STOPWATCH", "timer", accentColor, subtextColor))
                val stopwatchRunning = state["stopwatchRunning"] as? Boolean ?: false
                val stopwatchTime = state["stopwatchTime"] as? Long ?: 0L

                if (stopwatchRunning) {
                    val chron = JSONObject()
                    chron.put("type", "chronometer")
                    val chronStyle = JSONObject()
                    chronStyle.put("fontSize", 24.0)
                    chronStyle.put("fontWeight", "bold")
                    chronStyle.put("color", textColor)
                    chronStyle.put("marginTop", 6.0)
                    chron.put("style", chronStyle)
                    children.put(chron)
                } else {
                    val mins = stopwatchTime / 600
                    val secs = (stopwatchTime % 600) / 10
                    val deci = stopwatchTime % 10
                    val textStr = String.format("%02d:%02d.%d", mins, secs, deci)
                    children.put(createText(textStr, 24.0, textColor, margin = 6.0))
                }

                val btnContainer = JSONObject()
                btnContainer.put("type", "view")
                val btnStyle = JSONObject()
                btnStyle.put("flexDirection", "row")
                btnStyle.put("marginTop", 8.0)
                btnStyle.put("gap", 8.0)
                btnContainer.put("style", btnStyle)

                val btnChildren = JSONArray()
                val startLabel = if (stopwatchRunning) "PAUSE" else "START"
                btnChildren.put(createButton(startLabel, "toggle_stopwatch", colors))
                btnChildren.put(createButton("RESET", "reset_stopwatch", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • CHRONOMETER", accentColor))
            }

            // ==========================================
            // CALENDARS
            // ==========================================
            "calendar_monthly" -> {
                children.put(createHeader("MONTH VIEW", "calendar", accentColor, subtextColor))
                children.put(createText("JUL 01", 24.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO EXPAND", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CALENDAR", accentColor))
            }
            "calendar_agenda" -> {
                children.put(createHeader("AGENDA", "calendar", accentColor, subtextColor))
                children.put(createText("Design Sync @ 12", 15.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "2 EVENTS TODAY", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • CALENDAR", accentColor))
            }
            "calendar_progress" -> {
                children.put(createHeader("YEAR PROGRESS", "calendar", accentColor, subtextColor))
                children.put(createProgress(50, 100, accentColor))
                children.put(createText(subValueText ?: "50% OF YEAR COMPLETED", 8.0, textColor, margin = 4.0))
                children.put(createFooter(footerText ?: "NOS • CALENDAR", accentColor))
            }

            // ==========================================
            // WEATHER
            // ==========================================
            "weather_current" -> {
                children.put(createHeader("WEATHER", "cloudsun", accentColor, subtextColor))
                children.put(createText("☀️ 24°C", 24.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "SUNNY • TOKYO", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • WEATHER", accentColor))
            }
            "weather_aqi" -> {
                children.put(createHeader("AIR QUALITY", "cloudsun", accentColor, subtextColor))
                children.put(createText("🍃 32 AQI", 24.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "EXCELLENT", 8.0, accentColor))
                children.put(createFooter(footerText ?: "NOS • WEATHER", accentColor))
            }
            "weather_moon_phase" -> {
                children.put(createHeader("MOON PHASE", "moon", accentColor, subtextColor))
                children.put(createText("GIBBOUS", 18.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "85% ILLUMINATION", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • MOON", accentColor))
            }

            // ==========================================
            // HEALTH
            // ==========================================
            "health_steps" -> {
                children.put(createHeader("STEPS TRACKER", "heart", accentColor, subtextColor))
                children.put(createText("👣 5,420 STEPS", 20.0, textColor, margin = 6.0))
                children.put(createProgress(54, 100, accentColor))
                children.put(createText(subValueText ?: "Goal: 10,000 steps", 8.0, subtextColor, margin = 4.0))
                children.put(createFooter(footerText ?: "NOS • HEALTH", accentColor))
            }
            "health_water" -> {
                children.put(createHeader("WATER TRACKER", "heart", accentColor, subtextColor))
                val waterIntake = state["waterIntake"] as? Int ?: 1000
                val waterGoal = state["waterGoal"] as? Int ?: 2000
                children.put(createText("$waterIntake / $waterGoal ml", 20.0, textColor, margin = 6.0))

                val btnContainer = JSONObject()
                btnContainer.put("type", "view")
                val btnStyle = JSONObject()
                btnStyle.put("flexDirection", "row")
                btnStyle.put("marginTop", 8.0)
                btnStyle.put("gap", 8.0)
                btnContainer.put("style", btnStyle)

                val btnChildren = JSONArray()
                val addActionObj = JSONObject().apply {
                    put("type", "state")
                    put("field", "waterIntake")
                    put("mutation", "increment")
                    put("amount", 250)
                }
                val resetActionObj = JSONObject().apply {
                    put("type", "state")
                    put("field", "waterIntake")
                    put("mutation", "set")
                    put("value", 0)
                }
                btnChildren.put(createButton("+250ml", addActionObj.toString(), colors))
                btnChildren.put(createButton("RESET", resetActionObj.toString(), colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • HEALTH", accentColor))
            }
            "health_breath" -> {
                children.put(createHeader("BREATHING PACER", "heart", accentColor, subtextColor))
                children.put(createText("INHALE... EXHALE", 16.0, textColor, margin = 6.0))
                children.put(createButton("START PACER", "toggle_breath", colors))
                children.put(createFooter(footerText ?: "NOS • HEALTH", accentColor))
            }

            // ==========================================
            // FINANCE
            // ==========================================
            "finance_crypto" -> {
                children.put(createHeader("CRYPTO TAPE", "coins", accentColor, subtextColor))
                children.put(createText("BTC: $64,250", 18.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "+4.25% (24H)", 8.0, accentColor))
                children.put(createFooter(footerText ?: "NOS • MARKET", accentColor))
            }

            // ==========================================
            // DEVELOPER
            // ==========================================
            "developer_git" -> {
                children.put(createHeader("GITHUB GRID", "terminal", accentColor, subtextColor))
                children.put(createText("1,240 COMMITS", 18.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "Last commit: 2h ago", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • DEVELOPER", accentColor))
            }
            "developer_build" -> {
                children.put(createHeader("CI/CD PIPELINE", "terminal", accentColor, subtextColor))
                children.put(createText("SUCCESS", 18.0, "#ff34c759", margin = 6.0))
                children.put(createText(subValueText ?: "Build #242 • MAIN", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • DEV", accentColor))
            }
            "developer_cpu" -> {
                children.put(createHeader("CPU MONITOR", "terminal", accentColor, subtextColor))
                children.put(createText("CPU: 28%", 20.0, textColor, margin = 6.0))
                children.put(createProgress(28, 100, accentColor))
                children.put(createFooter(footerText ?: "NOS • DEV", accentColor))
            }
            "developer_quick_controls" -> {
                children.put(createHeader("CONTROL CENTER", "terminal", accentColor, subtextColor))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 10.0)
                        put("gap", 6.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("WIFI", "toggle_wifi", colors))
                btnChildren.put(createButton("BT", "toggle_bt", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • DEV", accentColor))
            }
            "developer_battery" -> {
                children.put(createHeader("BATTERY STATUS", "terminal", accentColor, subtextColor))
                children.put(createText("🔋 82%", 22.0, textColor, margin = 6.0))
                children.put(createProgress(82, 100, accentColor))
                children.put(createFooter(footerText ?: "NOS • DEV", accentColor))
            }

            // ==========================================
            // AI
            // ==========================================
            "ai_chat" -> {
                children.put(createHeader("NOS AI CHAT", "sparkles", accentColor, subtextColor))
                children.put(createText(valueText ?: "Ask NOS AI", 16.0, textColor, margin = 6.0))
                children.put(createButton("TAP TO CHAT", "open_ai_chat", colors))
                children.put(createFooter(footerText ?: "NOS • AI", accentColor))
            }
            "ai_summary" -> {
                children.put(createHeader("AI SUMMARY", "sparkles", accentColor, subtextColor))
                children.put(createText("Briefing Ready", 16.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "DAILY BRIEF • TAP TO READ", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • AI", accentColor))
            }
            "ai_bar" -> {
                children.put(createHeader("AI ROUTER", "sparkles", accentColor, subtextColor))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 8.0)
                        put("gap", 4.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("GEMINI", "select_gemini", colors))
                btnChildren.put(createButton("GPT", "select_gpt", colors))
                btnChildren.put(createButton("CLAUDE", "select_claude", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • AI", accentColor))
            }

            // ==========================================
            // PRODUCTIVITY
            // ==========================================
            "productivity_todo" -> {
                children.put(createHeader("TO-DO LIST", "checksquare", accentColor, subtextColor))
                children.put(createText("☑️ Prep Slides", 15.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "3 ITEMS REMAINING", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • PRODUCTIVITY", accentColor))
            }
            "productivity_focus" -> {
                children.put(createHeader("FOCUS MODE", "timer", accentColor, subtextColor))
                children.put(createText("25:00", 24.0, textColor, margin = 6.0))
                children.put(createButton("START FOCUS", "toggle_focus", colors))
                children.put(createFooter(footerText ?: "NOS • PRODUCTIVITY", accentColor))
            }
            "productivity_calculator" -> {
                children.put(createHeader("CALCULATOR", "calculator", accentColor, subtextColor))
                children.put(createText("0", 22.0, textColor, margin = 4.0))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 6.0)
                        put("gap", 6.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("1", "press_1", colors))
                btnChildren.put(createButton("2", "press_2", colors))
                btnChildren.put(createButton("+", "press_plus", colors))
                btnChildren.put(createButton("=", "press_equal", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • CALC", accentColor))
            }
            "productivity_camera" -> {
                children.put(createHeader("CAMERA SHORTCUT", "camera", accentColor, subtextColor))
                children.put(createText("Camera Ready", 16.0, textColor, margin = 6.0))
                children.put(createButton("OPEN CAMERA", "open_camera", colors))
                children.put(createFooter(footerText ?: "NOS • CAMERA", accentColor))
            }
            "productivity_music" -> {
                children.put(createHeader("MUSIC PLAYER", "music", accentColor, subtextColor))
                children.put(createText("Nothing (Spec)", 15.0, textColor, margin = 6.0))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 8.0)
                        put("gap", 8.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("⏮", "prev_song", colors))
                btnChildren.put(createButton("▶", "play_song", colors))
                btnChildren.put(createButton("⏭", "next_song", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • MUSIC", accentColor))
            }
            "productivity_text_username" -> {
                children.put(createHeader("STUDIO ACCOUNT", "type", accentColor, subtextColor))
                val user = state["githubUsername"] as? String ?: "octocat"
                children.put(createText("@$user", 18.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP WIDGET TO EDIT", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • DEV", accentColor))
            }
            "productivity_google_search" -> {
                children.put(createHeader("GOOGLE SEARCH", "type", accentColor, subtextColor))
                children.put(createText("Search...", 16.0, subtextColor, margin = 6.0))
                children.put(createButton("SEARCH", "trigger_search", colors))
                children.put(createFooter(footerText ?: "NOS • SEARCH", accentColor))
            }
            "productivity_pomodoro" -> {
                children.put(createHeader("POMODORO", "timer", accentColor, subtextColor))
                children.put(createText("25:00", 22.0, textColor, margin = 6.0))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 6.0)
                        put("gap", 8.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("START", "start_pomo", colors))
                btnChildren.put(createButton("RESET", "reset_pomo", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • POMO", accentColor))
            }
            "productivity_folder" -> {
                children.put(createHeader("APPS FOLDER", "home", accentColor, subtextColor))
                children.put(createText("Folder Open", 16.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO OPEN", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • APPS", accentColor))
            }
            "productivity_photo_frame" -> {
                children.put(createHeader("PHOTO FRAME", "camera", accentColor, subtextColor))
                children.put(createText("No Image", 16.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "TAP TO SELECT", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • GALLERY", accentColor))
            }

            // ==========================================
            // SOCIAL
            // ==========================================
            "social_feed" -> {
                children.put(createHeader("SOCIAL FEED", "messagesquare", accentColor, subtextColor))
                children.put(createText("Alice: Hello!", 15.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "2 NEW NOTIFICATIONS", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • SOCIAL", accentColor))
            }
            "social_contact" -> {
                children.put(createHeader("FAV CONTACT", "messagesquare", accentColor, subtextColor))
                children.put(createText("Bob", 18.0, textColor, margin = 6.0))
                children.put(createButton("MESSAGE", "message_bob", colors))
                children.put(createFooter(footerText ?: "NOS • SOCIAL", accentColor))
            }
            "social_shortcuts" -> {
                children.put(createHeader("DIRECT CHATS", "messagesquare", accentColor, subtextColor))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 10.0)
                        put("gap", 8.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("WA", "chat_wa", colors))
                btnChildren.put(createButton("TG", "chat_tg", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • SOCIAL", accentColor))
            }

            // ==========================================
            // SMART HOME
            // ==========================================
            "smart_home_controls" -> {
                children.put(createHeader("SMART ROOM", "home", accentColor, subtextColor))
                children.put(createText("3 Devices On", 16.0, textColor, margin = 6.0))
                val btnContainer = JSONObject().apply {
                    put("type", "view")
                    put("style", JSONObject().apply {
                        put("flexDirection", "row")
                        put("marginTop", 6.0)
                        put("gap", 8.0)
                    })
                }
                val btnChildren = JSONArray()
                btnChildren.put(createButton("LIGHTS", "toggle_lights", colors))
                btnChildren.put(createButton("AC", "toggle_ac", colors))
                btnContainer.put("children", btnChildren)
                children.put(btnContainer)
                children.put(createFooter(footerText ?: "NOS • HOME", accentColor))
            }
            "smart_home_torch" -> {
                children.put(createHeader("TORCH", "home", accentColor, subtextColor))
                val torchOn = state["torchEnabled"] as? Boolean ?: false
                children.put(createText(if (torchOn) "ON" else "OFF", 20.0, textColor, margin = 6.0))
                children.put(createButton("TOGGLE", "toggle_torch", colors))
                children.put(createFooter(footerText ?: "NOS • HOME", accentColor))
            }
            "smart_home_bluetooth" -> {
                children.put(createHeader("BLUETOOTH", "home", accentColor, subtextColor))
                children.put(createText("EAR (2) CONNECTED", 15.0, textColor, margin = 6.0))
                children.put(createText(subValueText ?: "BATTERY: 90%", 8.0, subtextColor))
                children.put(createFooter(footerText ?: "NOS • HOME", accentColor))
            }
            "smart_home_sound_control" -> {
                children.put(createHeader("SOUND CONTROL", "home", accentColor, subtextColor))
                val profile = state["soundProfile"] as? String ?: "vibrate"
                children.put(createText(profile.uppercase(Locale.getDefault()), 20.0, textColor, margin = 6.0))
                children.put(createButton("CYCLE", "cycle_sound", colors))
                children.put(createFooter(footerText ?: "NOS • HOME", accentColor))
            }

            else -> {
                val title = titleText ?: "NOS WIDGET"
                children.put(createHeader(title, "sparkles", accentColor, subtextColor))
                children.put(createText(valueText ?: "--", 22.0, textColor, margin = 6.0))
                if (!subValueText.isNullOrBlank()) {
                    children.put(createText(subValueText, 8.0, subtextColor))
                }
                children.put(createFooter(footerText ?: "NOS • STUDIO", accentColor))
            }
        }

        root.put("children", children)
        return root
    }

    private fun createHeader(title: String, iconName: String, accentColor: String, subtextColor: String): JSONObject {
        val node = JSONObject()
        node.put("type", "view")
        
        val style = JSONObject()
        style.put("flexDirection", "row")
        style.put("justifyContent", "flex-start")
        style.put("alignItems", "center")
        style.put("width", "100%")
        style.put("gap", 4.0)
        node.put("style", style)

        val children = JSONArray()
        
        val img = JSONObject()
        img.put("type", "image")
        img.put("imageName", iconName)
        val imgStyle = JSONObject()
        imgStyle.put("width", 10.0)
        imgStyle.put("height", 10.0)
        imgStyle.put("color", accentColor)
        img.put("style", imgStyle)
        children.put(img)

        val txt = JSONObject()
        txt.put("type", "text")
        txt.put("text", title.uppercase(Locale.getDefault()))
        val txtStyle = JSONObject()
        txtStyle.put("fontSize", 8.0)
        txtStyle.put("color", subtextColor)
        txtStyle.put("fontWeight", "bold")
        txtStyle.put("letterSpacing", 0.12)
        txt.put("style", txtStyle)
        children.put(txt)

        node.put("children", children)
        return node
    }

    private fun createFooter(text: String, accentColor: String): JSONObject {
        val node = JSONObject()
        node.put("type", "text")
        node.put("text", text.uppercase(Locale.getDefault()))
        
        val style = JSONObject()
        style.put("fontSize", 7.5)
        style.put("color", accentColor)
        style.put("fontWeight", "bold")
        style.put("letterSpacing", 0.15)
        style.put("marginTop", 6.0)
        node.put("style", style)
        
        return node
    }

    private fun createClock(format: String, fontSize: Double, color: String, margin: Double = 0.0): JSONObject {
        val node = JSONObject()
        node.put("type", "clock")
        node.put("clockFormat", format)
        val style = JSONObject()
        style.put("fontSize", fontSize)
        style.put("color", color)
        style.put("fontWeight", "bold")
        if (margin > 0.0) {
            style.put("marginTop", margin)
        }
        node.put("style", style)
        return node
    }

    private fun createText(text: String, fontSize: Double, color: String, margin: Double = 0.0): JSONObject {
        val node = JSONObject()
        node.put("type", "text")
        node.put("text", text)
        val style = JSONObject()
        style.put("fontSize", fontSize)
        style.put("color", color)
        style.put("fontWeight", "bold")
        if (margin > 0.0) {
            style.put("marginTop", margin)
        }
        node.put("style", style)
        return node
    }

    private fun createProgress(value: Int, max: Int, color: String): JSONObject {
        val node = JSONObject()
        node.put("type", "progress")
        node.put("progressValue", value)
        
        val progressObj = JSONObject()
        progressObj.put("value", value)
        progressObj.put("max", max)
        node.put("progress", progressObj)

        val style = JSONObject()
        style.put("width", 60.0)
        style.put("height", 6.0)
        style.put("marginTop", 6.0)
        style.put("color", color)
        node.put("style", style)
        return node
    }

    private fun createButton(label: String, action: String, colors: Map<String, String>): JSONObject {
        val node = JSONObject()
        node.put("type", "button")
        node.put("text", label)
        node.put("action", action)
        
        val style = JSONObject()
        style.put("paddingLeft", 10.0)
        style.put("paddingRight", 10.0)
        style.put("paddingTop", 4.0)
        style.put("paddingBottom", 4.0)
        style.put("backgroundColor", colors["btnBg"] ?: "#ff222226")
        style.put("borderRadius", 12.0)
        style.put("fontSize", 10.0)
        style.put("color", colors["text"] ?: "#ffffffff")
        node.put("style", style)
        return node
    }

    private fun getThemeColors(theme: String): Map<String, String> {
        return when (theme) {
            "nos" -> mapOf(
                "bg" to "#ff000000",
                "text" to "#ffffffff",
                "subtext" to "#ff888888",
                "accent" to "#ffff0000",
                "btnBg" to "#ff1c1c1e"
            )
            "minimal" -> mapOf(
                "bg" to "#fff5f5f5",
                "text" to "#ff111111",
                "subtext" to "#ff666666",
                "accent" to "#ff333333",
                "btnBg" to "#ffe0e0e0"
            )
            "warm" -> mapOf(
                "bg" to "#ff1a1209",
                "text" to "#ffffffff",
                "subtext" to "#ffa38b70",
                "accent" to "#ffe8824b",
                "btnBg" to "#ff2b1f12"
            )
            "luxury", "obsidian" -> mapOf(
                "bg" to "#ff1c1a17",
                "text" to "#ffffffff",
                "subtext" to "#ffa8a090",
                "accent" to "#ffdfba6b",
                "btnBg" to "#ff2d2a25"
            )
            "cyberpunk" -> mapOf(
                "bg" to "#ff0d0f1a",
                "text" to "#ffffffff",
                "subtext" to "#ff00ffff",
                "accent" to "#ffff003c",
                "btnBg" to "#ff211d33"
            )
            "amoled" -> mapOf(
                "bg" to "#ff000000",
                "text" to "#ffffffff",
                "subtext" to "#ff888888",
                "accent" to "#ff39ff14",
                "btnBg" to "#ff1c1c1e"
            )
            "glassmorphism" -> mapOf(
                "bg" to "#991e2530",
                "text" to "#ffffffff",
                "subtext" to "#b3ffffff",
                "accent" to "#ff00ffff",
                "btnBg" to "#4dffffff"
            )
            "liquidglass" -> mapOf(
                "bg" to "#990b1e24",
                "text" to "#ffffffff",
                "subtext" to "#b3ffffff",
                "accent" to "#ff00f0ff",
                "btnBg" to "#4dffffff"
            )
            else -> mapOf(
                "bg" to "#ff000000",
                "text" to "#ffffffff",
                "subtext" to "#ff888888",
                "accent" to "#ffff0000",
                "btnBg" to "#ff1c1c1e"
            )
        }
    }
}
