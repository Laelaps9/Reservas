#!/usr/bin/env node
//MISE description="Llena la tabla \"fechas\" con fechas"
import { db } from '../../server/utils/db.ts'

async function createDates(count: number): Promise<void> {
  for (let i = 1; i <= count; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    await db.query(
      `INSERT INTO fechas (id, estado, fecha)
       VALUES (?, 'disponible', ?)
       ON DUPLICATE KEY UPDATE estado = 'disponible'`,
      [i, date]
    )
  }

  console.log(`${count} fechas creadas`)
}

createDates(16)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
	process.exit(1)
})
