MIGRACIÓN: REMOVER "CLIENTES" → "RESIDENCIALES"
==================================================
Fecha: Junio 2026
Objetivo: Reemplazar todas las referencias a "client"/"clients"/"Client" 
          por "residencial"/"residenciales"/"Residencial"
Impacto: 63 archivos

====================================================================
 CONVENCIÓN DE NOMBRES
====================================================================
 client              → residencial        (singular)
 clients             → residenciales      (plural)
 IClient             → IResidencial       (interface)
 Client              → Residencial        (class)
 client_id           → residencial_id     (DB column)
 clientId            → residencialId      (TS field)
 CLIENTS_STACK       → RESIDENCIALES_STACK (route)
 getCatalog('client') → getCatalog('residencial')
 UI: "Cliente"       → "Residencial"
 UI: "Clientes"      → "Residenciales"

====================================================================
 NO RENOMBRAR — Stripe API
====================================================================
 ❌ clientSecret      → campo de Stripe, NO tocar
 ❌ paymentIntentClientSecret → Stripe, NO tocar

====================================================================
 MÓDULO clients/ (10 archivos)
====================================================================
 ☐ clients/stack/ClientStack.tsx            → residenciales/stack/ResidencialStack.tsx
 ☐ clients/stack/ClientsStack.tsx           → residenciales/stack/ResidencialesStack.tsx
 ☐ clients/service/client.service.ts        → residenciales/service/residencial.service.ts
 ☐ clients/service/client.types.ts          → residenciales/service/residencial.types.ts
 ☐ clients/type/client.types.ts             → eliminar (duplicado)
 ☐ clients/screens/ClientListScreen.tsx     → residenciales/screens/ResidencialListScreen.tsx
 ☐ clients/screens/ClientsScreen.tsx        → residenciales/screens/ResidencialesScreen.tsx
 ☐ clients/screens/ClientDetailScreen.tsx   → residenciales/screens/ResidencialDetailScreen.tsx
 ☐ clients/screens/CreateClientScreen.tsx   → residenciales/screens/CreateResidencialScreen.tsx
 ☐ clients/screens/ClientGuardsScreen.tsx   → residenciales/screens/ResidencialGuardsScreen.tsx
 ☐ clients/screens/ClientLocationsScreen.tsx → residenciales/screens/ResidencialLocationsScreen.tsx
 ☐ clients/screens/ClientZonesScreen.tsx    → residenciales/screens/ResidencialZonesScreen.tsx
 ☐ clients/modal/ClientLocationFormModal.tsx → residenciales/modal/ResidencialLocationFormModal.tsx
 ☐ clients/modal/ClientZoneFormModal.tsx    → residenciales/modal/ResidencialZoneFormModal.tsx
 ☐ clients/components/ClientFormStepper.tsx → residenciales/components/ResidencialFormStepper.tsx

====================================================================
 DB + SYNC (9 archivos — MIGRACIÓN PELIGROSA)
====================================================================
 ☐ schema.ts: tabla 'clients' → 'residenciales' + columna client_id en 7 tablas
 ☐ models/Client.ts → models/Residencial.ts
 ☐ models/index.ts: import Client → Residencial
 ☐ models/User.ts: @field('client_id') → 'residencial_id'
 ☐ models/Location.ts: same
 ☐ models/Round.ts: same
 ☐ models/Maintenance.ts: same
 ☐ models/Incident.ts: same
 ☐ models/RecurringConfiguration.ts: same
 ☐ sync.ts: LOCAL_TO_API_MAP clients:'client' → 'residenciales':'residencial'
              MODEL_TRANSLATIONS client:'Clientes' → 'Residenciales'
              tablesToCheck 'clients' → 'residenciales'

====================================================================
 NAVEGACIÓN (2 archivos)
====================================================================
 ☐ DrawerNavigator.tsx: import ClientStack → ResidencialStack
                         CLIENTS_STACK → RESIDENCIALES_STACK
                         CLIENTS_MAIN → RESIDENCIALES_MAIN
 ☐ DrawerContent.tsx:   label "Clientes" → "Residenciales"
                         route CLIENTS_STACK → RESIDENCIALES_STACK
                         screen CLIENTS_MAIN → RESIDENCIALES_MAIN

====================================================================
 RESIDENTS (2 archivos) ✅ YA HECHO
====================================================================
 ✅ residents.types.ts:      clientId, client → userId, houseId, isOwner
 ✅ ResidentListScreen.tsx:   loadClients, clientOptions, selectedClient → ELIMINADO
                              FormValues.clientId → ELIMINADO
                              filterBadges clientes → null
 ✅ ResidentDetailScreen.tsx: resident.name → resident.user?.name
                              resident.client?.name → resident.house.number

====================================================================
 PROPERTIES (3 archivos)
====================================================================
 ☐ properties.types.ts:   IClient import → IResidencial
                            clientId → residencialId
                            client → residencial
 ☐ properties.service.ts: clientId → residencialId
 ☐ PropertiesListScreen.tsx: clientOptions → residencialOptions
                              getCatalog('client') → getCatalog('residencial')
                              UI labels "Cliente" → "Residencial"

====================================================================
 ACCESSES (1 archivo)
====================================================================
 ☐ AccessesListScreen.tsx: getClients import → getResidenciales
                             IClient → IResidencial
                             clients → residenciales
                             loadClients → loadResidenciales

