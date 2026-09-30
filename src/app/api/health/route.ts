import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, any> = {
    cwd: process.cwd(),
    dbUrl: process.env.DATABASE_URL,
    isVercel: !!process.env.VERCEL,
  };

  try {
    const prismaDir = path.join(process.cwd(), 'prisma');
    if (fs.existsSync(prismaDir)) {
      info.prismaDirFiles = fs.readdirSync(prismaDir);
    } else {
      info.prismaDirFiles = 'PRISMA_DIR_NOT_FOUND';
    }
  } catch (e: any) {
    info.prismaDirError = e.message;
  }

  try {
    const userCount = await prisma.user.count();
    const equipmentCount = await prisma.equipment.count();
    info.dbStatus = 'OK';
    info.userCount = userCount;
    info.equipmentCount = equipmentCount;
    return NextResponse.json({ ok: true, info });
  } catch (e: any) {
    info.dbStatus = 'ERROR';
    info.errorMessage = e.message;
    info.errorStack = e.stack;
    return NextResponse.json({ ok: false, info }, { status: 500 });
  }
}
