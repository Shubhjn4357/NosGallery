const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function parseTsxToKotlin(tsxContent, widgetConfig) {
  let ast;
  try {
    ast = babel.parse(tsxContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error('[tsxParser] AST Parse Error for ' + widgetConfig.id, err.message);
    return { kotlinCode: '', kotlinImports: [], xmlContent: '' };
  }

  // 1. Extract static styles
  const styles = {};
  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.object.name === 'StyleSheet' &&
        path.node.callee.property.name === 'create'
      ) {
        const arg = path.node.arguments[0];
        if (arg && arg.type === 'ObjectExpression') {
          arg.properties.forEach(prop => {
            if (prop.key && prop.key.name && prop.value && prop.value.type === 'ObjectExpression') {
              const styleName = prop.key.name;
              styles[styleName] = {};
              prop.value.properties.forEach(p => {
                if (p.key && p.key.name && p.value) {
                  let val = null;
                  if (p.value.type === 'StringLiteral' || p.value.type === 'NumericLiteral') {
                    val = p.value.value;
                  } else if (p.value.type === 'Identifier') {
                    val = p.value.name; // maybe a variable
                  }
                  if (val !== null) styles[styleName][p.key.name] = val;
                }
              });
            }
          });
        }
      }
    }
  });

  // 2. Extract state bindings
  const storeVars = new Set();
  traverse(ast, {
    VariableDeclarator(path) {
      if (
        path.node.init &&
        path.node.init.type === 'CallExpression' &&
        path.node.init.callee.name === 'useWidgetStore' &&
        path.node.id.type === 'ObjectPattern'
      ) {
        path.node.id.properties.forEach(p => {
          if (p.value && p.value.type === 'Identifier') {
            const name = p.value.name;
            if (!name.startsWith('set') && !name.startsWith('increment')) {
              storeVars.add(name);
            }
          }
        });
      }
    }
  });

  // 3. Extract local constants (literal string/numeric/boolean variables)
  const localConsts = {};
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.parent && path.parent.kind === 'const' && path.node.id.type === 'Identifier' && path.node.init) {
        const name = path.node.id.name;
        const init = path.node.init;
        if (init.type === 'StringLiteral' || init.type === 'NumericLiteral' || init.type === 'BooleanLiteral') {
          localConsts[name] = init.value;
        }
      }
    }
  });

  // 3b. Traverse AST to collect variables used in condition tests (to detect Boolean types)
  const booleanVars = new Set();
  function collectBooleanIdentifiers(node) {
    if (!node) return;
    if (node.type === 'Identifier') {
      booleanVars.add(node.name);
    } else if (node.type === 'UnaryExpression' && node.operator === '!') {
      collectBooleanIdentifiers(node.argument);
    } else if (node.type === 'LogicalExpression' && (node.operator === '&&' || node.operator === '||')) {
      collectBooleanIdentifiers(node.left);
      collectBooleanIdentifiers(node.right);
    } else if (node.type === 'ConditionalExpression') {
      collectBooleanIdentifiers(node.test);
    }
  }

  traverse(ast, {
    ConditionalExpression(path) {
      collectBooleanIdentifiers(path.node.test);
    },
    UnaryExpression(path) {
      if (path.node.operator === '!') {
        collectBooleanIdentifiers(path.node.argument);
      }
    },
    LogicalExpression(path) {
      if (path.node.operator === '&&' || path.node.operator === '||') {
        collectBooleanIdentifiers(path.node.left);
        collectBooleanIdentifiers(path.node.right);
      }
    },
    IfStatement(path) {
      collectBooleanIdentifiers(path.node.test);
    }
  });

  function translateToKotlinExpr(node) {
    if (!node) return '';
    
    switch (node.type) {
      case 'JSXEmptyExpression':
        return '""';
      case 'StringLiteral':
        return `"${node.value.replace(/\r?\n/g, '\\n').replace(/"/g, '\\"')}"`;
      case 'NumericLiteral':
      case 'BooleanLiteral':
        return node.value.toString();
      case 'Identifier':
        if (localConsts[node.name] !== undefined) {
          const val = localConsts[node.name];
          return typeof val === 'string' ? `"${val}"` : val.toString();
        }
        return node.name;
      case 'TemplateLiteral': {
        const parts = [];
        node.quasis.forEach((q, i) => {
          parts.push(q.value.raw.replace(/\r?\n/g, '\\n'));
          if (i < node.expressions.length) {
            parts.push('${' + translateToKotlinExpr(node.expressions[i]) + '}');
          }
        });
        return `"${parts.join('')}"`;
      }
      case 'BinaryExpression':
        if (node.operator === '+') {
          return `${translateToKotlinExpr(node.left)} + ${translateToKotlinExpr(node.right)}`;
        }
        if (node.operator === '/') {
          return `(${translateToKotlinExpr(node.left)}).toDouble() / (${translateToKotlinExpr(node.right)})`;
        }
        return `${translateToKotlinExpr(node.left)} ${node.operator} ${translateToKotlinExpr(node.right)}`;
      case 'LogicalExpression':
        if (node.operator === '||') {
          const leftExpr = translateToKotlinExpr(node.left);
          const rightExpr = translateToKotlinExpr(node.right);
          const isLeftBoolean = node.left.type === 'BooleanLiteral' ||
                                (node.left.type === 'Identifier' && (
                                  node.left.name.toLowerCase().includes('running') || 
                                  node.left.name.toLowerCase().includes('is') || 
                                  node.left.name.toLowerCase().includes('active') || 
                                  node.left.name.toLowerCase().includes('enabled') || 
                                  node.left.name.toLowerCase().includes('playing') || 
                                  node.left.name.toLowerCase().includes('connected') || 
                                  node.left.name.toLowerCase().includes('lighton') || 
                                  node.left.name.toLowerCase().includes('editing')
                                ));
          if (!isLeftBoolean) {
            return `if (${leftExpr}.isNotEmpty()) ${leftExpr} else ${rightExpr}`;
          }
        }
        return `${translateToKotlinExpr(node.left)} ${node.operator} ${translateToKotlinExpr(node.right)}`;
      case 'ConditionalExpression':
        return `if (${translateToKotlinExpr(node.test)}) ${translateToKotlinExpr(node.consequent)} else ${translateToKotlinExpr(node.alternate)}`;
      case 'MemberExpression': {
        const obj = translateToKotlinExpr(node.object);
        if (obj === 'styles') return '""';
        
        const prop = node.property.name;
        if (obj === 'customizations') {
          return `(customs?.optString("${prop}") ?: "")`;
        }
        
        // Handle array/list .length mapping
        if (prop === 'length') {
          if (obj === 'IMAGES' || obj === 'SESSION_LABELS') {
            return `${obj}.size`;
          }
          if (obj === 'todoList') {
            return `${obj}.length()`;
          }
          return `${obj}.length()`; // safe fallback
        }
        
        // If it's a known JSONObject, use optString/optDouble/optInt
        const jsonObjects = ['ticker', 'moon', 'track', 'details', 'item', 'googleUser'];
        if (jsonObjects.includes(obj)) {
          if (prop === 'price' || prop === 'change' || prop === 'age') {
            return `${obj}.optDouble("${prop}", 0.0)`;
          }
          if (prop === 'volume' || prop === 'duration' || prop === 'position' || prop === 'waterIntake' || prop === 'waterGoal' || prop === 'steps' || prop === 'kcal' || prop === 'id') {
            return `${obj}.optInt("${prop}", 0)`;
          }
          return `${obj}.optString("${prop}", "")`;
        }
        
        // Computed array/member indexing like array[index]
        if (node.computed) {
          return `${obj}.getOrNull(${translateToKotlinExpr(node.property)}) ?: ""`;
        }
        
        return `${obj}.${prop}`;
      }
      case 'CallExpression': {
        if (node.callee.name === 'parseFloat') {
          return `(${translateToKotlinExpr(node.arguments[0])}).toDouble()`;
        }
        if (node.callee.name === 'parseInt') {
          return `(${translateToKotlinExpr(node.arguments[0])}).toInt()`;
        }

        // Handle Math calls
        if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'Math') {
          const method = node.callee.property.name;
          const args = node.arguments.map(translateToKotlinExpr).join(', ');
          if (method === 'floor') {
            return `java.lang.Math.floor(${args}.toDouble()).toInt()`;
          }
          if (method === 'round') {
            return `java.lang.Math.round(${args}.toDouble()).toInt()`;
          }
          if (method === 'min' || method === 'max') {
            // Check if arguments have spread element like Math.max(...SPARK_DATA)
            const hasSpread = node.arguments.some(arg => arg.type === 'SpreadElement');
            if (hasSpread) {
              const spreadArg = node.arguments.find(arg => arg.type === 'SpreadElement');
              const arrayExpr = translateToKotlinExpr(spreadArg.argument);
              if (method === 'max') {
                return `(${arrayExpr}.maxOrNull() ?: 0)`;
              } else {
                return `(${arrayExpr}.minOrNull() ?: 0)`;
              }
            }
            return `java.lang.Math.${method}(${args})`;
          }
          return `java.lang.Math.${method}(${args})`;
        }
        
        // Handle methods like toLocaleString
        if (node.callee.type === 'MemberExpression') {
          const method = node.callee.property.name;
          const obj = translateToKotlinExpr(node.callee.object);
          if (method === 'toLocaleString') {
            return `String.format(java.util.Locale.US, "%,.2f", ${obj})`;
          }
          if (method === 'toFixed') {
            const digits = node.arguments[0] ? translateToKotlinExpr(node.arguments[0]) : '0';
            return `String.format(java.util.Locale.US, "%.${digits}f", (${obj}.toString().toDoubleOrNull() ?: 0.0))`;
          }
          if (method === 'toUpperCase') {
            return `${obj}.uppercase()`;
          }
          if (method === 'toLowerCase') {
            return `${obj}.lowercase()`;
          }
          if (method === 'toString') {
            return `${obj}.toString()`;
          }
        }
        
        // Specific custom functions
        if (node.callee.name === 'formatStopwatchTime') {
          const arg = translateToKotlinExpr(node.arguments[0]);
          return `String.format("%02d:%02d.%d", ${arg} / 600, (${arg} % 600) / 10, ${arg} % 10)`;
        }
        if (node.callee.name === 'formatTime') {
          const arg = translateToKotlinExpr(node.arguments[0]);
          return `String.format("%d:%02d", (${arg}).toInt() / 60, (${arg}).toInt() % 60)`;
        }
        
        const calleeName = node.callee.name || translateToKotlinExpr(node.callee);
        const args = node.arguments.map(translateToKotlinExpr).join(', ');
        return `${calleeName}(${args})`;
      }
      case 'SpreadElement':
        return translateToKotlinExpr(node.argument);
      default:
        return '';
    }
  }

  // 3b. Extract local declarations (const/let variables in component body)
  const localDeclarations = [];
  const localDeclarationsMap = {};
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier' && path.node.init) {
        const name = path.node.id.name;
        const init = path.node.init;
        if (init.type === 'CallExpression') {
          const calleeName = init.callee.name;
          if (
            calleeName === 'useState' ||
            calleeName === 'useRef' ||
            calleeName === 'useEffect' ||
            calleeName === 'useWidgetStyle' ||
            calleeName === 'useWidgetStore'
          ) {
            return;
          }
        }
        if (localConsts[name] !== undefined) {
          return;
        }
        try {
          const ktExpr = translateToKotlinExpr(init);
          if (ktExpr) {
            localDeclarations.push({ name, expr: ktExpr });
            localDeclarationsMap[name] = ktExpr;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  });

  // 4. Find the main JSX Tree and convert to XML Layout
  let xmlRoot = null;
  let idCounter = 1;
  let kotlinLines = [];
  let kotlinImports = new Set(['android.view.View']);

  function getAndroidColor(rnColor) {
    if (!rnColor) return null;
    if (rnColor === 'transparent') return '#00000000';
    if (rnColor.startsWith('rgba')) {
      const match = rnColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (match) {
        let a = Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0');
        let r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        let g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        let b = parseInt(match[3], 10).toString(16).padStart(2, '0');
        return `#${a}${r}${g}${b}`.toUpperCase();
      }
    }
    if (rnColor.startsWith('rgb')) {
      const match = rnColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (match) {
        let r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        let g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        let b = parseInt(match[3], 10).toString(16).padStart(2, '0');
        return `#FF${r}${g}${b}`.toUpperCase();
      }
    }
    if (rnColor.startsWith('#')) {
      if (rnColor.length === 4) { // #abc -> #ffaabbcc
        return '#FF' + rnColor[1]+rnColor[1]+rnColor[2]+rnColor[2]+rnColor[3]+rnColor[3];
      }
      if (rnColor.length === 7) return '#FF' + rnColor.substring(1); // #rrggbb -> #ffrrggbb
      if (rnColor.length === 9) { // #rrggbbaa -> #aarrggbb
        return '#' + rnColor.substring(7, 9) + rnColor.substring(1, 7);
      }
      return rnColor;
    }
    return rnColor;
  }

  function resolveStyle(styleNode) {
    let merged = {};
    if (!styleNode) return merged;

    if (styleNode.type === 'ArrayExpression') {
      styleNode.elements.forEach(el => {
        Object.assign(merged, resolveStyle(el));
      });
    } else if (styleNode.type === 'MemberExpression') {
      if (styleNode.object.name === 'styles') {
        const sName = styleNode.property.name;
        if (styles[sName]) Object.assign(merged, styles[sName]);
      }
    } else if (styleNode.type === 'ObjectExpression') {
      styleNode.properties.forEach(p => {
        if (p.key && p.key.name && p.value) {
          if (p.value.type === 'StringLiteral' || p.value.type === 'NumericLiteral') {
            merged[p.key.name] = p.value.value;
          }
        }
      });
    } else if (styleNode.type === 'LogicalExpression' || styleNode.type === 'ConditionalExpression') {
       const right = styleNode.type === 'LogicalExpression' ? styleNode.right : styleNode.consequent;
       if (right && right.type === 'ObjectExpression') {
         Object.assign(merged, resolveStyle(right));
       }
    }
    return merged;
  }

  const referencedVars = new Set();
  
  function collectIdentifiers(node) {
    if (!node) return;
    if (node.type === 'Identifier') {
      referencedVars.add(node.name);
      return;
    }
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(collectIdentifiers);
        } else if (node[key].type) {
          if (node.type === 'MemberExpression' && key === 'property' && !node.computed) {
            continue;
          }
          collectIdentifiers(node[key]);
        }
      }
    }
  }

  function processJsxNode(node) {
    if (node.type === 'JSXText') {
      const text = node.value.replace(/\s+/g, ' ').trim();
      if (!text) return null;
      return { tag: 'TextView', attrs: { 'android:text': `"${text}"`, 'android:layout_width': 'wrap_content', 'android:layout_height': 'wrap_content' }, children: [], isDynamic: false };
    }
    if (node.type === 'JSXExpressionContainer') {
      const expr = node.expression;
      if (expr.type === 'CallExpression' && expr.callee.property && expr.callee.property.name === 'map') {
        return null; // Ignore array map
      }
      // If it's a logical expression like interactive && <JSXElement>
      if (expr.type === 'LogicalExpression' && expr.operator === '&&') {
        if (expr.right.type === 'JSXElement') {
          return processJsxNode(expr.right);
        }
      }
      // If it's a conditional expression like show ? <JSXElement> : null
      if (expr.type === 'ConditionalExpression') {
        if (expr.consequent.type === 'JSXElement') {
          return processJsxNode(expr.consequent);
        }
        if (expr.alternate && expr.alternate.type === 'JSXElement') {
          return processJsxNode(expr.alternate);
        }
      }

      collectIdentifiers(expr);
      const exprString = translateToKotlinExpr(expr);
      if (!exprString) return null;
      const id = `dynamic_node_${idCounter++}`;
      return {
        tag: 'TextView',
        attrs: {
          'android:id': `@+id/${id}`,
          'android:layout_width': 'wrap_content',
          'android:layout_height': 'wrap_content'
        },
        children: [],
        isDynamic: true,
        dynamicText: `\${${exprString}}`
      };
    }

    if (node.type === 'JSXElement') {
      const name = node.openingElement.name.name;
      let tag = 'LinearLayout';
      let attrs = {
        'android:layout_width': 'match_parent',
        'android:layout_height': 'wrap_content',
        'android:orientation': 'vertical' // React Native default
      };

      if (name === 'Text') {
        tag = 'TextView';
        attrs['android:layout_width'] = 'wrap_content';
      } else if (name === 'Image') {
        tag = 'ImageView';
      } else if (name === 'TouchableOpacity' || name === 'TouchableWithoutFeedback') {
        tag = 'LinearLayout';
      }

      let isDynamic = false;
      let dynamicText = '';
      let onPressAction = '';

      node.openingElement.attributes.forEach(attr => {
        if (attr.type === 'JSXAttribute') {
          if (attr.name.name === 'style') {
            const resolved = resolveStyle(attr.value.expression);
            
            if (resolved.flexDirection === 'row') attrs['android:orientation'] = 'horizontal';
            if (resolved.flexDirection === 'column') attrs['android:orientation'] = 'vertical';
            
            if (resolved.flex) {
              attrs['android:layout_weight'] = resolved.flex;
              attrs['android:layout_width'] = resolved.flexDirection === 'row' ? '0dp' : 'match_parent';
              attrs['android:layout_height'] = resolved.flexDirection === 'column' ? '0dp' : 'match_parent';
            }

            if (resolved.justifyContent) {
              if (resolved.justifyContent === 'center') attrs['android:gravity'] = 'center';
              if (resolved.justifyContent === 'flex-end') attrs['android:gravity'] = 'end';
              if (resolved.justifyContent === 'space-between') attrs['android:gravity'] = 'center_vertical';
            }
            if (resolved.alignItems) {
              if (resolved.alignItems === 'center') attrs['android:gravity'] = (attrs['android:gravity'] ? attrs['android:gravity'] + '|' : '') + 'center';
            }

            if (resolved.backgroundColor) {
              const hex = getAndroidColor(resolved.backgroundColor);
              if (hex) attrs['android:background'] = hex;
            }
            if (resolved.color && tag === 'TextView') {
              const hex = getAndroidColor(resolved.color);
              if (hex) attrs['android:textColor'] = hex;
            }
            if (resolved.fontSize && tag === 'TextView') {
              attrs['android:textSize'] = `${resolved.fontSize}sp`;
            }
            if (resolved.fontWeight && tag === 'TextView') {
              if (resolved.fontWeight === 'bold' || resolved.fontWeight > '500') attrs['android:textStyle'] = 'bold';
            }
            if (resolved.marginTop) attrs['android:layout_marginTop'] = `${resolved.marginTop}dp`;
            if (resolved.marginLeft) attrs['android:layout_marginLeft'] = `${resolved.marginLeft}dp`;
            if (resolved.padding) attrs['android:padding'] = `${resolved.padding}dp`;
          } else if (attr.name.name === 'onPress') {
            if (attr.value.type === 'JSXExpressionContainer') {
              const expr = attr.value.expression;
              if (expr.type === 'Identifier') {
                onPressAction = expr.name;
                isDynamic = true;
              } else if (expr.type === 'ArrowFunctionExpression') {
                if (expr.body.type === 'CallExpression') {
                  if (expr.body.callee.type === 'Identifier') {
                    onPressAction = expr.body.callee.name;
                    isDynamic = true;
                  }
                }
              }
            }
          }
        }
      });

      // Special Text children extraction
      let children = [];
      if (tag === 'TextView') {
        let isClock = false;
        node.children.forEach(c => {
          if (c.type === 'JSXText') {
            const val = c.value.replace(/\$/g, '\\$').replace(/"/g, '\\"');
            dynamicText += val;
          } else if (c.type === 'JSXExpressionContainer') {
            collectIdentifiers(c.expression);
            const expr = translateToKotlinExpr(c.expression);
            if (expr) {
              dynamicText += `\${${expr}}`;
              isDynamic = true;
              if (expr.includes('hours') || expr.includes('mins') || expr.includes('currentTime') || expr.includes('formattedHours')) {
                isClock = true;
              }
            }
          }
        });
        
        if (isClock) {
          tag = 'TextClock';
          attrs['android:layout_width'] = 'wrap_content';
          attrs['android:format12Hour'] = '"h:mm a"';
          attrs['android:format24Hour'] = '"HH:mm"';
          isDynamic = true;
          dynamicText = '';
          referencedVars.add('title');
        } else if (dynamicText) {
          if (!isDynamic) {
             attrs['android:text'] = `"${dynamicText}"`;
          }
        }
      } else {
        node.children.forEach(c => {
          const processed = processJsxNode(c);
          if (processed) children.push(processed);
        });
      }

      if (isDynamic) {
        attrs['android:id'] = `@+id/dynamic_node_${idCounter++}`;
      }

      return { tag, attrs, children, isDynamic, dynamicText, onPressAction };
    }
    return null;
  }

  // Find the return statement of the component
  let rootJsx = null;
  traverse(ast, {
    ReturnStatement(path) {
      if (!rootJsx && path.node.argument && path.node.argument.type === 'JSXElement') {
        rootJsx = path.node.argument;
      }
    }
  });

  if (rootJsx) {
    xmlRoot = processJsxNode(rootJsx);
  } else {
    xmlRoot = { tag: 'LinearLayout', attrs: { 'android:layout_width': 'match_parent', 'android:layout_height': 'match_parent' }, children: [] };
  }

  function generateXmlString(node, indent = '') {
    if (!node) return '';
    let attrsStr = Object.entries(node.attrs).map(([k, v]) => `\n${indent}    ${k}="${String(v).replace(/"/g, '')}"`).join('');
    
    if (node.children.length === 0) {
      return `${indent}<${node.tag}${attrsStr} />`;
    }
    
    const childrenStr = node.children.map(c => generateXmlString(c, indent + '    ')).join('\n');
    return `${indent}<${node.tag}${attrsStr}>\n${childrenStr}\n${indent}</${node.tag}>`;
  }

  // Add the root xmlns and ID
  xmlRoot.attrs['xmlns:android'] = 'http://schemas.android.com/apk/res/android';
  xmlRoot.attrs['android:id'] = '@+id/nos_widget_root';
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>\n` + generateXmlString(xmlRoot);

  // Kotlin Code Generation
  kotlinLines.push('super.populateViews(context, views, config, customs, theme, appWidgetId)');
  kotlinLines.push('val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)');
  kotlinImports.add('com.nothing.nosgallery.widget.NosWidgetPreferences');

  const excludedVars = new Set([
    'React', 'styles', 'accentColor', 'textStyle', 'subtextStyle', 'successColor', 'errorColor',
    'dimColor', 'textColor', 'isLight', 'customizations', 'globalTheme',
    'true', 'false', 'null', 'undefined', 'Math', 'i', 'itemRow', 'todo', 'cells',
    'WEEK_DAYS', 't', 'interval', '_', '__', 'val', 'var', 'fun', 'class', 'object', 'interface',
    'in', 'is', 'as', 'this', 'super', 'return', 'typeof', 'parseFloat', 'parseInt',
    'formatTime', 'formatStopwatchTime'
  ]);

  const knownVariables = {
    interactive: 'val interactive = true',
    currentTime: 'val currentTime = java.util.Date()',
    currentDay: 'val currentDay = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_MONTH)',
    month: 'val month = java.util.Calendar.getInstance().get(java.util.Calendar.MONTH)',
    year: 'val year = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)',
    MONTHS: 'val MONTHS = arrayOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")',
    WEEK_DAYS: 'val WEEK_DAYS = arrayOf("S", "M", "T", "W", "T", "F", "S")',
    formattedHours: 'val formattedHours = String.format("%02d", java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY))',
    mins: 'val mins = String.format("%02d", java.util.Calendar.getInstance().get(java.util.Calendar.MINUTE))',
    prevVal: 'val prevVal = "00"',
    currentVal: 'val currentVal = "00"',
    done: 'val done = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_YEAR).toDouble() / (if (java.util.GregorianCalendar().isLeapYear(java.util.Calendar.getInstance().get(java.util.Calendar.YEAR))) 366.0 else 365.0)',
    pct: 'val pct = String.format(java.util.Locale.US, "%.6f", (java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_YEAR).toDouble() / (if (java.util.GregorianCalendar().isLeapYear(java.util.Calendar.getInstance().get(java.util.Calendar.YEAR))) 366.0 else 365.0)) * 100.0)',
    snapCount: 'val snapCount = dynamicState.optInt("snapCount", 0)',
    value: 'val value = customs?.optString("valueText") ?: config?.optString("valueText") ?: ""',
    ticker: 'val tickerStr = customs?.optString("valueText") ?: config?.optString("valueText") ?: "{}"\n        val ticker = try { org.json.JSONObject(tickerStr) } catch(e: Exception) { org.json.JSONObject() }',
    moon: 'val moonStr = customs?.optString("valueText") ?: config?.optString("valueText") ?: "{}"\n        val moon = try { org.json.JSONObject(moonStr) } catch(e: Exception) { org.json.JSONObject() }',
    track: 'val trackStr = customs?.optString("valueText") ?: config?.optString("valueText") ?: "{}"\n        val track = try { org.json.JSONObject(trackStr) } catch(e: Exception) { org.json.JSONObject() }',
    details: 'val detailsStr = customs?.optString("subValueText") ?: config?.optString("subValueText") ?: "{}"\n        val details = try { org.json.JSONObject(detailsStr) } catch(e: Exception) { org.json.JSONObject() }',
    item: 'val item = org.json.JSONObject().apply { put("platform", "𝕏"); put("handle", "@nosgallery"); put("msg", "Just shipped 3.0 🚀"); put("time", "2m"); put("color", "#ffffff"); }',
    subCount: 'val subCount = 14242',
    completedCount: 'val completedCount = customs?.optInt("progressBarValue", 0) ?: config?.optInt("progressBarValue", 0) ?: 0',
    todoList: 'val todoListStr = customs?.optString("todoList") ?: config?.optString("todoList") ?: "[]"\n        val todoList = try { org.json.JSONArray(todoListStr) } catch(e: Exception) { org.json.JSONArray() }',
    mode: 'val mode = customs?.optString("valueText") ?: config?.optString("valueText") ?: "FOCUS"',
    phaseLabel: 'val phaseLabel = customs?.optString("valueText") ?: config?.optString("valueText") ?: "BREATHE"',
    index1: 'val index1 = 0',
    IMAGES: 'val IMAGES = arrayOf("")',
    SESSION_LABELS: 'val SESSION_LABELS = arrayOf("DEEP WORK", "SHORT BREAK", "LONG BREAK")',
    secs: 'val secs = "00"',
    labelSuffix: 'val labelSuffix = if (title.lowercase().contains("tokyo") || title.lowercase().contains("japan")) "TKY" else if (title.lowercase().contains("london") || title.lowercase().contains("uk")) "LDN" else if (title.lowercase().contains("new york") || title.lowercase().contains("nyc") || title.lowercase().contains("us")) "NYC" else if (title.lowercase().contains("utc") || title.lowercase().contains("gmt")) "UTC" else ""',
    SPARK_DATA: 'val SPARK_DATA = intArrayOf(62, 68, 65, 72, 69, 75, 71, 78, 73, 80, 77, 84)',
    googleUser: 'val googleUserStr = dynamicState.optString("googleUser", "{}")\n        val googleUser = try { org.json.JSONObject(googleUserStr) } catch(e: Exception) { org.json.JSONObject() }',
  };

  // Transitively find all dependencies of local declarations that are referenced
  let added = true;
  while (added) {
    added = false;
    traverse(ast, {
      VariableDeclarator(path) {
        if (path.node.id.type === 'Identifier' && path.node.init) {
          const name = path.node.id.name;
          if (knownVariables[name] !== undefined) {
             return;
          }
          const init = path.node.init;
          if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
             return;
          }
          if (referencedVars.has(name)) {
            path.traverse({
              Identifier(idPath) {
                if (idPath.parent.type === 'MemberExpression' && idPath.parent.property === idPath.node && !idPath.parent.computed) {
                  return;
                }
                const dep = idPath.node.name;
                if (!referencedVars.has(dep) && !excludedVars.has(dep) && localConsts[dep] === undefined) {
                  referencedVars.add(dep);
                  added = true;
                }
              }
            });
          }
        }
      }
    });
  }

  const varsToDeclare = new Set();
  referencedVars.forEach(v => {
    if (localConsts[v] === undefined && !excludedVars.has(v)) {
      varsToDeclare.add(v);
    }
  });

  storeVars.forEach(v => varsToDeclare.add(v));

  const varsToDeclareOrdered = [];
  
  // 1. title and interactive first
  if (varsToDeclare.has('title')) {
    varsToDeclareOrdered.push({ name: 'title', isLocal: false });
    varsToDeclare.delete('title');
  }
  if (varsToDeclare.has('interactive')) {
    varsToDeclareOrdered.push({ name: 'interactive', isLocal: false });
    varsToDeclare.delete('interactive');
  }

  // 2. Other knownVariables next
  Object.keys(knownVariables).forEach(k => {
    if (varsToDeclare.has(k)) {
      varsToDeclareOrdered.push({ name: k, isLocal: false });
      varsToDeclare.delete(k);
    }
  });

  // 3. Remaining variables (dynamic state inputs / fallbacks) that are NOT local declarations
  varsToDeclare.forEach(v => {
    const isLocal = localDeclarations.some(decl => decl.name === v);
    if (!isLocal) {
      varsToDeclareOrdered.push({ name: v, isLocal: false });
      varsToDeclare.delete(v);
    }
  });

  // 4. local component variables last (they depend on inputs)
  localDeclarations.forEach(decl => {
    if (varsToDeclare.has(decl.name)) {
      varsToDeclareOrdered.push({ name: decl.name, isLocal: true, expr: decl.expr });
      varsToDeclare.delete(decl.name);
    }
  });

  varsToDeclareOrdered.forEach(vInfo => {
    const v = vInfo.name;
    if (vInfo.isLocal) {
      kotlinLines.push(`val ${v} = ${vInfo.expr}`);
      return;
    }
    
    if (knownVariables[v] !== undefined) {
      knownVariables[v].split('\n').forEach(line => kotlinLines.push(line));
      return;
    }

    if (v === 'title') {
      kotlinLines.push(`val title = customs?.optString("titleText") ?: config?.optString("titleText") ?: "DEVELOPER"`);
      return;
    }
    if (v === 'valText') {
      kotlinLines.push(`val valText = customs?.optString("valueText") ?: config?.optString("valueText") ?: ""`);
      return;
    }
    if (v === 'value') {
      kotlinLines.push(`val value = customs?.optString("valueText") ?: config?.optString("valueText") ?: ""`);
      return;
    }

    let ktType = 'String'; let ktDefault = '""';
    if (v.toLowerCase().includes('time') || v.toLowerCase().includes('elapsed')) {
      ktType = 'Long';
      ktDefault = '0L';
    } else if (
      (booleanVars.has(v) && 
       !['username', 'name', 'text', 'value', 'user', 'response', 'list', 'profile', 'mode', 'label', 'prefix', 'suffix', 'desc', 'title', 'artist', 'data', 'key', 'url', 'uri', 'path', 'ticker', 'moon', 'track', 'details', 'item', 'email', 'image', 'session'].some(keyword => v.toLowerCase().includes(keyword))
      ) ||
      v.toLowerCase().includes('running') ||
      v.toLowerCase().includes('is') ||
      v.toLowerCase().includes('active') ||
      v.toLowerCase().includes('enabled') ||
      v.toLowerCase().includes('playing') ||
      v.toLowerCase().includes('connected') ||
      v.toLowerCase().includes('lighton') ||
      v.toLowerCase().includes('editing')
    ) {
      ktType = 'Boolean';
      ktDefault = 'false';
    } else if (
      v.toLowerCase().includes('count') ||
      v.toLowerCase().includes('index') ||
      v.toLowerCase().includes('level') ||
      v.toLowerCase().includes('usage') ||
      v.toLowerCase().includes('goal') ||
      v.toLowerCase().includes('intake') ||
      v.toLowerCase().includes('progress')
    ) {
      ktType = 'Int';
      ktDefault = '0';
    }
    
    let configFallback = `config?.opt${ktType}("${v}") ?: customs?.opt${ktType}("${v}") ?: ${ktDefault}`;
    kotlinLines.push(`val ${v} = dynamicState.opt${ktType}("${v}", ${configFallback})`);
  });

  // Track Kotlin node bindings
  function bindDynamicNodes(node) {
    if (node.isDynamic && node.attrs['android:id']) {
      const idName = node.attrs['android:id'].replace('@+id/', '');
      
      if (node.dynamicText) {
        let cleanText = node.dynamicText;
        cleanText = cleanText.replace(/^\r?\n\s*/, '');
        cleanText = cleanText.replace(/\r?\n\s*$/, '');
        cleanText = cleanText.replace(/\r?\n/g, '\\n');
        kotlinLines.push(`views.setTextViewText(R.id.${idName}, "${cleanText}")`);
      }
      
      if (node.tag === 'TextClock') {
        kotlinLines.push(`views.setString(R.id.${idName}, "setTimeZone", if (title.lowercase().contains("tokyo") || title.lowercase().contains("japan")) "Asia/Tokyo" else if (title.lowercase().contains("london") || title.lowercase().contains("uk")) "Europe/London" else if (title.lowercase().contains("new york") || title.lowercase().contains("nyc") || title.lowercase().contains("us")) "America/New_York" else if (title.lowercase().contains("utc") || title.lowercase().contains("gmt")) "UTC" else java.util.TimeZone.getDefault().id)`);
      }
      
      if (node.onPressAction) {
        let actionName = node.onPressAction;
        const widgetId = widgetConfig.id;
        
        if (widgetId === 'health_water') {
          if (actionName === 'handleLogWater') actionName = 'add_water';
          else if (actionName === 'handleReset') actionName = 'reset_water';
          else if (actionName === 'handleCycleTarget') actionName = 'cycle_target';
        } else if (widgetId === 'clock_stopwatch') {
          if (actionName === 'handleStopwatch') actionName = 'toggle_stopwatch';
          else if (actionName === 'handleStopwatchReset') actionName = 'reset_stopwatch';
        } else if (widgetId === 'productivity_music') {
          if (actionName === 'handlePlayPause') actionName = 'music_play';
          else if (actionName === 'handleSkipForward') actionName = 'music_skip';
        } else if (widgetId === 'smart_home_sound_control') {
          if (actionName === 'cycleProfile') actionName = 'cycle_sound';
        } else if (widgetId === 'smart_home_torch') {
          if (actionName === 'toggleTorch') actionName = 'toggle_torch';
        }
        
        if (actionName === node.onPressAction) {
          actionName = actionName.replace(/^handle/, '');
          actionName = actionName.replace(/([A-Z])/g, '_$1').toLowerCase();
          if (actionName.startsWith('_')) actionName = actionName.substring(1);
        }
        
        kotlinLines.push(`views.setOnClickPendingIntent(R.id.${idName}, getClickPendingIntent(context, appWidgetId, "${actionName}"))`);
      }
    }
    node.children.forEach(bindDynamicNodes);
  }
  bindDynamicNodes(xmlRoot);

  return {
    kotlinCode: kotlinLines.join('\n'),
    kotlinImports: Array.from(kotlinImports),
    xmlContent: xmlContent
  };
}

module.exports = { parseTsxToKotlin };