====================================================================
 FEES (1 archivo)
====================================================================
 ☐ FeesListScreen.tsx: getClients import → getResidenciales
                        clients → residenciales
                        loadClients → loadResidenciales

====================================================================
 RECURRING (3 archivos)
====================================================================
 ☐ recurring.types.ts:   clientId → residencialId
 ☐ RecurringListScreen.tsx: getClients import → getResidenciales
                             clients, appliedClientId, tempClientId → rename
 ☐ RecurringFormScreen.tsx: getClients import + selectedClientId → rename
                             label "Cliente Operativo" → "Residencial Operativa"

====================================================================
 LOCATIONS (3 archivos)
====================================================================
 ☐ location.service.ts: clientId → residencialId
 ☐ LocationsScreen.tsx: getClients import → getResidenciales
                          clients → residenciales
 ☐ LocationFormModal.tsx: getClients import → rename
                            error msg "El cliente es obligatorio" → "La residencial..."
                            clientId → residencialId
 ☐ BulkPrintModal.tsx: initialClientId → initialResidencialId

====================================================================
 GUARDS (2 archivos)
====================================================================
 ☐ GuardListScreen.tsx: getClients import → getResidenciales
                          appliedClientId → appliedResidencialId
 ☐ AssignmentModal.tsx:  getClients → getResidenciales

====================================================================
 ZONES (2 archivos)
====================================================================
 ☐ ZoneFormModal.tsx: getClients import → getResidenciales
                       error msg "Debes seleccionar un cliente" → rename
                       clients, IClient → rename
 ☐ ZonesScreen.tsx: getClients import → getResidenciales
                     clients → residenciales

====================================================================
 KARDEX (1 archivo)
====================================================================
 ☐ KardexScreen.tsx: clientsCatalog → residencialesCatalog
                      getCatalog('client') → getCatalog('residencial')
                      clientId → residencialId
                      style clientsScroll → residencialesScroll

====================================================================
 USERS (3 archivos)
====================================================================
 ☐ user.types.ts: IClient → IResidencial, clientId → residencialId
 ☐ UserFormScreen.tsx: clients → residenciales, getCatalog('client') → 'residencial'
                         preselectedClientId → preselectedResidencialId
 ☐ UserFormStepper.tsx: clients prop → residenciales
                          step "Cliente" → "Residencial"
                          styles clienteList, clientItem → residencial
 ☐ UserListItem.tsx: item.client?.name → item.residencial?.name

====================================================================
 REPORTS (3 archivos)
====================================================================
 ☐ reports.types.ts: clientId → residencialId
 ☐ reports.service.ts: clientId → residencialId
 ☐ ReportsListScreen.tsx: CLIENTS hardcoded → eliminar/dinámico
                           label "Cliente" → "Residencial"
                           clientId → residencialId

====================================================================
 HOME (4 archivos)
====================================================================
 ☐ HomeTypes.ts: client → residencial
 ☐ GuardDashboard.tsx: clients → residenciales
 ☐ round.service.ts: clientId → residencialId (12+ referencias)
 ☐ recurring.service.ts: clientId → residencialId
 ☐ home.service.ts: clientId → residencialId

====================================================================
 ASSIGNMENTS (3 archivos)
====================================================================
 ☐ MaintenanceReportScreen.tsx: clients, clientId, "El cliente es obligatorio" → rename
                                  getCatalog('client') → getCatalog('residencial')
 ☐ IncidentReportScreen.tsx: igual que MaintenanceReportScreen
 ☐ IncidentListScreen.tsx: clients, clientId, appliedClientId → rename

====================================================================
 MAINTENANCES (1 archivo)
====================================================================
 ☐ MaintenanceListScreen.tsx: clients, clientId, appliedClientId, getCatalog('client') → rename
                                item.client?.name → item.residencial?.name
                                label "Cliente" → "Residencial"

====================================================================
 RESUMEN FINAL (Junio 2026)
====================================================================
 ✅ Types (8 archivos)        — client.types, properties, users, recurring, home, reports
 ✅ Cross-module (26 archivos) — locations, zones, guards, fees, properties screens, 
                                  recurring screens, users screens, kardex, maintenances,
                                  assignments screens, home services
 ✅ Navegación (1 archivo)    — DrawerContent label
 ✅ Core (2 archivos)         — IUser.ts, user.slice.ts (clientId→residencialId)
 ✅ Incident detail (1)       — IncidentDetailScreen.tsx
 ✅ clients/ screens (10)     — UI labels, var names (exports sin renombrar)
 ✅ clients/ service (1)      — client.service.ts (nuevas funciones IResidencial)

 ⚠️  getCatalog('client') (3) — IncidentListScreen, MaintenanceReportScreen, 
                                  IncidentReportScreen. Pendiente hasta API rename.

 ⬜ DB/Sync (9 archivos)      — schema.ts, models/*, sync.ts. MIGRACIÓN PELIGROSA.
                                  Requiere: schema version bump + WatermelonDB migration.
                                  No hacer hasta coordinar con API rename.

 ⬜ Archivos de módulo clients/ — renombrar directorio y archivos. Import paths.
                                    Hacer al final después de estabilizar todo.

====================================================================
 TOTAL: 49/63 archivos migrados (78%)
====================================================================
