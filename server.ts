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

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SIWARGA API is running" });
  });

  // S3 Multer Setup
  const upload = multer({
    storage: multerS3({
      s3: s3 as any,
      bucket: bucketName,
      acl: "public-read",
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
      },
    }),
  });

  // Auth Middleware
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

  // File Upload Route (AWS S3)
  app.post("/api/upload", authenticateToken, upload.single("file"), (req, res) => {
    const file = req.file as any;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // If CloudFront URL is provided, return CloudFront URL instead of direct S3 URL
    const fileUrl = cloudFrontUrl 
      ? `${cloudFrontUrl}/${file.key}` 
      : file.location;

    res.json({ 
      message: "File uploaded successfully to AWS S3", 
      url: fileUrl,
      key: file.key 
    });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, nik, phone } = req.body;
      
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { nik }] }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email atau NIK sudah terdaftar" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          nik,
          phoneNumber: phone,
          role: "WARGA"
        }
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
      if (!user) {
        return res.status(400).json({ message: "Email atau password salah" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Email atau password salah" });
      }

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

  // Master Data Routes
  app.get("/api/villages", authenticateToken, async (req, res) => {
    const villages = await prisma.village.findMany();
    res.json(villages);
  });

  // Letter Routes
  app.get("/api/letters", authenticateToken, async (req, res) => {
    const letters = await prisma.letter.findMany({
      include: { user: true, letterType: true },
    });
    res.json(letters);
  });

  app.post("/api/letters", authenticateToken, async (req: any, res: any) => {
    try {
      let { letterTypeId, villageId, attachments } = req.body;
      
      if (!villageId) {
        const v = await prisma.village.findFirst();
        villageId = v?.id;
      }
      if (!letterTypeId) {
        const l = await prisma.letterType.findFirst();
        letterTypeId = l?.id;
      }

      if (!villageId || !letterTypeId) {
        return res.status(400).json({ message: "Master data (Village/LetterType) is missing. Please run /api/seed first." });
      }

      const letter = await prisma.letter.create({
        data: {
          userId: req.user.id,
          letterTypeId,
          villageId,
          attachments,
          letterNumber: `SR-${Date.now()}`
        }
      });
      res.status(201).json(letter);
    } catch (error) {
      res.status(500).json({ message: "Failed to create letter", error });
    }
  });

  // Seeder endpoint (for demo purposes)
  app.post("/api/seed", async (req, res) => {
    try {
      const village = await prisma.village.create({
        data: {
          name: "Jati Warna",
          district: "Digital Valley",
          regency: "Cloud City",
        },
      });
      
      await prisma.letterType.createMany({
        data: [
          { name: "Surat Domisili", description: "Surat keterangan tempat tinggal" },
          { name: "Surat Usaha", description: "Surat izin usaha mikro kecil" },
          { name: "Surat Tidak Mampu", description: "Surat keterangan tidak mampu (SKTM)" },
        ],
      });

      await prisma.complaintCategory.createMany({
        data: [
          { name: "Jalan Rusak" },
          { name: "Sampah" },
          { name: "Lampu Jalan" },
          { name: "Banjir" },
        ]
      });

      res.json({ message: "Seeding successful" });
    } catch (error) {
      res.status(500).json({ error: "Seeding failed", details: error });
    }
  });

  // Complaint Routes
  app.get("/api/complaints", authenticateToken, async (req, res) => {
    const complaints = await prisma.complaint.findMany({
      include: { user: true, category: true, images: true },
    });
    res.json(complaints);
  });

  app.post("/api/complaints", authenticateToken, async (req: any, res: any) => {
    try {
      let { categoryId, villageId, title, description, location, images } = req.body;

      if (!villageId) {
        const v = await prisma.village.findFirst();
        villageId = v?.id;
      }
      if (!categoryId) {
        const c = await prisma.complaintCategory.findFirst();
        categoryId = c?.id;
      }

      if (!villageId || !categoryId) {
        return res.status(400).json({ message: "Master data (Village/Category) is missing. Please run /api/seed first." });
      }

      const complaint = await prisma.complaint.create({
        data: {
          userId: req.user.id,
          categoryId,
          villageId,
          title,
          description,
          location,
          images: {
            create: images ? images.map((url: string) => ({ url })) : []
          }
        }
      });
      res.status(201).json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to create complaint", error });
    }
  });

  // Serve uploaded files
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Vite middleware for development
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
