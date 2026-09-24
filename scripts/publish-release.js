import fs from 'fs';
import path from 'path';

// Change this to your actual Nexus repository URL if different
const NEXUS_BASE_URL = 'http://localhost:8081/repository/jenkins';
const NEXUS_USER = process.env.NEXUS_USER;
const NEXUS_PASS = process.env.NEXUS_PASS;
const TAG = process.env.RELEASE_TAG;

if (!NEXUS_USER || !NEXUS_PASS || !TAG) {
  console.error('Missing NEXUS_USER, NEXUS_PASS or RELEASE_TAG environment variables.');
  process.exit(1);
}

const distDir = path.resolve(process.cwd(), 'dist_electron');
const authHeader = 'Basic ' + Buffer.from(`${NEXUS_USER}:${NEXUS_PASS}`).toString('base64');

async function uploadRelease() {
  console.log(`Starting Nexus upload for tag ${TAG}...`);

  const files = fs.readdirSync(distDir);
  const toUpload = files.filter(f => f.endsWith('.exe') || f.endsWith('.blockmap') || f === 'latest.yml');

  console.log('Files to upload:', toUpload);

  for (const file of toUpload) {
    const uploadName = encodeURIComponent(file);
    console.log(`Uploading ${file}...`);
    const filePath = path.join(distDir, file);
    const stat = fs.statSync(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (file.endsWith('.yml')) contentType = 'text/yaml';
    if (file.endsWith('.exe')) contentType = 'application/x-msdownload';

    const fileStream = fs.createReadStream(filePath);
    const uploadUrl = `${NEXUS_BASE_URL}/${uploadName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': contentType,
        'Content-Length': stat.size
      },
      body: fileStream,
      duplex: 'half'
    });

    if (response.ok) {
      console.log(`Successfully uploaded ${file}`);
    } else {
      const errorText = await response.text();
      console.error(`Failed to upload ${file}. Status: ${response.status}`, errorText);
      process.exit(1);
    }
  }

  console.log('All files published successfully to Nexus!');
}

uploadRelease().catch(err => {
  console.error(err);
  process.exit(1);
});
