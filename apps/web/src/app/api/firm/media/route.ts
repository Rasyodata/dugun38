import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "firms");

// Firma fotoğrafı yükleme (çok parçalı). sharp ile yeniden boyutlandırılır.
export async function POST(req: Request) {
  try {
    const user = await requireRole("FIRM");
    const firm = await prisma.firmProfile.findUnique({ where: { userId: user.id }, include: { _count: { select: { media: true } } } });
    if (!firm) return fail("Önce firma profilinizi oluşturun", 400);
    if (firm._count.media >= 12) return fail("En fazla 12 fotoğraf yükleyebilirsiniz", 409);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Dosya bulunamadı", 400);
    if (file.size > MAX_BYTES) return fail("Dosya 8 MB'dan büyük olamaz", 413);
    if (!file.type.startsWith("image/")) return fail("Yalnızca görsel yükleyebilirsiniz", 415);

    const buf = Buffer.from(await file.arrayBuffer());
    // Yeniden boyutlandır + webp'e çevir (kapak boyutu)
    const out = await sharp(buf).rotate().resize(1600, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${firm.slug}-${randomBytes(6).toString("hex")}.webp`;
    await writeFile(path.join(UPLOAD_DIR, name), out);
    const url = `/uploads/firms/${name}`;

    const media = await prisma.media.create({
      data: { firmId: firm.id, url, alt: firm.businessName, sort: firm._count.media },
    });
    await audit("firm.media_upload", user.id, { firmId: firm.id, mediaId: media.id });
    return ok({ id: media.id, url }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
