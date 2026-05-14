/**
 * lib/db.ts
 *
 * Single place to swap the active repository.
 * Change `mockRepository` → `supabaseRepository` when ready.
 */

import { mockRepository } from "./linkRepository";

export const db = mockRepository;
