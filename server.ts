import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3, bucketName, cloudFrontUrl } from "./src/lib/aws-config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── S3 Multer Setup ───────────────────────────────────
  const upload = multer({
    storage: multerS3({
      s3: s3 as any,
      bucket: bucketName,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
      },
    }),
  });

  // ─── Auth Middleware ───────────────────────────────────
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN_KELURAHAN') {
      return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat melakukan ini." });
    }
    next();
  };

  // ─── Health ────────────────────────────────────────────
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SIWARGA API is running" });
  });

  // ─── File Upload (S3) ─────────────────────────────────
  app.post("/api/upload", authenticateToken, upload.single("file"), (req: any, res: any) => {
    const file = req.file as any;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const fileUrl = cloudFrontUrl ? `${cloudFrontUrl}/${file.key}` : file.location;
    res.json({ message: "File uploaded successfully to AWS S3", url: fileUrl, key: file.key });
  });

  // ─── Auth Routes ──────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, nik, phone } = req.body;
      const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { nik }] } });
      if (existingUser) return res.status(400).json({ message: "Email atau NIK sudah terdaftar" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, nik, phoneNumber: phone, role: "WARGA" }
      });
      res.status(201).json({ message: "Registration successful", user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ message: "Email atau password salah" });
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: "Email atau password salah" });
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, nik: true, phoneNumber: true, address: true, createdAt: true }
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/auth/profile", authenticateToken, async (req: any, res: any) => {
    try {
      const { name, phoneNumber, address } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, phoneNumber, address },
        select: { id: true, name: true, email: true, role: true, nik: true, phoneNumber: true, address: true }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Gagal memperbarui profil" });
    }
  });

  app.put("/api/auth/password", authenticateToken, async (req: any, res: any) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ message: "User not found" });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: "Password lama salah" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
      res.json({ message: "Password berhasil diubah" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── Dashboard Stats ──────────────────────────────────
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res: any) => {
    try {
      const [totalUsers, totalLetters, totalComplaints, pendingLetters, pendingComplaints, recentLetters, recentComplaints] = await Promise.all([
        prisma.user.count(),
        prisma.letter.count(),
        prisma.complaint.count(),
        prisma.letter.count({ where: { status: "PENDING" } }),
        prisma.complaint.count({ where: { status: "PENDING" } }),
        prisma.letter.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true, letterType: true } }),
        prisma.complaint.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true, category: true } }),
      ]);

      // monthly stats for chart (last 6 months)
      const months: { name: string; surat: number; pengaduan: number }[] = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const [suratCount, pengaduanCount] = await Promise.all([
          prisma.letter.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
          prisma.complaint.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
        ]);
        months.push({ name: monthNames[d.getMonth()], surat: suratCount, pengaduan: pengaduanCount });
      }

      res.json({
        totalUsers, totalLetters, totalComplaints,
        pendingLetters, pendingComplaints,
        recentLetters, recentComplaints,
        monthlyStats: months
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ─── Master Data ──────────────────────────────────────
  app.get("/api/villages", authenticateToken, async (req, res) => {
    const villages = await prisma.village.findMany();
    res.json(villages);
  });

  app.get("/api/letter-types", authenticateToken, async (req, res) => {
    const types = await prisma.letterType.findMany({ orderBy: { name: 'asc' } });
    res.json(types);
  });

  app.get("/api/complaint-categories", authenticateToken, async (req, res) => {
    const categories = await prisma.complaintCategory.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  });

  // ─── Letter CRUD ──────────────────────────────────────
  app.get("/api/letters", authenticateToken, async (req: any, res: any) => {
    const where = req.user.role === 'WARGA' ? { userId: req.user.id } : {};
    const letters = await prisma.letter.findMany({
      where,
      include: { user: true, letterType: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(letters);
  });

  app.post("/api/letters", authenticateToken, async (req: any, res: any) => {
    try {
      let { letterTypeId, villageId, attachments } = req.body;
      if (!villageId) { const v = await prisma.village.findFirst(); villageId = v?.id; }
      if (!letterTypeId) { const l = await prisma.letterType.findFirst(); letterTypeId = l?.id; }
      if (!villageId || !letterTypeId) return res.status(400).json({ message: "Master data (Village/LetterType) is missing. Please run /api/seed first." });

      const letter = await prisma.letter.create({
        data: { userId: req.user.id, letterTypeId, villageId, attachments, letterNumber: `SR-${Date.now()}` }
      });
      res.status(201).json(letter);
    } catch (error) {
      res.status(500).json({ message: "Failed to create letter", error });
    }
  });

  app.put("/api/letters/:id/status", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { status, rejectionReason } = req.body;
      const letter = await prisma.letter.update({
        where: { id: req.params.id },
        data: { status, rejectionReason, processedAt: new Date(), processedBy: req.user.id }
      });
      res.json(letter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.delete("/api/letters/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      await prisma.letter.delete({ where: { id: req.params.id } });
      res.json({ message: "Surat berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus surat" });
    }
  });

  // ─── Complaint CRUD ───────────────────────────────────
  app.get("/api/complaints", authenticateToken, async (req: any, res: any) => {
    const where = req.user.role === 'WARGA' ? { userId: req.user.id } : {};
    const complaints = await prisma.complaint.findMany({
      where,
      include: { user: true, category: true, images: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(complaints);
  });

  app.post("/api/complaints", authenticateToken, async (req: any, res: any) => {
    try {
      let { categoryId, villageId, title, description, location, images } = req.body;
      if (!villageId) { const v = await prisma.village.findFirst(); villageId = v?.id; }
      if (!categoryId) { const c = await prisma.complaintCategory.findFirst(); categoryId = c?.id; }
      if (!villageId || !categoryId) return res.status(400).json({ message: "Master data (Village/Category) is missing. Please run /api/seed first." });

      const complaint = await prisma.complaint.create({
        data: {
          userId: req.user.id, categoryId, villageId, title, description, location,
          images: { create: images ? images.map((url: string) => ({ url })) : [] }
        }
      });
      res.status(201).json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to create complaint", error });
    }
  });

  app.put("/api/complaints/:id/status", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { status } = req.body;
      const complaint = await prisma.complaint.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.delete("/api/complaints/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      await prisma.complaintImage.deleteMany({ where: { complaintId: req.params.id } });
      await prisma.complaintComment.deleteMany({ where: { complaintId: req.params.id } });
      await prisma.complaintAssignment.deleteMany({ where: { complaintId: req.params.id } });
      await prisma.complaint.delete({ where: { id: req.params.id } });
      res.json({ message: "Pengaduan berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus pengaduan" });
    }
  });

  // ─── User Management (Admin) ──────────────────────────
  app.get("/api/users", authenticateToken, requireAdmin, async (req: any, res: any) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, nik: true, phoneNumber: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  });

  app.put("/api/users/:id/role", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { role } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, name: true, email: true, role: true }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengubah role" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      if (req.params.id === req.user.id) return res.status(400).json({ message: "Tidak bisa menghapus akun sendiri" });
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: "User berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus user" });
    }
  });

  // ─── Seed ─────────────────────────────────────────────
  app.post("/api/seed", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.upsert({
        where: { email: "admin@siwarga.com" },
        update: {},
        create: { email: "admin@siwarga.com", name: "Super Admin", password: hashedPassword, nik: "0000000000000000", phoneNumber: "080000000000", role: "SUPER_ADMIN" }
      });

      const existingVillage = await prisma.village.findFirst();
      if (!existingVillage) {
        await prisma.village.create({ data: { name: "Jati Warna", district: "Digital Valley", regency: "Cloud City" } });
      }

      const existingTypes = await prisma.letterType.findFirst();
      if (!existingTypes) {
        await prisma.letterType.createMany({
          data: [
            { name: "Surat Domisili", description: "Surat keterangan tempat tinggal" },
            { name: "Surat Usaha", description: "Surat izin usaha mikro kecil" },
            { name: "Surat Tidak Mampu", description: "Surat keterangan tidak mampu (SKTM)" },
            { name: "Surat Pengantar Nikah", description: "Surat pengantar untuk menikah" },
            { name: "Surat Pindah", description: "Surat keterangan pindah domisili" },
          ],
        });
      }

      const existingCats = await prisma.complaintCategory.findFirst();
      if (!existingCats) {
        await prisma.complaintCategory.createMany({
          data: [
            { name: "Jalan Rusak" },
            { name: "Sampah" },
            { name: "Lampu Jalan" },
            { name: "Banjir" },
            { name: "Infrastruktur" },
            { name: "Pelayanan Publik" },
          ]
        });
      }

      res.json({ message: "Seeding successful" });
    } catch (error) {
      res.status(500).json({ error: "Seeding failed", details: error });
    }
  });

  // ─── Serve files & Vite ───────────────────────────────
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
