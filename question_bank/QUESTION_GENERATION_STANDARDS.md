# Question Generation Standards and Guidelines

## Symbol Reference for Pattern Recognition Questions

### 📁 **Primary Symbol Source**

-   **File**: `question_bank/utils/pattern_recognition_symbols.json`
-   **Usage**: ALL pattern recognition, visual, and symbol-based questions MUST reference this file
-   **Updated**: 2025-10-01

### 🎯 **Available Symbol Categories**

#### **Circles** (10 symbols)

```
○ ● ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗
```

-   Empty circles: ○
-   Filled circles: ●
-   Half/quarter fills: ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗

#### **Squares** (6 symbols)

```
□ ■ ◻ ◼ ◽ ◾
```

-   Empty squares: □ ◻ ◽
-   Filled squares: ■ ◼ ◾

#### **Triangles** (8 symbols)

```
△ ▲ ▽ ▼ ◁ ◀ ▷ ▶
```

-   Empty: △ ▽
-   Filled: ▲ ▼
-   Directional: ◁ ◀ ▷ ▶ (left, left-filled, right, right-filled)

#### **Diamonds** (4 symbols)

```
◇ ◆ ◈ ◊
```

-   Empty: ◇ ◊
-   Filled: ◆ ◈

#### **Stars** (7 symbols)

```
☆ ★ ✩ ✪ ✭ ✮ ✯
```

-   Empty: ☆
-   Filled: ★
-   Variants: ✩ ✪ ✭ ✮ ✯

#### **Miscellaneous** (7 symbols)

```
● ◯ ⬤ ⯀ ❖ ⬟ ⬢
```

-   Special shapes for advanced patterns

## 📝 **Question Generation Guidelines**

### **Symbol Pattern Questions - MANDATORY REFERENCE**

When creating any pattern recognition questions involving symbols:

1. **Always check** `question_bank/utils/pattern_recognition_symbols.json` first
2. **Use consistent symbols** from the defined categories
3. **Reference by category** to ensure proper symbol selection
4. **Maintain symbol integrity** - don't mix incompatible symbols

### **Pattern Types to Implement**

#### **Easy Level**

-   Simple alternating patterns: ○ ● ○ ● ○ ?
-   Basic repeating: △ □ ○ △ □ ?
-   Two-symbol alternation: ☆ ★ ☆ ★ ☆ ?

#### **Medium Level**

-   Three-part repeating: ☆ ★ ✩ ☆ ★ ✩ ☆ ?
-   Growing groups: □ ■ □□ ■■ □□□ ?
-   Directional patterns: ▲ ▼ ◀ ▶ ▲ ▼ ? ▶

#### **Hard Level**

-   Complex alternating growth: ○ ● ○○ ●● ○○○ ●●● ○○○○ ?
-   Multi-rule patterns: △ □ ○ ▲ ■ ● △△ □□ ?
-   Advanced sequences with multiple symbol categories

## 🎨 **Visual Representation Standards**

### **Fraction Questions** (Future Implementation)

-   Use circle symbols for fraction visualization: ○ ● ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗
-   Half-filled: ◐ ◑ (different orientations for 1/2)
-   Quarter-filled: ◒ ◓ ◔ ◕ (different orientations for 1/4, 3/4)

### **Shape Property Questions**

-   Squares: □ ■ for basic properties
-   Triangles: △ ▲ for shape identification
-   Consistency in empty vs filled representation

### **Geometry and Measurement**

-   Use appropriate symbols for area counting (squares)
-   Directional arrows for measurement: ◀ ▶ ▲ ▼
-   Shape comparison using consistent symbol sets

## 🔧 **Implementation Instructions**

### **For AI Question Generation**

```
ALWAYS reference question_bank/utils/pattern_recognition_symbols.json when:
- Creating pattern recognition questions
- Implementing visual fraction questions
- Designing shape-based problems
- Building geometry questions with symbols
```

### **Quality Assurance**

-   ✅ Verify symbols exist in the reference file
-   ✅ Use consistent symbol categories
-   ✅ Maintain visual clarity and educational purpose
-   ✅ Test pattern recognition logic with chosen symbols

## 📚 **Grade-Specific Applications**

### **Grade 3**

-   Basic alternating patterns with 2 symbols
-   Simple shape recognition
-   Color pattern equivalents using symbols

### **Grade 4**

-   Complex pattern recognition with 3+ symbols
-   Growing patterns with visual symbols
-   Fraction representations using circle variants

### **Grade 5**

-   Advanced multi-rule patterns
-   Geometric transformations using directional symbols
-   Complex fraction and decimal visual representations

---

**Last Updated**: 2025-10-01  
**Version**: 1.0  
**Maintainer**: LS-AI-QUESTION-GEN Development Team

**🚨 IMPORTANT**: This file serves as the authoritative guide for all symbol usage in mathematical question generation. Always reference the symbols file before creating visual or pattern-based questions.
