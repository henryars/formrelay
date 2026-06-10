import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { NextResponse } from "next/server";

const PLUGIN_MAP: Record<string, { dir: string; zipName: string }> = {
  wordpress: {
    dir: path.join(process.cwd(), "integrations/wordpress/formrelay"),
    zipName: "formrelay-wordpress.zip",
  },
  elementor: {
    dir: path.join(process.cwd(), "integrations/elementor/formrelay-elementor"),
    zipName: "formrelay-elementor.zip",
  },
};

function addDirToZip(zip: JSZip, dirPath: string, zipFolder: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const zipPath = `${zipFolder}/${entry.name}`;
    if (entry.isDirectory()) {
      addDirToZip(zip, fullPath, zipPath);
    } else {
      zip.file(zipPath, fs.readFileSync(fullPath));
    }
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ plugin: string }> },
) {
  const { plugin } = await params;
  const entry = PLUGIN_MAP[plugin];

  if (!entry) {
    return NextResponse.json({ error: "Unknown plugin" }, { status: 404 });
  }

  if (!fs.existsSync(entry.dir)) {
    return NextResponse.json({ error: "Plugin files not found" }, { status: 500 });
  }

  const zip = new JSZip();
  // The top-level folder inside the zip matches what WordPress expects.
  const folderName = path.basename(entry.dir);
  addDirToZip(zip, entry.dir, folderName);

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${entry.zipName}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
