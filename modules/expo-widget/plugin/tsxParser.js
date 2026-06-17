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

  // 3. Find the main JSX Tree and convert to XML Layout
  let xmlRoot = null;
  let dynamicIds = {}; // map of node path/index to generated Android ID
  let idCounter = 1;
  let clickHandlers = [];
  let kotlinLines = [];
  let kotlinImports = new Set(['android.view.View']);

  // Add standard padding and bg to root
  const rootAttrs = `xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp"
    android:background="#0c0c0c"
    android:orientation="vertical"`;

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

  function jsExprToString(node) {
    if (!node || node.type === 'JSXEmptyExpression') return '';
    if (node.type === 'StringLiteral') return node.value;
    if (node.type === 'NumericLiteral') return node.value.toString();
    if (node.type === 'Identifier') return `\${${node.name}}`;
    if (node.type === 'TemplateLiteral') {
      return node.quasis.map((q, i) => {
        let str = q.value.raw;
        if (i < node.expressions.length) {
          str += jsExprToString(node.expressions[i]);
        }
        return str;
      }).join('');
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      return jsExprToString(node.left) + jsExprToString(node.right);
    }
    if (node.type === 'LogicalExpression') {
      return jsExprToString(node.left) + " " + node.operator + " " + jsExprToString(node.right);
    }
    if (node.type === 'CallExpression') {
      // Very basic approximation for method calls
      if (node.callee.property && node.callee.property.name === 'toUpperCase') {
        return `\${${jsExprToString(node.callee.object)}.uppercase()}`;
      }
      return `\${${jsExprToString(node.callee.object)}}()`;
    }
    if (node.type === 'MemberExpression') {
      return `\${${jsExprToString(node.object)}.${node.property.name}}`;
    }
    return '';
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
       // Best effort for dynamic inline styles (e.g., isLed && {fontFamily: 'monospace'})
       // We'll just statically include the right side if it's an object
       const right = styleNode.type === 'LogicalExpression' ? styleNode.right : styleNode.consequent;
       if (right && right.type === 'ObjectExpression') {
         Object.assign(merged, resolveStyle(right));
       }
    }
    return merged;
  }

  function processJsxNode(node) {
    if (node.type === 'JSXText') {
      const text = node.value.replace(/\\s+/g, ' ').trim();
      if (!text) return null;
      return { tag: 'TextView', attrs: { 'android:text': `"${text}"`, 'android:layout_width': 'wrap_content', 'android:layout_height': 'wrap_content' }, children: [], isDynamic: false };
    }
    if (node.type === 'JSXExpressionContainer') {
      const exprString = jsExprToString(node.expression);
      if (!exprString) return null;
      return { tag: 'TextView', attrs: { 'android:layout_width': 'wrap_content', 'android:layout_height': 'wrap_content' }, children: [], isDynamic: true, dynamicText: exprString };
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
            
            // Map React Native Flexbox to Android LinearLayout
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
              if (resolved.justifyContent === 'space-between') attrs['android:gravity'] = 'center_vertical'; // Approximation
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
            if (attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'Identifier') {
              onPressAction = attr.value.expression.name;
              isDynamic = true;
            }
          }
        }
      });

      // Special Text children extraction
      let children = [];
      if (tag === 'TextView') {
        node.children.forEach(c => {
          if (c.type === 'JSXText') {
            dynamicText += c.value.replace(/\\s+/g, ' ').trim();
          } else if (c.type === 'JSXExpressionContainer') {
            dynamicText += jsExprToString(c.expression);
            isDynamic = true;
          }
        });
        if (dynamicText) {
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
    // fallback
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

  // Add the root xmlns
  xmlRoot.attrs['xmlns:android'] = 'http://schemas.android.com/apk/res/android';
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>\n` + generateXmlString(xmlRoot);

  // Kotlin Code Generation
  kotlinLines.push('super.populateViews(context, views, config, customs, theme, appWidgetId)');
  kotlinLines.push('val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)');
  kotlinImports.add('com.nothing.nosgallery.widget.NosWidgetPreferences');

  // Emit basic data types for any Store Variables found
  storeVars.forEach(v => {
    let ktType = 'String'; let ktDefault = '""';
    if (v.toLowerCase().includes('time') || v.toLowerCase().includes('elapsed')) { ktType = 'Long'; ktDefault = '0L'; }
    else if (v.toLowerCase().includes('running') || v.toLowerCase().includes('is') || v.toLowerCase().includes('active')) { ktType = 'Boolean'; ktDefault = 'false'; }
    else if (v.toLowerCase().includes('count') || v.toLowerCase().includes('index') || v.toLowerCase().includes('level') || v.toLowerCase().includes('usage') || v.toLowerCase().includes('goal') || v.toLowerCase().includes('intake')) { ktType = 'Int'; ktDefault = '0'; }
    
    let configFallback = `config?.opt${ktType}("${v}") ?: customs?.opt${ktType}("${v}") ?: ${ktDefault}`;
    kotlinLines.push(`val ${v} = dynamicState.opt${ktType}("${v}", ${configFallback})`);
  });

  // Track Kotlin node bindings
  function bindDynamicNodes(node) {
    if (node.isDynamic && node.attrs['android:id']) {
      const idName = node.attrs['android:id'].replace('@+id/', '');
      
      if (node.dynamicText) {
        // String replace to kotlin string template syntax
        let ktText = node.dynamicText.replace(/\$\{/g, '$').replace(/\}/g, '');
        // Hack for common js properties
        ktText = ktText.replace(/\.toUpperCase\(\)/g, '.uppercase()');
        ktText = ktText.replace(/Math\.round\(([^)]+)\)/g, '$1'); // simplify

        kotlinLines.push(`views.setTextViewText(R.id.${idName}, "${ktText}")`);
      }
      
      if (node.onPressAction) {
        // Auto convert JS camelCase handler (e.g., handleMusicPlay) to snake_case action name
        let actionName = node.onPressAction.replace(/^handle/, '');
        actionName = actionName.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (actionName.startsWith('_')) actionName = actionName.substring(1);
        
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
