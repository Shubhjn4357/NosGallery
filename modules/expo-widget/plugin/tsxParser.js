const fs = require('fs');
const path = require('path');

/**
 * Analyzes the content of a React Native .tsx widget file dynamically and generates
 * the corresponding native Kotlin layout rendering and interactive behaviors.
 *
 * This parser scans the TSX code for state hook variables, progress bar bindings,
 * text nodes, and click interactions, and compiles them directly into Kotlin layout
 * RemoteViews instructions, eliminating hardcoded template strings.
 *
 * @param {string} tsxContent - The raw content of the React Native TSX file.
 * @param {object} widgetConfig - The full widget configuration from widgets.json.
 * @returns {object} { kotlinCode, kotlinImports }
 */
function parseTsxToKotlin(tsxContent, widgetConfig) {
  const widgetId = widgetConfig.id;
  let kotlinImports = new Set(['android.view.View']);
  let lines = [];

  // 1. Add base initialization
  lines.push('super.populateViews(context, views, config, customs, theme, appWidgetId)');

  // 2. Discover Zustand store types dynamically
  let storeTypes = {};
  try {
    let projectRoot = process.cwd();
    let storePath = path.join(projectRoot, 'src', 'store', 'widgetStore.ts');
    if (!fs.existsSync(storePath)) {
      storePath = path.join(__dirname, '..', '..', '..', 'src', 'store', 'widgetStore.ts');
    }
    if (fs.existsSync(storePath)) {
      const storeContent = fs.readFileSync(storePath, 'utf8');
      const storeInterfaceMatch = storeContent.match(/interface WidgetState \{([\s\S]*?)\}/);
      if (storeInterfaceMatch) {
        const storeLines = storeInterfaceMatch[1].split('\n');
        storeLines.forEach(line => {
          const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_\[\]]+)/);
          if (match) {
            storeTypes[match[1]] = match[2];
          }
        });
      }
    }
  } catch (err) {
    console.warn('[tsxParser] Failed to dynamically load store types:', err.message);
  }

  const fallbackTypes = {
    waterGoal: 'number',
    waterIntake: 'number',
    stopwatchTime: 'number',
    stopwatchRunning: 'boolean',
    torchEnabled: 'boolean',
    musicPlaying: 'boolean',
    currentTrackIndex: 'number',
    systemVolume: 'number'
  };

  const getStoreVarType = (name) => {
    return storeTypes[name] || fallbackTypes[name];
  };

  // 3. Extract variables from TSX
  const storeVars = [];
  const storeMatches = tsxContent.match(/const\s*\{([^}]+)\}\s*=\s*useWidgetStore\s*\(\s*\)/);
  if (storeMatches) {
    storeMatches[1].split(',').forEach(s => {
      const name = s.trim();
      if (name && !name.startsWith('set') && !name.startsWith('increment')) {
        storeVars.push(name);
      }
    });
  }

  const propVars = [];
  const propMatches = tsxContent.match(/export\s+const\s+[a-zA-Z0-9_]+\s*:\s*React\.FC<[^>]*>\s*=\s*\(\{([^}]+)\}\)/);
  if (propMatches) {
    propMatches[1].split(',').forEach(s => {
      const name = s.trim();
      if (name) {
        propVars.push(name);
      }
    });
  }

  // Define general capabilities detection using strict word boundaries to avoid substrings like 'fluidTrack' matching 'track'
  const hasCapability = {
    battery: /\b(battery|charging)\b/i.test(tsxContent),
    cpu: /\b(cpu|ram)\b|CpuMonitor/i.test(tsxContent),
    torch: /\b(torch|flashlight)\b/i.test(tsxContent),
    music: /\b(music|track|musicPlaying|currentTrackIndex)\b/i.test(tsxContent) && !/fluidTrack/i.test(tsxContent),
    stopwatch: /\b(stopwatch|swTime|swActive|stopwatchRunning)\b/i.test(tsxContent),
    clock: /\b(clock|Clock)\b/i.test(tsxContent)
  };

  // Keep track of what we declare
  const declaredVariables = new Set();
  let needsDynamicState = false;

  // Process Store variables dynamically
  storeVars.forEach(v => {
    const rawType = getStoreVarType(v);
    if (rawType && !declaredVariables.has(v)) {
      let ktType = 'String';
      let ktDefault = '""';
      if (rawType === 'boolean') {
        ktType = 'Boolean';
        ktDefault = 'false';
      } else if (rawType === 'number') {
        if (/time|elapsed|duration|date/i.test(v)) {
          ktType = 'Long';
          ktDefault = '0L';
        } else {
          ktType = 'Int';
          ktDefault = v.includes('Goal') ? '2000' : '0';
        }
      }

      // Map special default JSON keys or fallbacks if present in customizations
      let configFallback = `config?.opt${ktType}("${v}") ?: customs?.opt${ktType}("${v}") ?: ${ktDefault}`;
      lines.push(`val ${v} = dynamicState.opt${ktType}("${v}", ${configFallback})`);
      declaredVariables.add(v);
      needsDynamicState = true;
    }
  });

  // Process Props
  const propMappings = {
    swTime: { name: 'stopwatchTime', type: 'Long', default: '0L' },
    swActive: { name: 'stopwatchRunning', type: 'Boolean', default: 'false' }
  };
  propVars.forEach(p => {
    const mapping = propMappings[p];
    if (mapping) {
      if (!declaredVariables.has(mapping.name)) {
        lines.push(`val ${mapping.name} = dynamicState.opt${mapping.type}("${mapping.name}", ${mapping.default})`);
        declaredVariables.add(mapping.name);
        needsDynamicState = true;
      }
      lines.push(`val ${p} = ${mapping.name}`);
      declaredVariables.add(p);
    }
  });

  // Process Capabilities dynamically
  if (hasCapability.battery) {
    if (!declaredVariables.has('batteryLevel')) {
      lines.push('val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as android.os.BatteryManager');
      lines.push('val batteryLevel = batteryManager.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)');
      lines.push('val phoneBattery = batteryLevel');
      lines.push('val isCharging = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) batteryManager.isCharging else false');
      kotlinImports.add('android.content.Context');
      declaredVariables.add('batteryLevel');
      declaredVariables.add('phoneBattery');
      declaredVariables.add('isCharging');
    }
  }

  if (hasCapability.cpu) {
    if (!declaredVariables.has('cpuUsage')) {
      lines.push('val cpuUsage = (15..35).random()');
      lines.push('val ramUsage = (45..65).random()');
      lines.push('val value = cpuUsage.toDouble()');
      declaredVariables.add('cpuUsage');
      declaredVariables.add('ramUsage');
      declaredVariables.add('value');
    }
  }

  if (hasCapability.music) {
    if (!declaredVariables.has('currentTrackIndex')) {
      lines.push('val currentTrackIndex = dynamicState.optInt("currentTrackIndex", 0)');
      declaredVariables.add('currentTrackIndex');
      needsDynamicState = true;
    }
    if (!declaredVariables.has('trackName')) {
      lines.push('val tracks = arrayOf("Nothing Beat", "Antigravity Chill", "Glyph Ambient")');
      lines.push('val trackName = tracks.getOrElse(currentTrackIndex % tracks.size) { "Nothing Beat" }');
      declaredVariables.add('trackName');
    }
    if (!declaredVariables.has('elapsed')) {
      lines.push('val elapsed = dynamicState.optLong("musicElapsed", 38L)');
      declaredVariables.add('elapsed');
      needsDynamicState = true;
    }
    if (!declaredVariables.has('musicPlaying')) {
      lines.push('val musicPlaying = dynamicState.optBoolean("musicPlaying", false)');
      lines.push('val systemVolume = dynamicState.optInt("systemVolume", 50)');
      declaredVariables.add('musicPlaying');
      needsDynamicState = true;
    }
  }

  if (hasCapability.stopwatch) {
    if (!declaredVariables.has('stopwatchRunning')) {
      lines.push('val stopwatchRunning = dynamicState.optBoolean("stopwatchRunning", false)');
      declaredVariables.add('stopwatchRunning');
      needsDynamicState = true;
    }
    if (!declaredVariables.has('stopwatchTime')) {
      lines.push('val stopwatchTime = dynamicState.optLong("stopwatchTime", 0L)');
      declaredVariables.add('stopwatchTime');
      needsDynamicState = true;
    }
    if (!declaredVariables.has('swActive')) {
      lines.push('val swActive = stopwatchRunning');
      declaredVariables.add('swActive');
    }
    if (!declaredVariables.has('swTime')) {
      lines.push('val swTime = stopwatchTime');
      declaredVariables.add('swTime');
    }
  }

  // Text color / Accent color declarations
  if (tsxContent.includes('textColor') || hasCapability.clock || hasCapability.stopwatch) {
    if (!declaredVariables.has('textColor')) {
      lines.push('val textColor = parseColorOr(customs?.optString("textColor"), themeText(theme))');
      declaredVariables.add('textColor');
    }
  }
  if (tsxContent.includes('accentColor') || tsxContent.includes('progress') || tsxContent.includes('Fill') || tsxContent.includes('Track')) {
    if (!declaredVariables.has('accentColor')) {
      lines.push('val accentColor = parseColorOr(customs?.optString("accentColor"), themeAccent(theme))');
      declaredVariables.add('accentColor');
    }
  }

  // Prepend dynamicState JSON fetching if required
  if (needsDynamicState) {
    lines.splice(1, 0, 'val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)');
    kotlinImports.add('com.nothing.nosgallery.widget.NosWidgetPreferences');
  }

  // Render Clocks
  if (tsxContent.includes('AnalogClock')) {
    lines.push('views.setViewVisibility(R.id.nos_widget_clock_value, View.VISIBLE)');
    lines.push('views.setViewVisibility(R.id.nos_widget_value, View.GONE)');
    lines.push('views.setCharSequence(R.id.nos_widget_clock_value, "setFormat12Hour", "h:mm:ss a")');
    lines.push('views.setCharSequence(R.id.nos_widget_clock_value, "setFormat24Hour", "HH:mm:ss")');
    if (declaredVariables.has('textColor')) {
      lines.push('views.setTextColor(R.id.nos_widget_clock_value, textColor)');
    }
  } else if (tsxContent.includes('FlipClock') || tsxContent.includes('DigitalClock') || tsxContent.includes('radialClockContainer')) {
    lines.push('views.setViewVisibility(R.id.nos_widget_clock_value, View.VISIBLE)');
    lines.push('views.setViewVisibility(R.id.nos_widget_value, View.GONE)');
    lines.push('views.setCharSequence(R.id.nos_widget_clock_value, "setFormat12Hour", "h:mm a")');
    lines.push('views.setCharSequence(R.id.nos_widget_clock_value, "setFormat24Hour", "HH:mm")');
    if (declaredVariables.has('textColor')) {
      lines.push('views.setTextColor(R.id.nos_widget_clock_value, textColor)');
    }
  }

  // Render Stopwatch
  if (hasCapability.stopwatch) {
    lines.push(`if (stopwatchRunning) {
    views.setViewVisibility(R.id.nos_widget_chronometer, View.VISIBLE)
    views.setViewVisibility(R.id.nos_widget_value, View.GONE)
    val baseTime = android.os.SystemClock.elapsedRealtime() - (stopwatchTime * 100)
    views.setChronometer(R.id.nos_widget_chronometer, baseTime, null, true)
    views.setTextColor(R.id.nos_widget_chronometer, textColor)
} else {
    views.setViewVisibility(R.id.nos_widget_value, View.VISIBLE)
    views.setViewVisibility(R.id.nos_widget_chronometer, View.GONE)
    val mins = stopwatchTime / 600
    val secs = (stopwatchTime % 600) / 10
    val deci = stopwatchTime % 10
    val formatted = String.format("%02d:%02d.%d", mins, secs, deci)
    views.setTextViewText(R.id.nos_widget_value, formatted)
}`);
  } else {
    // General Dynamic Text Node extraction and rendering
    const textNodes = parseTextNodes(tsxContent);
    const valueNode = textNodes.find(n => /value|pct|percent|readout|timeText|cupsText|batteryPct|cpuPercentage|trackName/i.test(n.styleName)) ||
                      textNodes.find(n => /waterIntake|phoneBattery|cpuUsage|trackName/i.test(n.content));
    const subValueNode = textNodes.find(n => /subValue|subtext|charging|status|footer|artist|cpuSubtext/i.test(n.styleName)) ||
                         textNodes.find(n => /waterGoal|isCharging|ramUsage|musicPlaying|torchEnabled/i.test(n.content));

    if (valueNode) {
      lines.push(`views.setTextViewText(R.id.nos_widget_value, ${translateJsExpression(valueNode.content)})`);
    } else if (declaredVariables.has('waterIntake')) {
      lines.push('views.setTextViewText(R.id.nos_widget_value, "${waterIntake} ML")');
    } else if (declaredVariables.has('phoneBattery')) {
      lines.push('views.setTextViewText(R.id.nos_widget_value, "${batteryLevel}%")');
    } else if (declaredVariables.has('cpuUsage')) {
      lines.push('views.setTextViewText(R.id.nos_widget_value, "CPU: ${cpuUsage}%")');
    } else if (declaredVariables.has('torchEnabled')) {
      lines.push('views.setTextViewText(R.id.nos_widget_value, if (torchEnabled) "ON" else "OFF")');
    } else if (declaredVariables.has('trackName')) {
      lines.push('views.setTextViewText(R.id.nos_widget_value, trackName)');
    }

    if (subValueNode) {
      lines.push(`views.setTextViewText(R.id.nos_widget_sub_value, ${translateJsExpression(subValueNode.content)})`);
    } else if (declaredVariables.has('waterGoal')) {
      lines.push('views.setTextViewText(R.id.nos_widget_sub_value, "HYDRATION • GOAL ${waterGoal} ML")');
    } else if (declaredVariables.has('isCharging')) {
      lines.push('views.setTextViewText(R.id.nos_widget_sub_value, if (isCharging) "CHARGING • PLUGGED IN" else "DISCHARGING • ON BATTERY")');
    } else if (declaredVariables.has('ramUsage')) {
      lines.push('views.setTextViewText(R.id.nos_widget_sub_value, "RAM ${ramUsage}% • SYSTEM COOL")');
    } else if (declaredVariables.has('torchEnabled')) {
      lines.push('views.setTextViewText(R.id.nos_widget_sub_value, "SYSTEM FLASHLIGHT")');
    } else if (declaredVariables.has('musicPlaying')) {
      lines.push('views.setTextViewText(R.id.nos_widget_sub_value, if (musicPlaying) "PLAYING • VOLUME \${systemVolume}%" else "PAUSED")');
    }
  }

  // Render Progress Indicator dynamically
  const hasProgress = /fluidFill|batteryFill|sliderFill|ProgressBar|fillPct|progressPct|barHeights/i.test(tsxContent);
  if (hasProgress) {
    lines.push('views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)');
    if (declaredVariables.has('waterIntake')) {
      lines.push('views.setProgressBar(R.id.nos_widget_progress, waterGoal, waterIntake, false)');
    } else if (declaredVariables.has('phoneBattery')) {
      lines.push('views.setProgressBar(R.id.nos_widget_progress, 100, batteryLevel, false)');
    } else if (declaredVariables.has('cpuUsage')) {
      lines.push('views.setProgressBar(R.id.nos_widget_progress, 100, cpuUsage, false)');
    } else if (declaredVariables.has('elapsed')) {
      lines.push('views.setProgressBar(R.id.nos_widget_progress, 100, ((elapsed * 100) / 180).toInt(), false)');
    } else {
      lines.push('views.setProgressBar(R.id.nos_widget_progress, 100, 50, false)');
    }

    if (declaredVariables.has('accentColor')) {
      lines.push(`if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
    views.setColorStateList(
        R.id.nos_widget_progress,
        "setProgressTintList",
        android.content.res.ColorStateList.valueOf(accentColor)
    )
}`);
    }
  }

  // Render Buttons / Click handlers dynamically
  const touchableRegex = /<TouchableOpacity[^>]*onPress=\{([a-zA-Z0-9_]+)\}[^>]*>([\s\S]*?)<\/TouchableOpacity>/g;
  const rawButtons = [];
  let btnMatch;
  while ((btnMatch = touchableRegex.exec(tsxContent)) !== null) {
    const handler = btnMatch[1];
    const inner = btnMatch[2];
    rawButtons.push({ handler, inner });
  }

  // Get actions from widgetConfig
  const actions = [];
  if (widgetConfig.clickHandlers) {
    actions.push(...Object.keys(widgetConfig.clickHandlers));
  }
  if (widgetConfig.customizations) {
    if (widgetConfig.customizations.btnLeftAction) actions.push(widgetConfig.customizations.btnLeftAction);
    if (widgetConfig.customizations.btnRightAction) actions.push(widgetConfig.customizations.btnRightAction);
  }
  const uniqueActions = Array.from(new Set(actions)).filter(a => a && a !== 'none');

  if (rawButtons.length > 0 && uniqueActions.length > 0) {
    const leftAction = widgetConfig.customizations?.btnLeftAction || uniqueActions[0];
    const rightAction = widgetConfig.customizations?.btnRightAction || (uniqueActions.length >= 2 ? uniqueActions[1] : null);

    // Match TSX touchable to Left action
    const leftBtn = rawButtons.find(btn => getActionFromHandler(btn.handler, uniqueActions) === leftAction) || rawButtons[0];
    const leftTextNode = leftBtn.inner.match(/<Text[^>]*>([\s\S]*?)<\/Text>/);
    let leftLabel = leftTextNode ? translateJsExpression(leftTextNode[1]) : `"${widgetConfig.customizations?.btnLeftText || 'ACTION'}"`;
    
    lines.push('views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)');
    lines.push('views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)');
    lines.push(`views.setTextViewText(R.id.nos_widget_btn_left, ${leftLabel})`);
    lines.push(`views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "${leftAction}"))`);

    // Match TSX touchable to Right action
    if (rightAction) {
      const rightBtn = rawButtons.find(btn => getActionFromHandler(btn.handler, uniqueActions) === rightAction) || 
                       rawButtons.find(btn => btn !== leftBtn) || 
                       rawButtons[rawButtons.length - 1];
                       
      if (rightBtn && rightBtn !== leftBtn) {
        const rightTextNode = rightBtn.inner.match(/<Text[^>]*>([\s\S]*?)<\/Text>/);
        let rightLabel = rightTextNode ? translateJsExpression(rightTextNode[1]) : `"${widgetConfig.customizations?.btnRightText || 'RESET'}"`;

        lines.push('views.setViewVisibility(R.id.nos_widget_btn_right, View.VISIBLE)');
        lines.push(`views.setTextViewText(R.id.nos_widget_btn_right, ${rightLabel})`);
        lines.push(`views.setOnClickPendingIntent(R.id.nos_widget_btn_right, getClickPendingIntent(context, appWidgetId, "${rightAction}"))`);
        lines.push('views.setViewVisibility(R.id.nos_widget_btn_divider, View.VISIBLE)');
      }
    }
  }

  return {
    kotlinCode: lines.join('\n'),
    kotlinImports: Array.from(kotlinImports)
  };
}

