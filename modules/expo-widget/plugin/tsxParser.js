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
          const leftExpr = translateToKotlinExpr(node.left);
          const rightExpr = translateToKotlinExpr(node.right);
          // If right side is a string literal (e.g. + "33"), ensure left is stringified
          // to handle Any? types like map lookups
          if (node.right.type === 'StringLiteral') {
            return `${leftExpr}.toString() + ${rightExpr}`;
          }
          return `${leftExpr} + ${rightExpr}`;
        }
        if (node.operator === '/') {
          return `(${translateToKotlinExpr(node.left)}).toDouble() / (${translateToKotlinExpr(node.right)})`;
        }
        // Map JS strict equality to Kotlin value equality
        { const op = node.operator === '===' ? '==' : node.operator === '!==' ? '!=' : node.operator;
          return `${translateToKotlinExpr(node.left)} ${op} ${translateToKotlinExpr(node.right)}`; }
      case 'LogicalExpression': {
        const leftExpr = translateToKotlinExpr(node.left);
        const rightExpr = translateToKotlinExpr(node.right);
        
        // Helper to detect if a node produces a boolean result
        function isBooleanNode(n) {
          if (!n) return false;
          if (n.type === 'BooleanLiteral') return true;
          if (n.type === 'UnaryExpression' && n.operator === '!') return true;
          if (n.type === 'BinaryExpression' && ['===', '!==', '==', '!=', '<', '>', '<=', '>='].includes(n.operator)) return true;
          if (n.type === 'LogicalExpression' && (n.operator === '&&' || n.operator === '||')) return true;
          // .contains(), .includes() return Boolean
          if ((n.type === 'CallExpression' || n.type === 'OptionalCallExpression') &&
              (n.callee.type === 'MemberExpression' || n.callee.type === 'OptionalMemberExpression') &&
              ['contains', 'includes', 'startsWith', 'endsWith', 'matches'].includes(n.callee.property && n.callee.property.name)) {
            return true;
          }
          // Identifier names that suggest boolean type
          if (n.type === 'Identifier') {
            const lname = n.name.toLowerCase();
            if (lname.startsWith('is') || lname.startsWith('has') || lname.startsWith('can') ||
                lname.startsWith('should') || lname.includes('running') || lname.includes('active') ||
                lname.includes('enabled') || lname.includes('playing') || lname.includes('connected') ||
                lname.includes('lighton') || lname.includes('editing') || lname.includes('visible') ||
                lname.includes('show') || lname.includes('done') || lname.includes('loading')) {
              return true;
            }
          }
          return false;
        }
        
        if (node.operator === '&&') {
          // && is almost always boolean in JSX (conditional rendering or boolean logic)
          return `${leftExpr} && ${rightExpr}`;
        }
        
        if (node.operator === '||') {
          // If either side looks like boolean, emit boolean ||
          if (isBooleanNode(node.left) || isBooleanNode(node.right)) {
            return `${leftExpr} || ${rightExpr}`;
          }
          // If the left is a computed map/array access or optional chain, use ?.toString() ?:
          // for safe null-coalescing that preserves String type
          const isNullableLeft = node.left.type === 'OptionalMemberExpression' ||
                                 node.left.type === 'OptionalCallExpression' ||
                                 (node.left.computed === true) ||
                                 (node.left.type === 'MemberExpression' && node.left.computed);
          if (isNullableLeft) {
            return `(${leftExpr}?.toString() ?: ${rightExpr})`;
          }
          // Otherwise it's a nullish/value coalescing pattern (e.g. value || "default")
          // Use Kotlin's ?: operator  
          return `(${leftExpr}).takeIf { it.toString().isNotEmpty() } ?: ${rightExpr}`;
        }
        
        return `${leftExpr} ${node.operator} ${rightExpr}`;
      }
      case 'UnaryExpression':
        if (node.operator === '!') {
          return `!${translateToKotlinExpr(node.argument)}`;
        }
        if (node.operator === '-') {
          return `-${translateToKotlinExpr(node.argument)}`;
        }
        return translateToKotlinExpr(node.argument);
      case 'NullLiteral':
        return 'null';
      case 'ArrayExpression': {
        const elements = node.elements.filter(Boolean).map(translateToKotlinExpr);
        if (elements.length === 0) return 'listOf<Any>()';
        return `listOf(${elements.join(', ')})`;
      }
      case 'ParenthesizedExpression':
        return `(${translateToKotlinExpr(node.expression)})`;
      case 'ConditionalExpression':
        return `if (${translateToKotlinExpr(node.test)}) ${translateToKotlinExpr(node.consequent)} else ${translateToKotlinExpr(node.alternate)}`;
      case 'ObjectExpression': {
        const pairs = node.properties.map(p => {
          if (p.type === 'ObjectProperty') {
            const k = p.key.type === 'Identifier' ? `"${p.key.name}"` : translateToKotlinExpr(p.key);
            const v = translateToKotlinExpr(p.value);
            return `${k} to ${v}`;
          }
          return '';
        }).filter(Boolean);
        return `mapOf(${pairs.join(', ')})`;
      }
      case 'OptionalMemberExpression':
      case 'MemberExpression': {
        const obj = translateToKotlinExpr(node.object);
        if (obj === 'styles') return '""';
        if (obj === 'textStyle' && node.property.name === 'color') return 'textColor';
        if (obj === 'subtextStyle' && node.property.name === 'color') return 'subtextColor';
        if (obj === 'themeConfig') {
          if (node.property.name === 'textColor') return 'textColor';
          if (node.property.name === 'subtextColor') return 'subtextColor';
          if (node.property.name === 'backgroundColor') return 'themeBackground(theme)';
          if (node.property.name === 'accentColor') return 'accentColor';
        }
        
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
        const jsonObjects = ['ticker', 'moon', 'track', 'details', 'item', 'googleUser', 'weather'];
        if (jsonObjects.includes(obj)) {
          if (prop === 'price' || prop === 'change' || prop === 'age' || prop === 'temp' || prop === 'windSpeed' || prop === 'uvIndex') {
            return `${obj}.optDouble("${prop}", 0.0)`;
          }
          if (prop === 'volume' || prop === 'duration' || prop === 'position' || prop === 'waterIntake' || prop === 'waterGoal' || prop === 'steps' || prop === 'kcal' || prop === 'id' || prop === 'aqi' || prop === 'humidity') {
            return `${obj}.optInt("${prop}", 0)`;
          }
          return `${obj}.optString("${prop}", "")`;
        }
        
        // Computed array/member indexing like array[index]
        if (node.computed) {
          const propExpr = translateToKotlinExpr(node.property);
          // For local map variables, use direct get with ?: null-coalesce
          if (obj === 'PHASE_COLORS' || obj.toLowerCase().includes('color') || obj.toLowerCase().includes('icon') || obj.toLowerCase().includes('map')) {
            return `${obj}[${propExpr}]`;
          }
          return `${obj}.getOrNull((${propExpr}).toInt()) ?: ""`;
        }
        
        return `${obj}.${prop}`;
      }
      case 'OptionalCallExpression':
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
          if (method === 'floor') {
            const args = node.arguments.map(translateToKotlinExpr).join(', ');
            return `java.lang.Math.floor(${args}.toDouble()).toInt()`;
          }
          if (method === 'round') {
            const args = node.arguments.map(translateToKotlinExpr).join(', ');
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
            const doubleArgs = node.arguments.map(arg => `(${translateToKotlinExpr(arg)}).toDouble()`).join(', ');
            return `java.lang.Math.${method}(${doubleArgs})`;
          }
          const args = node.arguments.map(translateToKotlinExpr).join(', ');
          return `java.lang.Math.${method}(${args})`;
        }
        
        // Handle methods like toLocaleString
        if (node.callee.type === 'MemberExpression' || node.callee.type === 'OptionalMemberExpression') {
          const method = node.callee.property.name;
          const obj = translateToKotlinExpr(node.callee.object);
          if (method === 'interpolate') {
            return '0.0';
          }
          if (method === 'includes') {
            const arg = node.arguments[0] ? translateToKotlinExpr(node.arguments[0]) : '""';
            return `${obj}.contains(${arg})`;
          }
          if (method === 'padStart' || method === 'padEnd') {
            const len = translateToKotlinExpr(node.arguments[0]);
            const padStr = node.arguments[1] ? translateToKotlinExpr(node.arguments[1]) : '" "';
            return `${obj}.${method}(${len}, (${padStr})[0])`;
          }
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
        if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
          return;
        }
        if (init.type === 'CallExpression') {
          let calleeName = '';
          if (init.callee.type === 'Identifier') {
            calleeName = init.callee.name;
          } else if (init.callee.type === 'MemberExpression' && init.callee.object.type === 'Identifier') {
            calleeName = init.callee.object.name;
          }
          if (calleeName.startsWith('use') || calleeName === 'triggerHaptic') {
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

  function unwrapParenthesis(node) {
    while (node && node.type === 'ParenthesizedExpression') {
      node = node.expression;
    }
    return node;
  }

  function extractDynamicColors(styleNode) {
    let colors = {};
    if (!styleNode) return colors;

    if (styleNode.type === 'ArrayExpression') {
      styleNode.elements.forEach(el => {
        Object.assign(colors, extractDynamicColors(el));
      });
    } else if (styleNode.type === 'Identifier') {
      if (styleNode.name === 'textStyle') {
        colors['color'] = 'textColor';
      } else if (styleNode.name === 'subtextStyle') {
        colors['color'] = 'subtextColor';
      }
    } else if (styleNode.type === 'ObjectExpression') {
      styleNode.properties.forEach(p => {
        if (p.key && p.key.name && p.value) {
          const propName = p.key.name;
          if (propName === 'color' || propName === 'backgroundColor') {
            const val = p.value;
            if (val.type !== 'StringLiteral' && val.type !== 'NumericLiteral') {
              const ktExpr = translateToKotlinExpr(val);
              if (ktExpr) {
                colors[propName] = ktExpr;
              }
            }
          }
        }
      });
    }
    return colors;
  }

  function processJsxNode(node) {
    if (node.type === 'JSXText') {
      const text = node.value.replace(/\s+/g, ' ').trim();
      if (!text) return null;
      return { tag: 'TextView', attrs: { 'android:text': `"${text}"`, 'android:layout_width': 'wrap_content', 'android:layout_height': 'wrap_content' }, children: [], isDynamic: false };
    }
    if (node.type === 'JSXExpressionContainer') {
      const expr = node.expression;
      if (expr.type === 'JSXEmptyExpression') {
        return null;
      }
      if (expr.type === 'CallExpression' && expr.callee.property && expr.callee.property.name === 'map') {
        return null; // Ignore array map
      }
      // If it's a logical expression like interactive && <JSXElement>
      if (expr.type === 'LogicalExpression' && expr.operator === '&&') {
        const rightNode = unwrapParenthesis(expr.right);
        if (rightNode.type === 'JSXElement') {
          return processJsxNode(rightNode);
        }
      }
      // If it's a conditional expression like show ? <JSXElement> : null
      if (expr.type === 'ConditionalExpression') {
        const consequentNode = unwrapParenthesis(expr.consequent);
        if (consequentNode.type === 'JSXElement') {
          return processJsxNode(consequentNode);
        }
        const alternateNode = unwrapParenthesis(expr.alternate);
        if (alternateNode && alternateNode.type === 'JSXElement') {
          return processJsxNode(alternateNode);
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
          if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            collectIdentifiers(attr.value.expression);
          }
          if (attr.name.name === 'style') {
            const resolved = resolveStyle(attr.value.expression);
            
            // 1. Orientation
            if (resolved.flexDirection === 'row') attrs['android:orientation'] = 'horizontal';
            if (resolved.flexDirection === 'column') attrs['android:orientation'] = 'vertical';
            
            // 2. Sizing
            const translateDimension = (val) => {
              if (typeof val === 'number') return `${val}dp`;
              const str = String(val).trim();
              if (str.endsWith('%')) return 'match_parent';
              return str;
            };

            if (resolved.width !== undefined) {
              attrs['android:layout_width'] = translateDimension(resolved.width);
            }
            if (resolved.height !== undefined) {
              attrs['android:layout_height'] = translateDimension(resolved.height);
            }
            
            // 3. Flex Weight & Dimensions
            const isRow = attrs['android:orientation'] === 'horizontal';
            if (resolved.flex !== undefined) {
              attrs['android:layout_weight'] = resolved.flex;
              // If weight is set, the main dimension should be 0dp for correct layout calculations
              if (resolved.width === undefined) {
                attrs['android:layout_width'] = isRow ? '0dp' : 'match_parent';
              }
              if (resolved.height === undefined) {
                attrs['android:layout_height'] = isRow ? 'match_parent' : '0dp';
              }
            }

            // 4. Alignments (Gravity)
            let gravityParts = [];
            if (resolved.justifyContent) {
              if (resolved.justifyContent === 'center') {
                gravityParts.push(isRow ? 'center_horizontal' : 'center_vertical');
              } else if (resolved.justifyContent === 'flex-end') {
                gravityParts.push(isRow ? 'right' : 'bottom');
              } else if (resolved.justifyContent === 'flex-start') {
                gravityParts.push(isRow ? 'left' : 'top');
              } else if (resolved.justifyContent === 'space-between' || resolved.justifyContent === 'space-around') {
                gravityParts.push(isRow ? 'center_horizontal' : 'center_vertical');
              }
            }
            if (resolved.alignItems) {
              if (resolved.alignItems === 'center') {
                gravityParts.push(isRow ? 'center_vertical' : 'center_horizontal');
              } else if (resolved.alignItems === 'flex-end') {
                gravityParts.push(isRow ? 'bottom' : 'right');
              } else if (resolved.alignItems === 'flex-start') {
                gravityParts.push(isRow ? 'top' : 'left');
              }
            }
            if (gravityParts.length > 0) {
              if (gravityParts.includes('center_horizontal') && gravityParts.includes('center_vertical')) {
                attrs['android:gravity'] = 'center';
              } else {
                attrs['android:gravity'] = gravityParts.join('|');
              }
            }

            // 5. Layout Gravity (alignSelf)
            if (resolved.alignSelf) {
              if (resolved.alignSelf === 'center') {
                attrs['android:layout_gravity'] = 'center';
              } else if (resolved.alignSelf === 'flex-end') {
                attrs['android:layout_gravity'] = 'end';
              } else if (resolved.alignSelf === 'flex-start') {
                attrs['android:layout_gravity'] = 'start';
              }
            }

            // 6. Colors
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

            // 7. Spacing (Paddings and Margins)
            if (resolved.padding !== undefined) attrs['android:padding'] = `${resolved.padding}dp`;
            if (resolved.paddingHorizontal !== undefined) {
              attrs['android:paddingLeft'] = `${resolved.paddingHorizontal}dp`;
              attrs['android:paddingRight'] = `${resolved.paddingHorizontal}dp`;
            }
            if (resolved.paddingVertical !== undefined) {
              attrs['android:paddingTop'] = `${resolved.paddingVertical}dp`;
              attrs['android:paddingBottom'] = `${resolved.paddingVertical}dp`;
            }
            if (resolved.paddingLeft !== undefined) attrs['android:paddingLeft'] = `${resolved.paddingLeft}dp`;
            if (resolved.paddingRight !== undefined) attrs['android:paddingRight'] = `${resolved.paddingRight}dp`;
            if (resolved.paddingTop !== undefined) attrs['android:paddingTop'] = `${resolved.paddingTop}dp`;
            if (resolved.paddingBottom !== undefined) attrs['android:paddingBottom'] = `${resolved.paddingBottom}dp`;

            if (resolved.margin !== undefined) attrs['android:layout_margin'] = `${resolved.margin}dp`;
            if (resolved.marginHorizontal !== undefined) {
              attrs['android:layout_marginLeft'] = `${resolved.marginHorizontal}dp`;
              attrs['android:layout_marginRight'] = `${resolved.marginHorizontal}dp`;
            }
            if (resolved.marginVertical !== undefined) {
              attrs['android:layout_marginTop'] = `${resolved.marginVertical}dp`;
              attrs['android:layout_marginBottom'] = `${resolved.marginVertical}dp`;
            }
            if (resolved.marginLeft !== undefined) attrs['android:layout_marginLeft'] = `${resolved.marginLeft}dp`;
            if (resolved.marginRight !== undefined) attrs['android:layout_marginRight'] = `${resolved.marginRight}dp`;
            if (resolved.marginTop !== undefined) attrs['android:layout_marginTop'] = `${resolved.marginTop}dp`;
            if (resolved.marginBottom !== undefined) attrs['android:layout_marginBottom'] = `${resolved.marginBottom}dp`;
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

      let styleAttr = node.openingElement.attributes.find(attr => attr.type === 'JSXAttribute' && attr.name.name === 'style');
      const dynamicColors = extractDynamicColors(styleAttr ? styleAttr.value.expression : null);
      if (Object.keys(dynamicColors).length > 0) {
        isDynamic = true;
      }

      if (isDynamic) {
        attrs['android:id'] = `@+id/dynamic_node_${idCounter++}`;
      }

      return { 
        tag, 
        attrs, 
        children, 
        isDynamic, 
        dynamicText, 
        onPressAction,
        colorBindings: Object.keys(dynamicColors).length > 0 ? dynamicColors : null 
      };
    }
    return null;
  }

  // Find the return statement of the component
  let rootJsx = null;

  // 1. Helper to get the function name enclosing a path
  function getFunctionName(returnPath) {
    const funcPath = returnPath.getFunctionParent();
    if (!funcPath) return null;
    const funcNode = funcPath.node;
    if (funcNode.type === 'FunctionDeclaration' && funcNode.id) {
      return funcNode.id.name;
    }
    if (funcPath.parent && funcPath.parent.type === 'VariableDeclarator' && funcPath.parent.id.type === 'Identifier') {
      return funcPath.parent.id.name;
    }
    return null;
  }

  // 2. Collect exported names
  const exportedNames = new Set();
  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(decl => {
            if (decl.id.type === 'Identifier') {
              exportedNames.add(decl.id.name);
            }
          });
        } else if (path.node.declaration.type === 'FunctionDeclaration') {
          if (path.node.declaration.id && path.node.declaration.id.type === 'Identifier') {
            exportedNames.add(path.node.declaration.id.name);
          }
        }
      }
    },
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'Identifier') {
          exportedNames.add(path.node.declaration.name);
        } else if (path.node.declaration.type === 'FunctionDeclaration') {
          if (path.node.declaration.id && path.node.declaration.id.type === 'Identifier') {
            exportedNames.add(path.node.declaration.id.name);
          }
        }
      }
    }
  });

  // 3. Collect return statement candidates
  const candidates = [];
  traverse(ast, {
    ReturnStatement(path) {
      if (path.node.argument && path.node.argument.type === 'JSXElement') {
        const funcName = getFunctionName(path);
        if (funcName) {
          candidates.push({ path, funcName });
        }
      }
    }
  });

  // 4. Select the best candidate
  const coreClassName = widgetConfig.className ? widgetConfig.className.replace(/^NOS/, '').replace(/Widget$/, '').toLowerCase() : '';
  let bestCandidate = null;

  // Prioritize exported functions that match the component name/className
  for (const cand of candidates) {
    if (exportedNames.has(cand.funcName)) {
      const lowerFunc = cand.funcName.toLowerCase();
      if (coreClassName && (lowerFunc.includes(coreClassName) || coreClassName.includes(lowerFunc))) {
        bestCandidate = cand;
        break;
      }
    }
  }

  // Fallback to any exported function
  if (!bestCandidate) {
    for (const cand of candidates) {
      if (exportedNames.has(cand.funcName)) {
        bestCandidate = cand;
        break;
      }
    }
  }

  // Fallback to any function matching className
  if (!bestCandidate && coreClassName) {
    for (const cand of candidates) {
      const lowerFunc = cand.funcName.toLowerCase();
      if (lowerFunc.includes(coreClassName) || coreClassName.includes(lowerFunc)) {
        bestCandidate = cand;
        break;
      }
    }
  }

  // Ultimate fallback to first JSX return statement
  if (!bestCandidate && candidates.length > 0) {
    bestCandidate = candidates[0];
  }

  if (bestCandidate) {
    rootJsx = bestCandidate.path.node.argument;
  }

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
  kotlinLines.push('val accentColor = parseColorOr(customs?.optString("accentColor"), themeAccent(theme))');
  kotlinLines.push('val textColor = parseColorOr(customs?.optString("textColor"), themeText(theme))');
  kotlinLines.push('val subtextColor = parseColorOr(customs?.optString("subValueColor"), themeSubtext(theme))');
  kotlinLines.push('val isLight = textColor == android.graphics.Color.parseColor("#FF111111") || textColor == android.graphics.Color.parseColor("#FF000000") || textColor == android.graphics.Color.BLACK');
  kotlinLines.push('val dimColor = if (isLight) "#888888" else "#666666"');
  kotlinLines.push('val successColor = when { theme.contains("nos") -> android.graphics.Color.parseColor("#FFFFFFFF"); theme.contains("luxury") -> android.graphics.Color.parseColor("#FFDFBA6B"); theme.contains("cyberpunk") || theme.contains("amoled") -> android.graphics.Color.parseColor("#FF39FF14"); theme.contains("glassmorphism") -> android.graphics.Color.parseColor("#CC34C759"); else -> android.graphics.Color.parseColor("#FF34C759") }');
  kotlinLines.push('val errorColor = when { theme.contains("nos") -> android.graphics.Color.parseColor("#FF7C9EFF"); theme.contains("luxury") -> android.graphics.Color.parseColor("#FFCF352E"); theme.contains("cyberpunk") || theme.contains("amoled") -> android.graphics.Color.parseColor("#FFFF0055"); theme.contains("glassmorphism") -> android.graphics.Color.parseColor("#CCFF3B30"); else -> android.graphics.Color.parseColor("#FF7C9EFF") }');
  kotlinLines.push('val warningColor = when { theme.contains("nos") -> android.graphics.Color.parseColor("#FF888888"); theme.contains("luxury") -> android.graphics.Color.parseColor("#FFDF8D4F"); theme.contains("cyberpunk") || theme.contains("amoled") -> android.graphics.Color.parseColor("#FFF1F100"); theme.contains("glassmorphism") -> android.graphics.Color.parseColor("#CCFF9500"); else -> android.graphics.Color.parseColor("#FFFF9500") }');
  kotlinImports.add('com.nothing.nosgallery.widget.NosWidgetPreferences');

  const excludedVars = new Set([
    'React', 'styles', 'accentColor', 'textStyle', 'subtextStyle', 'successColor', 'errorColor', 'warningColor',
    'dimColor', 'textColor', 'isLight', 'customizations', 'globalTheme',
    'true', 'false', 'null', 'undefined', 'Math', 'i', 'itemRow', 'todo', 'cells',
    'WEEK_DAYS', 't', 'interval', '_', '__', 'val', 'var', 'fun', 'class', 'object', 'interface',
    'in', 'is', 'as', 'this', 'super', 'return', 'typeof', 'parseFloat', 'parseInt',
    'formatTime', 'formatStopwatchTime', 'StyleSheet', 'useState', 'useRef', 'useEffect',
    'useCallback', 'useMemo', 'useFeedback', 'useWidgetStyle', 'useWidgetStore'
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
    weather: 'val weatherStr = customs?.optString("valueText") ?: config?.optString("valueText") ?: "{\\\"temp\\\":72.0,\\\"condition\\\":\\\"Sunny\\\",\\\"windSpeed\\\":14.0,\\\"humidity\\\":62.0,\\\"uvIndex\\\":5.0,\\\"aqi\\\":42.0}"\n        val weather = try { org.json.JSONObject(weatherStr) } catch(e: Exception) { org.json.JSONObject() }',
    loading: 'val loading = false',
    aqiInfo: 'val aqiInfo = org.json.JSONObject().apply {\n        val a = weather.optInt("aqi", 42)\n        if (a <= 35) {\n            put("label", "GOOD"); put("color", "#39ff14"); put("grade", "A")\n        } else if (a <= 75) {\n            put("label", "MODERATE"); put("color", "#ffcc00"); put("grade", "B")\n        } else if (a <= 115) {\n            put("label", "UNHEALTHY"); put("color", "#ff9500"); put("grade", "C")\n        } else {\n            put("label", "HAZARDOUS"); put("color", "#7C9EFF"); put("grade", "D")\n        }\n    }',
    condStyle: 'val condStyle = org.json.JSONObject().apply {\n        val cond = weather.optString("condition", "sunny").lowercase()\n        when {\n            cond.contains("sunny") || cond.contains("clear") -> {\n                put("icon", "Sun"); put("color", "#ffcc00")\n            }\n            cond.contains("cloud") -> {\n                put("icon", "Cloud"); put("color", "#8e8e93")\n            }\n            cond.contains("rain") -> {\n                put("icon", "CloudRain"); put("color", "#007aff")\n            }\n            cond.contains("drizzle") -> {\n                put("icon", "CloudDrizzle"); put("color", "#007aff")\n            }\n            cond.contains("snow") -> {\n                put("icon", "Snowflake"); put("color", "#a8d8ea")\n            }\n            cond.contains("thunder") -> {\n                put("icon", "CloudLightning"); put("color", "#ff9500")\n            }\n            else -> {\n                put("icon", "CloudSun"); put("color", customs?.optString("accentColor") ?: "#7C9EFF")\n            }\n        }\n    }',
    PHASE_COLORS: `val PHASE_COLORS = mapOf("INHALE" to (customs?.optString("accentColor") ?: "#7C9EFF"), "HOLD" to "#ffcc00", "EXHALE" to "#007aff")`,
    TOTAL: 'val TOTAL = (25 * 60).toLong()',
    POMODORO_DURATION: 'val POMODORO_DURATION = (25 * 60).toLong()',
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
          if (referencedVars.has(name) && !excludedVars.has(name)) {
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
    if (localConsts[v] === undefined && !excludedVars.has(v) && !v.startsWith('handle') && !v.startsWith('use')) {
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
      
      if (node.colorBindings) {
        if (node.colorBindings.color) {
          kotlinLines.push(`views.setTextColor(R.id.${idName}, parseColorOr(${node.colorBindings.color}, textColor))`);
        }
        if (node.colorBindings.backgroundColor) {
          kotlinLines.push(`views.setInt(R.id.${idName}, "setBackgroundColor", parseColorOr(${node.colorBindings.backgroundColor}, themeBackground(theme)))`);
        }
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
