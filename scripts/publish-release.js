import fs from 'fs';
import path from 'path';

const REPO = 'Mugilan-a-git/jenkins-actions-demo';
const TOKEN = process.env.GH_TOKEN;
const TAG = process.env.RELEASE_TAG;

if (!TOKEN || !TAG) {
  console.error('Missing GH_TOKEN or RELEASE_TAG environment variables.');
  process.exit(1);
}

const distDir = path.resolve(process.cwd(), 'dist_electron');

async function uploadRelease() {
  console.log(`Fetching release ID for tag ${TAG}...`);
  let releaseResponse = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  let releaseData = await releaseResponse.json();

  if (releaseResponse.status === 404) {
    console.log(`Release ${TAG} not found. Creating it...`);
    const createResponse = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: TAG,
        name: TAG,
        draft: false,
        prerelease: false
      })
    });
    if (!createResponse.ok) {
      console.error('Failed to create release:', await createResponse.text());
      process.exit(1);
    }
    releaseData = await createResponse.json();
  } else if (!releaseResponse.ok) {
    console.error('Failed to fetch release:', releaseData);
    process.exit(1);
  }

  const uploadUrl = releaseData.upload_url.replace('{?name,label}', '');
  console.log(`Found release ID ${releaseData.id}. Upload URL: ${uploadUrl}`);

  const files = fs.readdirSync(distDir);
  const toUpload = files.filter(f => f.endsWith('.exe') || f.endsWith('.blockmap') || f === 'latest.yml');

  console.log('Files to upload:', toUpload);

  for (const file of toUpload) {
    // electron-builder replaces spaces with hyphens when generating latest.yml path
    const uploadName = file.replace(/ /g, '-');
    console.log(`Uploading ${file} as ${uploadName}...`);
    const filePath = path.join(distDir, file);
    const stat = fs.statSync(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (file.endsWith('.yml')) contentType = 'text/yaml';
    if (file.endsWith('.exe')) contentType = 'application/x-msdownload';

    const fileStream = fs.createReadStream(filePath);
    
    const response = await fetch(`${uploadUrl}?name=${uploadName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
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
      // If it says "already_exists", it's fine (just a warning)
      if (errorText.includes('already_exists')) {
        console.log(`Warning: ${file} already exists on the release. Skipping.`);
      } else {
        console.error(`Failed to upload ${file}:`, errorText);
        process.exit(1);
      }
    }
  }

  console.log('All files published successfully!');
}

uploadRelease().catch(err => {
  console.error(err);
  process.exit(1);
});