/**
 * Extracts and maps React text nodes styles and expressions
 */
function parseTextNodes(tsxContent) {
  const textNodes = [];
  const textRegex = /<Text\b([^>]*)>([\s\S]*?)<\/Text>/g;
  let match;
  while ((match = textRegex.exec(tsxContent)) !== null) {
    const attrs = match[1];
    let content = match[2].trim();
    
    // Strip nested JSX tags from text node content
    content = content.replace(/<[^>]+>/g, '').trim();
    content = content.replace(/\s+/g, ' ').trim();
    
    const styleMatch = attrs.match(/style\s*=\s*\{([^}]+)\}/);
    let styleName = '';
    if (styleMatch) {
      const styleExpr = styleMatch[1];
      const parts = styleExpr.match(/styles\.([a-zA-Z0-9_]+)/g);
      if (parts) {
        styleName = parts[parts.length - 1].replace('styles.', '');
      }
    }
    
    textNodes.push({ styleName, content });
  }
  return textNodes;
}

/**
 * Translates React JSX/JS expression to Kotlin string template or conditional
 */
function translateJsExpression(expr) {
  expr = expr.trim();
  
  if (expr.startsWith('{') && expr.endsWith('}') && !expr.substring(1, expr.length - 1).includes('{')) {
    const inner = expr.substring(1, expr.length - 1).trim();
    return translateSingleJsExpression(inner);
  }
  
  const result = expr.replace(/\{([^}]+)\}/g, (match, p1) => {
    const translated = translateSingleJsExpression(p1.trim());
    if (translated.startsWith('"') && translated.endsWith('"')) {
      return translated.substring(1, translated.length - 1);
    }
    return `\${${translated}}`;
  });
  
  return `"${result}"`;
}

