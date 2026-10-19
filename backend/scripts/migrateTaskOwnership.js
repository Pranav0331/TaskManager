import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';

async function runMigration() {
  console.log('=== STEP 1: VERIFYING BACKUP FILE ===');
  const backupPath = path.resolve('backups/taskflow_backup_2026-10-19T13-20-23-576Z.json');
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file does not exist at: ${backupPath}. Aborting migration immediately!`);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  if (backupData.collections?.users?.count !== 15 || backupData.collections?.tasks?.count !== 21) {
    throw new Error('Backup counts do not match expected records. Aborting migration immediately!');
  }
  console.log('✅ Backup verified successfully: 15 users, 21 tasks recorded.');

  console.log('\n=== STEP 2: CONNECTING TO MONGODB ===');
  await mongoose.connect(process.env.MONGODB_URI);

  const initialUserCount = await User.countDocuments();
  const initialTaskCount = await Task.countDocuments();
  console.log(`Current DB state: ${initialUserCount} users, ${initialTaskCount} tasks`);

  if (initialUserCount !== 15 || initialTaskCount !== 21) {
    throw new Error(`Unexpected record count in DB before migration: ${initialUserCount} users, ${initialTaskCount} tasks. Aborting!`);
  }

  const users = await User.find({}).lean();
  const userMap = new Map();
  users.forEach((u) => userMap.set(u._id.toString(), u));

  console.log('\n=== STEP 3: PERFORMING NON-DESTRUCTIVE BACKFILL ===');
  const allTasks = await Task.find({}).lean();

  let updatedCount = 0;
  let preservedOrphanCount = 0;

  for (const task of allTasks) {
    const userIdStr = task.userId ? task.userId.toString() : null;
    const owner = userIdStr ? userMap.get(userIdStr) : null;

    if (owner) {
      // Non-destructively set userEmail and userName
      await Task.updateOne(
        { _id: task._id },
        {
          $set: {
            userEmail: owner.email,
            userName: owner.name,
          },
        }
      );
      updatedCount++;
      console.log(`[UPDATED] Task "${task.title}" (${task._id}) -> set userEmail: ${owner.email}, userName: ${owner.name}`);
    } else {
      // Preserve orphaned task exactly as it is
      preservedOrphanCount++;
      console.log(`[PRESERVED] Orphaned Task "${task.title}" (${task._id}) with userId ${userIdStr} left completely untouched.`);
    }
  }

  console.log('\n=== STEP 4: VERIFYING POST-MIGRATION STATE ===');
  const postUserCount = await User.countDocuments();
  const postTaskCount = await Task.countDocuments();

  console.log(`Post-migration record counts: ${postUserCount} users, ${postTaskCount} tasks`);

  if (postUserCount !== 15 || postTaskCount !== 21) {
    throw new Error('FATAL: Record count changed after migration!');
  }

  const tasksWithEmail = await Task.countDocuments({ userEmail: { $ne: null } });
  const tasksWithoutEmail = await Task.countDocuments({ $or: [{ userEmail: null }, { userEmail: { $exists: false } }] });

  console.log(`Tasks with owner email: ${tasksWithEmail} (expected 17)`);
  console.log(`Orphaned tasks without owner email: ${tasksWithoutEmail} (expected 4)`);

  if (tasksWithEmail !== 17 || tasksWithoutEmail !== 4) {
    throw new Error('FATAL: Task update counts do not match expected 17 matched / 4 preserved!');
  }

  // Ensure indexes are synced
  await Task.syncIndexes();
  const indexes = await Task.collection.indexes();
  console.log('Synced Task collection indexes:', indexes.map((idx) => idx.name));

  console.log('\n🎉 Non-destructive migration completed and verified 100% successfully!');
  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
