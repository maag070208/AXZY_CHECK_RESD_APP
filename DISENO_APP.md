# Diseño AXZY CHECK App — Moderno, Minimalista, Chingón

## Filosofía visual

"Clean slate — emerald edge". Fondo slate claro, bordes sutiles, acentos verde esmeralda. Sin ruido, sin sombras agresivas, sin gradientes innecesarios.

```
Paleta:
- Background:  #F8FAFC  (slate-50)
- Surface:     #FFFFFF  (blanco puro)
- Ink:         #0F172A  (slate-900)
- Secondary:   #64748B  (slate-500)
- Muted:       #94A3B8  (slate-400)
- Border:      #F1F5F9  (slate-100)
- Accent:      #10B981  (emerald-500)
- Danger:      #EF4444  (red-500)
- Warning:     #F59E0B  (amber-500)
```

## Layout general

```
┌─────────────────────────────────┐
│         Header (Stack)           │  ← solo back + título, centrado
├─────────────────────────────────┤
│                                 │
│         ScrollContent           │  ← padding lateral 16
│                                 │
│   ┌───────────────────────────┐ │
│   │       Hero / Header       │ │  ← Card modo elevated
│   ├───────────────────────────┤ │
│   │       Secciones           │ │  ← Card modo outlined
│   │                           │ │
│   │  Label         Valor      │ │  ← Row: label secondary, value right
│   │  Label         Valor      │ │
│   └───────────────────────────┘ │
│                                 │
│   ┌───────────────────────────┐ │
│   │       Sección 2           │ │
│   └───────────────────────────┘ │
│                                 │
│       [Action Buttons]          │  ← contained, outlined, text
│                                 │
└─────────────────────────────────┘
```

## Reglas de estilo

| Elemento | Regla |
|---|---|
| **Header (Stack)** | Solo back + título centrado. Sin sombra, sin borde inferior. Altura: 44 + safe area |
| **Cards** | `ITCard mode="elevated"` para hero, `mode="outlined"` para secciones. Sin padding global (lo da el content). Border radius 16 |
| **Badges** | `ITBadge` sin outline. Variantes: `success`, `warning`, `error`, `default`. `size="small"` siempre |
| **Filas (detail)** | Flex: label secondary (uppercase, tracking) a la izquierda, value ink (weight medium) a la derecha |
| **Botones** | `ITButton mode="contained"` para primarios, `mode="outlined"` para secundarios, `mode="text"` para destructivos. Full width en pantallas de detalle |
| **Skeletons** | Solo en listas (ITScreenDatatableLayout lo maneja). No en detail screens |
| **Spacing** | Scroll padding: 16. Separación entre secciones: 12. Separación entre rows: 6 |
| **Font** | Nunca usar hex en componentes. Constantes: `INK`, `SECONDARY`, `MUTED`, `SCREEN_BG` |
| **Mono** | IDs, folios, stripe IDs: `fontFamily: "monospace"`, `fontSize: 11` |
| **Loading** | Detail screens: `ActivityIndicator` + texto. No skeleton. No skeleton cards |

## Header pattern

```tsx
// EN EL STACK (PaymentsStack.tsx) — NUNCA dentro del componente
<Stack.Screen
  name="PaymentDetail"
  component={PaymentDetailScreen}
  options={({ navigation }) => ({
    header: () => (
      <HeaderBack navigation={navigation} title="Detalle del Pago" back={true} />
    ),
  })}
/>

// EN LA LISTA (cuando headerShown: false)
// <HeaderBack> va inline en el componente
```

## Estados

| Estado | UI |
|---|---|
| **Loading** | Centered `ActivityIndicator` + "Cargando..." |
| **Error** | Toast `type: "error"` + pantalla vacía con mensaje |
| **Offline (guard)** | Banner "Sin conexión" + SyncScreen en reconexión |
| **Offline (admin/res)** | Sin banner, sin redirect. No aplica offline |
| **Empty list** | Texto centrado en gris |

## Payments module — estructura

```
src/screens/payments/
├── screens/
│   ├── PaymentsListScreen.tsx     ← lista con filtros + summary
│   └── PaymentDetailScreen.tsx    ← detalle + pagar + descargar
├── service/
│   ├── payments.service.ts         ← endpoints API
│   └── payments.types.ts           ← tipos sincronizados con API
└── stack/
    └── PaymentsStack.tsx           ← navegación + headers
```

## Próximos módulos a refinar

- HomeScreen (resumen financiero + KPIs)
- Residents (detail + offline)
- Access passes (list + create)
- Profile (ver/stripe data)