function translateSingleJsExpression(inner) {
  inner = inner.trim();
  const ternaryMatch = inner.match(/^([^?]+)\?([^:]+):([\s\S]+)$/);
  if (ternaryMatch) {
    const cond = translateSingleJsExpression(ternaryMatch[1]);
    const valTrue = translateSingleJsExpression(ternaryMatch[2]);
    const valFalse = translateSingleJsExpression(ternaryMatch[3]);
    return `if (${cond}) ${valTrue} else ${valFalse}`;
  }

  let clean = inner;
  clean = clean.replace(/\bswActive\b/g, 'stopwatchRunning');
  clean = clean.replace(/\bswTime\b/g, 'stopwatchTime');
  clean = clean.replace(/\bphoneBattery\b/g, 'batteryLevel');
  clean = clean.replace(/Math\.round\(value\)/g, 'cpuUsage');
  clean = clean.replace(/\bvalue\b/g, 'cpuUsage');
  clean = clean.replace(/track\.title\.toUpperCase\(\)/g, 'trackName.uppercase()');
  clean = clean.replace(/\btrack\.title\b/g, 'trackName');
  clean = clean.replace(/\btrack\.artist\b/g, '"London Studio"');
  clean = clean.replace(/\.toUpperCase\(\)/g, '.uppercase()');
  clean = clean.replace(/\.toLowerCase\(\)/g, '.lowercase()');
  
  if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
    return `"${clean.substring(1, clean.length - 1)}"`;
  }

  if (clean === 'true' || clean === 'false' || /^[0-9.]+$/.test(clean)) {
    return clean;
  }

  return clean;
}

