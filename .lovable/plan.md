

## Plan: Guest Family Grouping & Grouped Export

### Overview
Add a `family_group` column to the `guests` table so users can assign guests to family groups (e.g., "Família Silva", "Família Costa"). Then provide a grouped view and a PDF export option that lists guests organized by family.

### Database Change
- **Migration**: Add `family_group TEXT DEFAULT NULL` to the `guests` table. No RLS changes needed (existing policies cover all CRUD).

### Code Changes

#### 1. Guest Form — Add "Família" field
**File: `src/components/GuestManager.tsx`**
- Add `family_group` to `formData` state and the form UI (text input next to "Relação/Parentesco").
- Include `family_group` in insert/update payloads and in the `editGuest` population.

#### 2. Guest List Table — Add family column
**File: `src/components/GuestListManager.tsx`**
- Add an inline-editable "Família" column to the table (auto-save like other fields).
- Add a `filterFamily` dropdown populated from distinct family groups in the current guest list.

#### 3. Grouped View in GuestManager
**File: `src/components/GuestManager.tsx`**
- Add a toggle/tab "Ver por Família" that groups and renders guests by `family_group` (ungrouped guests shown under "Sem Família").

#### 4. PDF Export — Family-grouped option
**File: `src/utils/pdfExport.ts`**
- Create `exportGuestListByFamilyPDF()` that groups guests by `family_group`, rendering each family as a section header followed by its members in a table.
- Ungrouped guests listed under "Convidados Individuais".

#### 5. Export Options UI
**File: `src/components/GuestManager.tsx`**
- Replace the single export button with a dropdown offering:
  - "Exportar por Lado (Noivo/Noiva)" — existing export
  - "Exportar por Família" — new grouped export
- Both respect the Pro plan gate already in place.

#### 6. Types Update
**File: `src/types/guest.types.ts`**
- Add `family_group: string | null` to `Guest` interface and optional in `GuestCreate`.

### Technical Notes
- The `family_group` is a free-text field. An autocomplete suggestion list is derived from existing groups in the current wedding to encourage reuse.
- No new tables needed — a simple column addition keeps the schema simple.
- The bulk import (CSV) can optionally support a `Família` column.

