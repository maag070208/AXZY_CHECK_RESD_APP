INVENTARIO DE MÓDULOS APP vs API
==================================
Generado: Junio 2026

====================================================================
 STATUS          | MÓDULO         | TYPES     | ENDPOINTS | NOTAS
====================================================================
 ✅ SYNCED       | users          | user.types.ts     |  8 | IUser, CreateUserDTO, UpdateUserDTO match API
 ✅ SYNCED       | assignments    | assignment.types  |  6 | IAssignment, AssignmentStatus match API
 ✅ SYNCED       | payments       | payments.types.ts | 14 | Recién reescrito. IPayment, IPaymentSummary OK
 ✅ SYNCED       | properties     | properties.types  |  5 | IProperty → /houses/* OK
 ✅ SYNCED       | clients        | client.types.ts   |  5 | IClient, IClientCreate OK

 ⚠️ PARTIAL      | home           | round.types.ts*   |  1+ | GET /home/stats sin tipo
 ⚠️ PARTIAL      | auth           | inline en service |  2 | UserLogin inline, falta TResultLogin
 ⚠️ PARTIAL      | check          | inline en service |  3 | KardexCreate inline, mucho any
 ⚠️ PARTIAL      | kardex         | inline en service |  7 | IKardexEntry coincide, sin archivo propio
 ⚠️ PARTIAL      | locations      | type/ (no service)|  7 | ILocation, ILocationCreate en carpeta no estándar
 ⚠️ PARTIAL      | rounds         | inline en service |  8 | IRound con id: number (API usa uuid)
 ⚠️ PARTIAL      | schedules      | inline en service |  6 | ISchedule simple, coincide
 ⚠️ PARTIAL      | residents      | residents.types   |  5 | Falta userId, houseId, isOwner
 ⚠️ PARTIAL      | reports        | reports.types.ts  |  7 | Tipos genéricos, no cubren las 7 respuestas
 ⚠️ PARTIAL      | settings       | settings.types.ts | 11 | Solo ICatalogOption, falta mucho

 ❌ BROKEN       | accesses       | accesses.types.ts |  5 | id: number, visitorName, reason → API: residentId, visitorId, type
 ❌ BROKEN       | complaints     | complaints.types  | 11 | id: number, subject → API: title, residentId
 ❌ BROKEN       | contacts       | contacts.types.ts |  5 | id: number, kinship → API: relationship, uuid
 ❌ BROKEN       | fees           | fees.types.ts     |  5 | URL: /fees/* → API: /payments/fees/*. id: number

 ❌ MISSING      | maintenances   | NO                |  7 | Sin types, puro any. Debug logs activos
 ❌ MISSING      | recurring      | NO                |  7 | Sin types, puro any
 ❌ MISSING      | guards         | NO                |  - | Reusa services de assignments/users
 ❌ MISSING      | profile        | NO                |  2 | Delega a core/services/UserService

====================================================================
 ENDPOINTS EXISTENTES EN API SIN PANTALLA EN APP
====================================================================
 - vehicles (5 endpoints)
 - visitors (5 endpoints)
 - incidents (7 endpoints)
 - notifications (6 endpoints)
 - access-logs (4 endpoints)
 - uploads (2 endpoints)

====================================================================
 RESUMEN
====================================================================
 Total módulos APP:  24
 Con types propios:  13/24 (54%)
 Synced al 100%:      5/24 (21%)
 Broken:              4/24 (17%)
 Missing:             4/24 (17%)
 Partial:            11/24 (46%)

====================================================================
 PRIORIDAD DE FIX
====================================================================
 1. maintenances  → CRASH, necesita types urgente
 2. fees          → URL incorrecta /fees/* vs /payments/fees/*
 3. accesses      → types legacy
 4. complaints    → types legacy
 5. contacts      → types legacy
 6. recurring     → missing types
