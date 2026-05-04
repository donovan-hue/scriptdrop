import React, { useState } from 'react';

export default function VideoUploader({ onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      alert('Cloudinary no configurado en .env');
      setUploading(false);
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        setUploading(false);
        if (data.secure_url) onUploaded?.({ url: data.secure_url, publicId: data.public_id, type: 'video' });
      };
      xhr.onerror = () => { setUploading(false); alert('Error subiendo video'); };
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
      xhr.send(fd);
    } catch (err) {
      setUploading(false);
      alert(err.message);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} />
      {preview && <video src={preview} controls style={{ width: '100%', marginTop: 8, borderRadius: 8 }} />}
      {uploading && <div>Subiendo: {progress}%</div>}
    </div>
  );
}