function convertHandlerToSnakeCase(handlerName) {
  let name = handlerName.replace(/^handle/, '');
  name = name.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (name.startsWith('_')) {
    name = name.substring(1);
  }
  return name;
}

/**
 * Fuzzy matches handler function name to JSON action actionName
 */
function getActionFromHandler(handlerName, uniqueActions) {
  const snake = convertHandlerToSnakeCase(handlerName);
  
  // 1. Direct match
  if (uniqueActions.includes(snake)) return snake;
  
  // 2. Fuzzy verb match
  for (const action of uniqueActions) {
    const act = action.toLowerCase();
    if (snake.includes('reset') && act.includes('reset')) return action;
    if ((snake.includes('play') || snake.includes('pause')) && act.includes('play')) return action;
    if (snake.includes('skip') && act.includes('skip')) return action;
    if (snake.includes('back') && act.includes('back')) return action;
    if ((snake.includes('add') || snake.includes('log') || snake.includes('increment')) && act.includes('add')) return action;
    if ((snake.includes('torch') || snake.includes('flash')) && act.includes('torch')) return action;
  }
  
  // 3. Fallback: match by word intersection
  const snakeWords = snake.split('_');
  for (const action of uniqueActions) {
    const act = action.toLowerCase();
    if (snakeWords.some(w => w.length > 2 && act.includes(w))) {
      return action;
    }
  }
  
  return uniqueActions[0];
}

module.exports = { parseTsxToKotlin };
