// scripts/promote.js
// Usage: node scripts/promote.js user@example.com
// This script will mark the user with the given email as isAdmin = true in the database.
// Run this locally from the project root after installing dependencies and running migrations.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/promote.js user@example.com')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found in DB. Make sure the user has signed in at least once via GitHub so a user row exists.')
    process.exit(1)
  }

  await prisma.user.update({ where: { email }, data: { isAdmin: true } })
  console.log(`Promoted ${email} to admin.`)
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
