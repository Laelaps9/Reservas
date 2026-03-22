#!/usr/bin/env node
//MISE description="Fill DB table with seats"
import { db } from '../../server/utils/db.ts'

async function createSeats(count: number): Promise<void> {
  for (let i = 1; i <= count; i++) {
    await db.query(
      `INSERT INTO asientos (id, estado)
       VALUES (?, 'disponible')
       ON DUPLICATE KEY UPDATE estado = 'disponible', expira = NULL`,
      [i]
    )
  }

  console.log(`${count} asientos creados`)
}

createSeats(16)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
	process.exit(1)
})
